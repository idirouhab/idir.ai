'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Question = {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
};

type LeaderboardEntry = {
  username: string;
  score: number;
  total_questions: number;
  max_streak: number;
  completed_at: string;
};

export default function QuizGame() {
  const params = useParams();
  const locale = params.locale as string;

  const [username, setUsername] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [savingScore, setSavingScore] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('username, score, total_questions, max_streak, completed_at')
        .eq('language', locale)
        .order('score', { ascending: false })
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Save score to database
  const saveScore = async () => {
    if (!username || savingScore) return;

    setSavingScore(true);
    try {
      const { error } = await supabase
        .from('quiz_scores')
        .insert({
          username: username.trim(),
          score,
          total_questions: questions.length,
          max_streak: maxStreak,
          language: locale,
        });

      if (error) throw error;

      // Refresh leaderboard
      await fetchLeaderboard();
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setSavingScore(false);
    }
  };

  // Fetch questions from API
  const startGame = async () => {
    if (!username.trim() || username.trim().length < 2) {
      setError(locale === 'es' ? 'Por favor ingresa un nombre válido (mínimo 2 caracteres)' : 'Please enter a valid name (minimum 2 characters)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://idir-test.app.n8n.cloud/webhook/quiz?lang=${locale}`);

      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }

      const data = await response.json();
      setQuestions(data);
      setGameStarted(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(locale === 'es' ? 'Error al cargar el quiz. Intenta de nuevo.' : 'Failed to load quiz. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);

    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameFinished(true);
      saveScore();
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setGameFinished(false);
    setStreak(0);
    setMaxStreak(0);
    setUsername('');
    setError(null);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (locale === 'es') {
      if (percentage === 100) return "¡Perfecto! ¡Eres un experto en IA! 🏆";
      if (percentage >= 80) return "¡Excelente! ¡Dominas la IA! 🌟";
      if (percentage >= 60) return "¡Buen trabajo! ¡Sigue aprendiendo! 👍";
      if (percentage >= 40) return "¡No está mal! ¡Hay margen de mejora! 💪";
      return "¡Sigue estudiando! ¡Mejorarás! 📚";
    } else {
      if (percentage === 100) return "Perfect! You're an AI expert! 🏆";
      if (percentage >= 80) return "Excellent! You know your AI! 🌟";
      if (percentage >= 60) return "Good job! Keep learning! 👍";
      if (percentage >= 40) return "Not bad! Room for improvement! 💪";
      return "Keep studying! You'll get better! 📚";
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 5) return "🔥🔥🔥";
    if (streak >= 3) return "🔥🔥";
    if (streak >= 2) return "🔥";
    return "";
  };

  // Share functions
  const getQuizUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin + `/${locale}/quiz`;
    }
    return '';
  };

  const getShareText = (withScore = false) => {
    if (withScore && gameFinished) {
      const percentage = (score / questions.length) * 100;
      if (locale === 'es') {
        return `¡Acabo de conseguir ${score}/${questions.length} (${percentage.toFixed(0)}%) en el Desafío Quiz IA! 🤖 ¿Puedes superarme?`;
      }
      return `I just scored ${score}/${questions.length} (${percentage.toFixed(0)}%) on the AI Quiz Challenge! 🤖 Can you beat me?`;
    }
    if (locale === 'es') {
      return '¡Pon a prueba tus conocimientos de IA con este quiz! 🤖';
    }
    return 'Test your AI knowledge with this quiz! 🤖';
  };

  const shareOnX = () => {
    const text = encodeURIComponent(getShareText(gameFinished));
    const url = encodeURIComponent(getQuizUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = getQuizUrl();
    const text = `${getShareText(gameFinished)} ${url}`;
    const encodedText = encodeURIComponent(text);

    // Use LinkedIn's feed share format
    window.open(
      `https://www.linkedin.com/feed/?shareActive&mini=true&text=${encodedText}`,
      '_blank',
      'width=600,height=600'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getQuizUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Username Entry Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Link href={`/${locale}`} className="text-[#00ff88] hover:text-[#00cfff] text-sm font-bold uppercase mb-4 inline-block transition-colors">
              ← {locale === 'es' ? 'Volver al Inicio' : 'Back to Home'}
            </Link>
            <h1 className="text-5xl font-black uppercase mb-4 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055] bg-clip-text text-transparent">
              {locale === 'es' ? 'Desafío Quiz IA' : 'AI Quiz Challenge'}
            </h1>
            <p className="text-gray-400 text-lg">
              {locale === 'es' ? '¡Pon a prueba tus conocimientos de IA y compite en el ranking!' : 'Test your AI knowledge and compete on the leaderboard!'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Start Form */}
            <div className="border-2 border-[#00ff88] bg-gradient-to-br from-black via-[#00ff8805] to-black p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#00ff88]">
                {locale === 'es' ? '🎮 Comenzar Quiz' : '🎮 Start Quiz'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-bold uppercase text-gray-400 mb-2">
                    {locale === 'es' ? 'Tu Nombre' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && startGame()}
                    placeholder={locale === 'es' ? 'Ingresa tu nombre...' : 'Enter your name...'}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700 text-white font-bold focus:border-[#00ff88] focus:outline-none transition-colors"
                    maxLength={100}
                    disabled={loading}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-[#ff0055]">{error}</p>
                  )}
                </div>

                <button
                  onClick={startGame}
                  disabled={loading || !username.trim()}
                  className="w-full px-6 py-4 bg-[#00ff88] text-black font-bold text-lg uppercase hover:bg-[#00cfff] transition-all disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                      {locale === 'es' ? 'Cargando...' : 'Loading...'}
                    </span>
                  ) : (
                    <>🚀 {locale === 'es' ? 'Comenzar' : 'Start Game'}</>
                  )}
                </button>

                <div className="text-sm text-gray-500 text-center">
                  {locale === 'es'
                    ? '• Tu puntuación se guardará en el ranking'
                    : '• Your score will be saved to the leaderboard'}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="border-2 border-[#00cfff] bg-gradient-to-br from-black via-[#00cfff05] to-black p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#00cfff]">
                {locale === 'es' ? '🏆 Top 5 Ranking' : '🏆 Top 5 Leaderboard'}
              </h2>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const percentage = (entry.score / entry.total_questions) * 100;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-black border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-black ${index === 0 ? 'text-[#00ff88]' : index === 1 ? 'text-[#00cfff]' : index === 2 ? 'text-[#ff0055]' : 'text-gray-600'}`}>
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">{entry.username}</div>
                            <div className="text-xs text-gray-500">
                              {getStreakEmoji(entry.max_streak)} {entry.max_streak > 0 && `${entry.max_streak}x`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#00ff88]">
                            {entry.score}/{entry.total_questions}
                          </div>
                          <div className="text-xs text-gray-500">
                            {percentage.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {locale === 'es' ? '¡Sé el primero en jugar!' : 'Be the first to play!'}
                </div>
              )}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="max-w-2xl mx-auto">
            <div className="border border-gray-800 bg-gradient-to-br from-black via-[#ff005505] to-black p-6 text-center">
              <p className="text-sm text-gray-400 uppercase font-bold mb-4">
                {locale === 'es' ? '🔥 Comparte el desafío' : '🔥 Share the challenge'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={shareOnX}
                  className="px-6 py-3 bg-black hover:bg-gray-900 text-white font-bold uppercase transition-colors flex items-center gap-2 border-2 border-gray-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="px-6 py-3 bg-[#0077B5] hover:bg-[#006399] text-white font-bold uppercase transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>
                <button
                  onClick={copyLink}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {locale === 'es' ? '¡Copiado!' : 'Copied!'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {locale === 'es' ? 'Copiar Link' : 'Copy Link'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00ff88] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 uppercase font-bold tracking-wider">
            {locale === 'es' ? 'Cargando preguntas...' : 'Loading questions...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-4 text-[#ff0055]">
            {locale === 'es' ? '¡Ups! Algo salió mal' : 'Oops! Something went wrong'}
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleRestart}
            className="inline-block px-6 py-3 bg-[#00ff88] text-black font-bold uppercase hover:opacity-90 transition-opacity"
          >
            {locale === 'es' ? 'Intentar de nuevo' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameFinished) {
    const percentage = (score / questions.length) * 100;
    const userRank = leaderboard.findIndex(entry => entry.username === username && entry.score === score) + 1;

    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-[#00ff88] bg-gradient-to-br from-black via-[#00ff8805] to-black p-8 relative overflow-hidden">

            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#00ff88] opacity-5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#00cfff] opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">
                  {percentage === 100 ? "🏆" : percentage >= 80 ? "🌟" : percentage >= 60 ? "👍" : percentage >= 40 ? "💪" : "📚"}
                </div>
                <h1 className="text-4xl font-black uppercase mb-2 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055] bg-clip-text text-transparent">
                  {locale === 'es' ? '¡Quiz Completado!' : 'Quiz Complete!'}
                </h1>
                <p className="text-xl text-gray-400 font-bold">
                  {locale === 'es' ? 'Bien hecho' : 'Well done'}, {username}!
                </p>
              </div>

              {/* Score Display */}
              <div className="mb-8 text-center">
                <div className="inline-block bg-black border-2 border-[#00ff88] p-6 mb-4">
                  <div className="text-7xl font-black text-[#00ff88] mb-2">
                    {score}<span className="text-4xl text-gray-600">/{questions.length}</span>
                  </div>
                  <div className="text-xl text-gray-400 font-bold">
                    {percentage.toFixed(0)}% {locale === 'es' ? 'Correcto' : 'Correct'}
                  </div>
                </div>

                <div className="text-2xl font-bold mb-6 text-[#00cfff]">
                  {getScoreMessage()}
                </div>

                {/* Rank Display */}
                {userRank > 0 && (
                  <div className="mb-6 p-4 bg-[#00ff8810] border border-[#00ff88]">
                    <div className="text-sm text-gray-400 uppercase font-bold">
                      {locale === 'es' ? 'Tu Posición en el Ranking' : 'Your Leaderboard Rank'}
                    </div>
                    <div className="text-4xl font-black text-[#00ff88] mt-1">
                      #{userRank}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                  <div className="bg-[#00ff8810] border border-[#00ff88] p-4">
                    <div className="text-sm text-gray-400 uppercase font-bold mb-1">
                      {locale === 'es' ? 'Racha Máxima' : 'Best Streak'}
                    </div>
                    <div className="text-3xl font-black text-[#00ff88]">
                      {maxStreak} {getStreakEmoji(maxStreak)}
                    </div>
                  </div>
                  <div className="bg-[#ff005510] border border-[#ff0055] p-4">
                    <div className="text-sm text-gray-400 uppercase font-bold mb-1">
                      {locale === 'es' ? 'Incorrectas' : 'Incorrect'}
                    </div>
                    <div className="text-3xl font-black text-[#ff0055]">
                      {questions.length - score}
                    </div>
                  </div>
                </div>

                {savingScore && (
                  <div className="text-sm text-gray-500 mb-4">
                    {locale === 'es' ? 'Guardando puntuación...' : 'Saving score...'}
                  </div>
                )}
              </div>

              {/* Share Results */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 uppercase font-bold mb-4 text-center">
                  {locale === 'es' ? '🎉 Comparte tu puntuación' : '🎉 Share your score'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={shareOnX}
                    className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-bold uppercase transition-colors flex items-center gap-2 border-2 border-gray-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="px-5 py-2.5 bg-[#0077B5] hover:bg-[#006399] text-white text-sm font-bold uppercase transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                  <button
                    onClick={copyLink}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold uppercase transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {locale === 'es' ? '¡Copiado!' : 'Copied!'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {locale === 'es' ? 'Copiar' : 'Copy'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={handleRestart}
                  className="w-full px-6 py-4 bg-[#00ff88] text-black font-bold text-lg uppercase hover:bg-[#00cfff] transition-all transform hover:scale-105"
                >
                  {locale === 'es' ? '🔄 Jugar de Nuevo' : '🔄 Play Again'}
                </button>
                <Link
                  href={`/${locale}`}
                  className="block w-full px-6 py-4 border-2 border-gray-700 text-gray-300 font-bold text-lg uppercase hover:border-[#00ff88] hover:text-[#00ff88] transition-all text-center"
                >
                  {locale === 'es' ? '← Volver al Inicio' : '← Back to Home'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Link href={`/${locale}`} className="text-[#00ff88] hover:text-[#00cfff] text-sm font-bold uppercase inline-block transition-colors">
                ← {locale === 'es' ? 'Salir' : 'Exit'}
              </Link>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 uppercase font-bold">
                {locale === 'es' ? 'Jugador' : 'Player'}
              </div>
              <div className="text-lg font-black text-[#00ff88]">{username}</div>
            </div>
          </div>

          <h1 className="text-3xl font-black uppercase text-center mb-2 bg-gradient-to-r from-[#00ff88] to-[#00cfff] bg-clip-text text-transparent">
            {locale === 'es' ? 'Desafío Quiz IA' : 'AI Quiz Challenge'}
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-bold uppercase mb-2">
            <span className="text-gray-500">
              {locale === 'es' ? 'Pregunta' : 'Question'} {currentQuestion + 1} {locale === 'es' ? 'de' : 'of'} {questions.length}
            </span>
            <div className="flex items-center gap-4">
              {streak >= 2 && (
                <span className="text-[#ff0055] animate-pulse">
                  {getStreakEmoji(streak)} {streak}x
                </span>
              )}
              <span className="text-[#00ff88]">
                {locale === 'es' ? 'Puntos' : 'Score'}: {score}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-900 h-3 border-2 border-gray-800 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cfff] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="border-2 border-gray-800 bg-gradient-to-br from-black to-[#00ff8805] p-6 sm:p-8 mb-6 relative overflow-hidden transform transition-all duration-300 hover:border-gray-700">

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#00ff88] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#00cfff] opacity-30"></div>

          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white leading-relaxed">
            {question.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correct;
              const showResult = showExplanation;

              let className = "w-full text-left p-4 border-2 transition-all font-bold relative overflow-hidden group ";

              if (!showResult) {
                className += isSelected
                  ? "border-[#00ff88] bg-[#00ff8815] text-white shadow-lg shadow-[#00ff8820]"
                  : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900";
              } else {
                if (isCorrect) {
                  className += "border-[#00ff88] bg-[#00ff8820] text-[#00ff88] animate-pulse-slow";
                } else if (isSelected && !isCorrect) {
                  className += "border-[#ff0055] bg-[#ff005520] text-[#ff0055]";
                } else {
                  className += "border-gray-800 text-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={className}
                >
                  <span className="mr-3 text-sm opacity-60 font-black">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                  {showResult && isCorrect && <span className="ml-2 text-2xl">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="ml-2 text-2xl">✗</span>}

                  {!showResult && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className="mt-6 p-5 bg-[#00cfff10] border-2 border-[#00cfff] relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00cfff]"></div>
              <div className="text-sm font-black uppercase text-[#00cfff] mb-2 flex items-center gap-2">
                💡 {locale === 'es' ? 'Explicación' : 'Explanation'}
              </div>
              <div className="text-sm text-gray-300 leading-relaxed">{question.explanation}</div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6">
            {!showExplanation ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full px-6 py-4 bg-[#00ff88] text-black font-bold text-lg uppercase hover:bg-[#00cfff] transition-all disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
              >
                {locale === 'es' ? '✓ Enviar Respuesta' : '✓ Submit Answer'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full px-6 py-4 bg-[#00cfff] text-black font-bold text-lg uppercase hover:bg-[#00ff88] transition-all transform hover:scale-105"
              >
                {currentQuestion < questions.length - 1
                  ? (locale === 'es' ? '→ Siguiente Pregunta' : '→ Next Question')
                  : (locale === 'es' ? '→ Ver Resultados' : '→ See Results')
                }
              </button>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center text-sm text-gray-500 font-bold">
          {score} {locale === 'es' ? 'respuesta' : 'answer'}{score !== 1 ? 's' : ''} {locale === 'es' ? 'correcta' : 'correct'}{score !== 1 ? (locale === 'es' ? 's' : 's') : ''} {locale === 'es' ? 'hasta ahora' : 'so far'}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
