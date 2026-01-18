'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import {
    Trophy,
    Flame,
    Timer,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    RotateCcw,
    Home,
    Check,
    Zap,
    Play,
    Info,
    Award,
    ExternalLink,
    BarChart3,
    Linkedin,
    Twitter
} from 'lucide-react';

// --- STYLING CONSTANTS ---
const ACCENT = '#11b981';
const SECOND_ACCENT = '#0055ff';

// --- TYPES ---
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
    final_score: number;
    total_time_seconds: number;
};

// --- HELPER COMPONENTS ---

const TechGraphic = () => (
    <div className="flex gap-1 items-end opacity-20">
        {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="w-1.5 rounded-full" style={{ height: `${12 + Math.random() * 20}px`, backgroundColor: i === 4 ? ACCENT : '#666' }} />
        ))}
    </div>
);

const BackgroundWrapper = ({
                               children,
                               levelUpActive,
                               locale,
                               t
                           }: {
    children: React.ReactNode;
    levelUpActive: 'halfway' | 'complete' | null;
    locale: string;
    t: any;
}) => (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-[#11b98130]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ backgroundColor: ACCENT }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ backgroundColor: SECOND_ACCENT }} />

        {levelUpActive && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500">
                <div className="flex flex-col items-center animate-bounce-short">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 blur-2xl opacity-50 bg-[#11b981]" />
                        {levelUpActive === 'halfway' ? <Zap size={80} className="text-[#11b981] relative" fill="currentColor" /> : <Award size={80} className="text-[#11b981] relative" />}
                    </div>
                    <h2 className="text-5xl font-black tracking-widest uppercase italic bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        {levelUpActive === 'halfway' ? t('levelUp') : t('finalStretch')}
                    </h2>
                    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#11b981] to-transparent mt-6 animate-scan-line" />
                </div>
            </div>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
            {children}
        </div>

        <style jsx global>{`
            @keyframes scan-line {
                0% { transform: translateY(-20px); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(20px); opacity: 0; }
            }
            @keyframes bounce-short {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .animate-scan-line { animation: scan-line 1.5s linear infinite; }
            .animate-bounce-short { animation: bounce-short 2s ease-in-out infinite; }
        `}</style>
    </div>
);

export default function QuizGame() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('quiz');

    const [username, setUsername] = useState('');
    const [difficulty, setDifficulty] = useState<'low' | 'medium' | 'high'>('medium');
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
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
    const [lastQuestionTime, setLastQuestionTime] = useState(0);
    const [lastTimeBonus, setLastTimeBonus] = useState(0);
    const [levelUpActive, setLevelUpActive] = useState<'halfway' | 'complete' | null>(null);

    // --- LOGIC ---

    const fetchLeaderboard = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('quiz_scores')
                .select('username, score, total_questions, max_streak, completed_at, final_score, total_time_seconds')
                .eq('language', locale)
                .order('final_score', { ascending: false })
                .limit(50);

            if (error) throw error;

            const uniquePlayerScores = new Map<string, LeaderboardEntry>();
            (data || []).forEach(entry => {
                const key = entry.username.toLowerCase();
                if (!uniquePlayerScores.has(key) || entry.final_score > (uniquePlayerScores.get(key)?.final_score || 0)) {
                    uniquePlayerScores.set(key, entry);
                }
            });
            setLeaderboard(Array.from(uniquePlayerScores.values()).slice(0, 5));
        } catch (err) {
            console.error('Leaderboard error:', err);
        }
    }, [locale]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => {
        if (!gameStarted || gameFinished || showExplanation || questionStartTime === 0) return;
        const interval = setInterval(() => {
            setCurrentQuestionTime(Math.floor((Date.now() - questionStartTime) / 1000));
        }, 100);
        return () => clearInterval(interval);
    }, [gameStarted, gameFinished, showExplanation, questionStartTime]);

    useEffect(() => {
        const halfway = Math.floor(questions.length / 2);
        if (gameStarted && currentQuestion + 1 === halfway && !showExplanation) {
            setLevelUpActive('halfway');
            setTimeout(() => setLevelUpActive(null), 2000);
        }
        if (gameStarted && currentQuestion + 1 === questions.length && showExplanation) {
            setLevelUpActive('complete');
            setTimeout(() => setLevelUpActive(null), 2500);
        }
    }, [currentQuestion, showExplanation, gameStarted, questions.length]);

    const calculateTimeBonus = (timeInMs: number): number => {
        const seconds = timeInMs / 1000;
        if (seconds <= 3) return Math.floor(500 - (seconds * 50));
        if (seconds <= 8) return Math.floor(350 - ((seconds - 3) * 50));
        if (seconds <= 15) return Math.floor(100 - ((seconds - 8) * 10));
        return Math.max(0, Math.floor(30 - ((seconds - 15) * 2)));
    };

    const startGame = async () => {
        if (!username.trim() || username.trim().length < 2) {
            setError(t('enterValidName'));
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`https://idir-test.app.n8n.cloud/webhook/quiz?lang=${locale}&count=8&level=${difficulty}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setQuestions(data);
            setGameStarted(true);
            setQuestionStartTime(Date.now());
            setLoading(false);
        } catch (err) {
            setError(t('errorLoading'));
            setLoading(false);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;
        const timeElapsedMs = Date.now() - questionStartTime;
        const timeElapsedSeconds = Math.floor(timeElapsedMs / 1000);

        setTotalTimeSeconds(prev => prev + timeElapsedSeconds);
        setLastQuestionTime(timeElapsedSeconds);
        setShowExplanation(true);

        if (selectedAnswer === questions[currentQuestion].correct) {
            const timeBonus = calculateTimeBonus(timeElapsedMs);
            setLastTimeBonus(timeBonus);
            setScore(prev => prev + 1);
            setFinalScore(prev => prev + (1000 + timeBonus));
            setStreak(prev => prev + 1);
            setMaxStreak(prev => Math.max(prev, streak + 1));
        } else {
            setLastTimeBonus(0);
            setStreak(0);
        }
    };

    const saveScore = useCallback(async () => {
        if (!username || savingScore) return;
        setSavingScore(true);
        try {
            await supabase.from('quiz_scores').insert({
                username: username.trim(),
                score,
                total_questions: questions.length,
                max_streak: maxStreak,
                language: locale,
                total_time_seconds: totalTimeSeconds + lastQuestionTime,
                final_score: finalScore,
            });
            await fetchLeaderboard();
        } catch (err) {
            console.error('Save score error:', err);
        } finally {
            setSavingScore(false);
        }
    }, [username, savingScore, score, questions.length, maxStreak, locale, totalTimeSeconds, lastQuestionTime, finalScore, fetchLeaderboard]);

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
            setQuestionStartTime(Date.now());
            setCurrentQuestionTime(0);
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
        setTotalTimeSeconds(0);
        setFinalScore(0);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.origin + `/${locale}/quiz`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getShareText = (withScore = false, includeRank = false) => {
        if (withScore && gameFinished) {
            const percentage = (score / questions.length) * 100;
            const userRank = leaderboard.findIndex(entry => entry.username === username && entry.final_score === finalScore) + 1;

            if (locale === 'es') {
                let text = `¡Acabo de conseguir ${finalScore.toLocaleString()} puntos en el Desafío Quiz IA! 🤖`;
                if (includeRank && userRank > 0 && userRank <= 5) {
                    text = `🏆 ¡Estoy en el puesto #${userRank} del ranking con ${finalScore.toLocaleString()} puntos en el Desafío Quiz IA! 🤖`;
                }
                text += `\n\n📊 ${score}/${questions.length} correctas (${percentage.toFixed(0)}%)`;
                text += `\n⏱️ ${Math.floor(totalTimeSeconds / 60)}:${(totalTimeSeconds % 60).toString().padStart(2, '0')}`;
                text += `\n\n¿Puedes superarme? 🚀`;
                return text;
            }

            let text = `I just scored ${finalScore.toLocaleString()} points on the AI Quiz Challenge! 🤖`;
            if (includeRank && userRank > 0 && userRank <= 5) {
                text = `🏆 I'm ranked #${userRank} with ${finalScore.toLocaleString()} points on the AI Quiz Challenge! 🤖`;
            }
            text += `\n\n📊 ${score}/${questions.length} correct (${percentage.toFixed(0)}%)`;
            text += `\n⏱️ ${Math.floor(totalTimeSeconds / 60)}:${(totalTimeSeconds % 60).toString().padStart(2, '0')}`;
            text += `\n\nCan you beat me? 🚀`;
            return text;
        }
        return locale === 'es' ? '¡Pon a prueba tus conocimientos de IA con este quiz! 🤖' : 'Test your AI knowledge with this quiz! 🤖';
    };

    const shareOnLinkedIn = () => {
        const url = window.location.origin + `/${locale}/quiz`;
        const text = `${getShareText(gameFinished, true)}\n\n${url}`;
        window.open(`https://www.linkedin.com/feed/?shareActive&mini=true&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=600');
    };

    const shareOnX = () => {
        const text = encodeURIComponent(getShareText(gameFinished, true));
        const url = window.location.origin + `/${locale}/quiz`;
        window.open(`https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
    // --- SCREENS ---

    if (loading) return (
        <BackgroundWrapper levelUpActive={null} locale={locale} t={t}>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-t-transparent border-[#11b981] rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">{t('loadingQuestions')}</p>
            </div>
        </BackgroundWrapper>
    );

    if (!gameStarted) return (
        <BackgroundWrapper levelUpActive={null} locale={locale} t={t}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div className="flex flex-col">
                    <div className="text-xl font-bold tracking-tighter mb-4">idir<span style={{ color: ACCENT }}>.ai</span></div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                </div>
                <div className="px-4 py-1.5 rounded-full border border-[#11b98130] bg-[#11b98105] text-[#11b981] text-[10px] font-black tracking-widest uppercase italic">
                    {t('v2Badge')}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 flex-1">
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <Play size={18} className="text-[#11b981]" fill="currentColor" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">{t('startQuiz')}</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('yourName')}</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && startGame()}
                                    className="w-full bg-black border border-gray-800 rounded-2xl px-5 py-4 text-white focus:border-[#11b981] outline-none transition-all font-medium"
                                    placeholder={t('enterName')}
                                />
                                {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <BarChart3 size={10} /> {t('difficulty')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setDifficulty(lvl)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                difficulty === lvl
                                                    ? 'border-[#11b981] bg-[#11b98110] text-[#11b981]'
                                                    : 'border-gray-800 bg-black text-gray-500 hover:border-gray-700'
                                            }`}
                                        >
                                            {t(lvl)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={startGame} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-[#11b981] transition-all active:scale-95">
                                {t('startGame')}
                            </button>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-900 flex items-center justify-between opacity-50">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{t('scoringSystem')}</p>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold italic">
                                <span className="flex items-center gap-1"><Zap size={10} /> 1000 {t('base')}</span>
                                <span className="flex items-center gap-1"><Timer size={10} /> {t('bonus')}</span>
                            </div>
                        </div>
                        <Info size={16} />
                    </div>
                </div>

                <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Trophy size={18} className="text-[#11b981]" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">{t('leaderboard')}</h2>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {leaderboard.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black border border-gray-800/50 rounded-2xl group hover:border-[#11b98140] transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-black ${i === 0 ? 'text-[#11b981]' : 'text-gray-600'}`}>0{i+1}</span>
                                    <span className="font-bold text-sm tracking-tight">{entry.username}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-[#11b981]">{entry.final_score.toLocaleString()}</div>
                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{entry.score}/{entry.total_questions}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );

    if (gameStarted && !gameFinished) return (
        <BackgroundWrapper levelUpActive={levelUpActive} locale={locale} t={t}>
            <div className="flex justify-between items-center mb-16">
                <div className="text-xl font-bold tracking-tighter">idir<span style={{ color: ACCENT }}>.ai</span></div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{t('score')}</p>
                        <p className="font-black text-[#11b981] leading-none">{finalScore.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-800" />
                    <div className="px-4 py-1.5 bg-[#111] border border-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {currentQuestion + 1} / {questions.length}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
                <div className="mb-4 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[9px] font-black uppercase text-gray-500 tracking-tighter">
                        {t(difficulty)}
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12 leading-[1.1]">
                    {questions[currentQuestion].question}
                </h2>

                <div className="relative min-h-[400px]">
                    {!showExplanation ? (
                        <div className="animate-in fade-in duration-300 flex flex-col h-full">
                            <div className="grid gap-3 mb-8">
                                {questions[currentQuestion].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedAnswer(option)}
                                        className={`w-full p-6 rounded-2xl border-2 text-left font-bold transition-all flex justify-between items-center
                                            ${selectedAnswer === option ? 'border-[#11b981] bg-[#11b98105]' : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-600'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black opacity-20">0{i+1}</span>
                                            {option}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                                className="mt-auto py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-10"
                            >
                                {t('submitAnswer')}
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col h-full">
                            <div className="mb-8 p-8 bg-[#11b98108] border-l-4 border-[#11b981] rounded-r-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-[#11b98120] flex items-center justify-center text-[#11b981]">
                                        {selectedAnswer === questions[currentQuestion].correct ? <CheckCircle2 size={24} /> : <XCircle size={24} className="text-red-500" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            {selectedAnswer === questions[currentQuestion].correct ? t('correctStatus') : t('incorrectStatus')}
                                        </p>
                                        <h3 className="text-lg font-bold">
                                            {selectedAnswer === questions[currentQuestion].correct ? t('correctChoice') : t('incorrectChoice')}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-gray-200 text-xl md:text-2xl leading-relaxed font-medium mb-4">
                                    {questions[currentQuestion].explanation}
                                </p>
                            </div>

                            <button onClick={handleNextQuestion} className="mt-auto py-5 bg-[#11b981] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                                {currentQuestion < questions.length - 1 ? t('nextQuestion') : t('viewLeaderboard')}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-16 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Timer size={14} className="text-gray-600" />
                    <span className="text-xs font-black text-gray-500 font-mono">{currentQuestionTime}s</span>
                </div>
                <div className="flex-1 h-[2px] bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#11b981] transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                {streak >= 2 && (
                    <div className="flex items-center gap-2 text-[#11b981] animate-pulse">
                        <Flame size={14} fill="currentColor" />
                        <span className="text-xs font-black uppercase tracking-widest">{streak}x</span>
                    </div>
                )}
            </div>
        </BackgroundWrapper>
    );

    if (gameFinished) return (
        <BackgroundWrapper levelUpActive={null} locale={locale} t={t}>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-8 w-20 h-20 rounded-3xl bg-[#11b98110] border border-[#11b98120] flex items-center justify-center text-[#11b981] shadow-[0_0_50px_-12px_rgba(17,185,129,0.3)]">
                    <Trophy size={40} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-black text-[#11b981] uppercase tracking-[0.4em] mb-4">{t('quizComplete')}</p>
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase mb-12 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                    {finalScore.toLocaleString()}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-12">
                    {[
                        { label: t('correct'), val: `${score}/${questions.length}` },
                        { label: t('difficulty'), val: t(difficulty).toUpperCase() },
                        { label: t('timeStat'), val: `${Math.floor(totalTimeSeconds/60)}m ${totalTimeSeconds%60}s` },
                        { label: t('streakStat'), val: `${maxStreak}x` }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-3xl">
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-2 italic">{stat.label}</p>
                            <p className="text-xl font-black">{stat.val}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col w-full max-w-md gap-3">
                    <button onClick={handleRestart} className="w-full py-5 bg-[#11b981] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                        <RotateCcw size={18} /> {t('playAgain')}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={shareOnLinkedIn} className="py-4 bg-[#0a66c210] border border-[#0a66c230] text-[#0a66c2] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-[#0a66c220] transition-all">
                            <Linkedin size={16} fill="currentColor" /> LinkedIn
                        </button>
                        <button onClick={shareOnX} className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Twitter size={16} fill="currentColor" /> X.com
                        </button>
                    </div>

                    <button onClick={copyLink} className="w-full py-4 bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all">
                        {copied ? <Check size={14} className="text-[#11b981]" /> : <ExternalLink size={14} />}
                        {copied ? t('copied') : t('copyLink')}
                    </button>

                    <Link href={`/${locale}`} className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                        <Home size={12} /> {t('backToHome')}
                    </Link>
                </div>
            </div>
        </BackgroundWrapper>
    );

    return null;
}