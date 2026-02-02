'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle } from 'lucide-react';
import { TestData, Question, TestResults, FeedbackResponse } from './types';
import RegistrationScreen from './components/RegistrationScreen';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionRenderer from './components/QuestionRenderer';
import FeedbackPanel from './components/FeedbackPanel';
import ResultsScreen from './components/ResultsScreen';

// Styling constants
const ACCENT = '#11b981';
const SECOND_ACCENT = '#0055ff';

// Background wrapper component
const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-[#11b98130]">
    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ backgroundColor: ACCENT }} />
    <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ backgroundColor: SECOND_ACCENT }} />
    <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
      {children}
    </div>
  </div>
);

export default function AutomationTest() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('automationTest');

  // Core test state
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackResponse | null>(null);
  const [testFinished, setTestFinished] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Score tracking
  const [score, setScore] = useState(0);

  // Handle registration completion
  const handleRegistrationComplete = (userInfo: { name: string; email: string }) => {
    setUserData(userInfo);
    setRegistrationComplete(true);
  };

  // Start test - fetch questions
  const startTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automation-test?action=questions');

      if (!response.ok) {
        throw new Error('Failed to load test questions');
      }

      const data: TestData = await response.json();
      setTestData(data);
      setTestStarted(true);
    } catch (err) {
      console.error('Error loading test:', err);
      setError(t('test.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for current question
  const submitAnswer = async () => {
    if (!testData || !currentAnswer) return;

    const currentQuestion = testData.questions[currentQuestionIndex];

    setSubmitting(true);
    setError(null);

    try {
      // Submit to API for evaluation
      const response = await fetch('/api/automation-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const feedback: FeedbackResponse = await response.json();

      // Update score
      if (feedback.correct) {
        setScore(prev => prev + feedback.pointsEarned);
      }

      // Save answer
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer,
      }));

      // Show feedback
      setCurrentFeedback(feedback);
      setShowFeedback(true);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Skip current question
  const handleSkip = () => {
    if (!testData) return;

    const currentQuestion = testData.questions[currentQuestionIndex];

    // Mark question as skipped
    setSkippedQuestions(prev => new Set([...prev, currentQuestion.id]));

    // Move to next question or finish test
    if (currentQuestionIndex + 1 >= testData.questions.length) {
      finishTest();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(null);
    }
  };

  // Move to next question or finish test
  const handleNext = () => {
    if (!testData) return;

    setShowFeedback(false);
    setCurrentFeedback(null);
    setCurrentAnswer(null);

    // Check if this was the last question
    if (currentQuestionIndex + 1 >= testData.questions.length) {
      finishTest();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Finish test and calculate results
  const finishTest = async () => {
    if (!testData || !userData) return;

    setSubmitting(true);

    try {
      // Submit all answers for final scoring with user data
      const response = await fetch('/api/automation-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          answers: userAnswers,
          finalScore: score,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get results');
      }

      const results: TestResults = await response.json();
      setTestResults(results);
      setTestFinished(true);
    } catch (err) {
      console.error('Error getting results:', err);
      // Fallback: calculate results client-side
      calculateResultsClientSide();
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback: Calculate results on client side
  const calculateResultsClientSide = () => {
    if (!testData) return;

    const maxScore = testData.assessment.totalPoints;
    const percentage = (score / maxScore) * 100;

    // Find level
    const level = testData.scoring.levels.find(
      l => score >= l.minScore && score <= l.maxScore
    ) || testData.scoring.levels[0];

    // Calculate section breakdown
    const breakdown = testData.sections.map(section => {
      const sectionQuestions = testData.questions.filter(q => q.sectionId === section.id);
      const sectionMaxScore = sectionQuestions.reduce((sum, q) => sum + q.points, 0);
      // For simplicity, assume proportional score
      const sectionScore = Math.round((score / maxScore) * sectionMaxScore);

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        score: sectionScore,
        maxScore: sectionMaxScore,
      };
    });

    const results: TestResults = {
      score,
      maxScore,
      percentage,
      level,
      breakdown,
    };

    setTestResults(results);
    setTestFinished(true);
  };

  // Restart test (goes back to registration)
  const restartTest = () => {
    setRegistrationComplete(false);
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setTestData(null);
    setUserData(null);
    setUserAnswers({});
    setSkippedQuestions(new Set());
    setCurrentAnswer(null);
    setShowFeedback(false);
    setCurrentFeedback(null);
    setTestFinished(false);
    setTestResults(null);
    setScore(0);
    setError(null);
  };

  // Check if answer is valid for submission
  const isAnswerValid = useCallback(() => {
    if (!testData || !currentAnswer) return false;

    const currentQuestion = testData.questions[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'yes_no':
      case 'multiple_choice':
        return currentAnswer !== null && currentAnswer !== '';

      case 'text':
        if (currentQuestion.type === 'text') {
          // Only check max length, no minimum required
          return currentAnswer.length <= currentQuestion.maxLength;
        }
        return false;

      case 'code':
        return currentAnswer.code && currentAnswer.code.trim().length > 0;

      default:
        return false;
    }
  }, [testData, currentAnswer, currentQuestionIndex]);

  // Render loading state
  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-t-transparent border-[#11b981] rounded-full animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">
            {t('test.loadingQuestions')}
          </p>
        </div>
      </BackgroundWrapper>
    );
  }

  // Render error state
  if (error && !testStarted) {
    return (
      <BackgroundWrapper>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="max-w-md bg-[#0f0f0f] border-2 border-[#ef4444] rounded-3xl p-8 text-center">
            <XCircle size={48} className="text-[#ef4444] mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-3 text-white">ERROR</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-[#11b981] transition-all"
            >
              RETRY
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // Render results screen
  if (testFinished && testResults && testData) {
    return (
      <BackgroundWrapper>
        <ResultsScreen
          results={testResults}
          sections={testData.sections}
          onRestart={restartTest}
          locale={locale}
          t={t}
        />
      </BackgroundWrapper>
    );
  }

  // Render registration screen
  if (!registrationComplete) {
    return (
      <BackgroundWrapper>
        <RegistrationScreen
          onContinue={handleRegistrationComplete}
          locale={locale}
          t={t}
        />
      </BackgroundWrapper>
    );
  }

  // Render welcome screen
  if (!testStarted || !testData) {
    return (
      <BackgroundWrapper>
        <WelcomeScreen
          assessment={testData?.assessment || {
            id: '',
            title: t('title'),
            description: t('meta.description'),
            estimatedTime: '20-30 minutes',
            totalPoints: 50,
            version: '2.0',
          }}
          sections={testData?.sections || []}
          userName={userData?.name.split(' ')[0] || ''}
          onStart={startTest}
          loading={loading}
          t={t}
        />
      </BackgroundWrapper>
    );
  }

  // Render test screen
  const currentQuestion = testData.questions[currentQuestionIndex];
  const currentSection = testData.sections.find(s => s.id === currentQuestion.sectionId);
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

  return (
    <BackgroundWrapper>
      <div className="flex-1 flex flex-col">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                {t('test.question')} {currentQuestionIndex + 1} / {testData.questions.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('test.section')}: {currentSection?.title} • {currentSection?.difficulty}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{score}</p>
              <p className="text-xs text-gray-500">POINTS</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#11b981] to-[#0055ff] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed flex-1">
              {currentQuestion.question}
            </h2>
            <span className="text-xs font-black text-[#11b981] ml-4 flex-shrink-0">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'PT' : 'PTS'}
            </span>
          </div>

          {/* Question component */}
          <QuestionRenderer
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
          />
        </div>

        {/* Feedback panel (shown after submitting) */}
        {showFeedback && currentFeedback && (
          <FeedbackPanel
            correct={currentFeedback.correct}
            explanation={currentFeedback.explanation}
            pointsEarned={currentFeedback.pointsEarned}
            totalPoints={currentQuestion.points}
            onNext={handleNext}
            t={t}
          />
        )}

        {/* Submit and Skip buttons (shown before submitting) */}
        {!showFeedback && (
          <div className="space-y-3">
            <button
              onClick={submitAnswer}
              disabled={!isAnswerValid() || submitting}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-[#11b981] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin" />
                  SUBMITTING...
                </span>
              ) : (
                t('test.submitAnswer')
              )}
            </button>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full py-4 bg-[#0f0f0f] border-2 border-gray-800 text-gray-400 font-bold uppercase tracking-widest rounded-2xl hover:border-gray-700 hover:text-gray-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('test.skipQuestion')}
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-[#ef444410] border border-[#ef4444] rounded-xl">
            <p className="text-sm text-[#ef4444]">{error}</p>
          </div>
        )}
      </div>
    </BackgroundWrapper>
  );
}
