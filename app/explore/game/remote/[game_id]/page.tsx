'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import io, { Socket } from "socket.io-client";
import { 
    XCircle, Trophy, Timer as TimerIcon, 
    Volume2, Loader2, Play, Hash, 
    Tv, RefreshCcw, Eye, EyeOff,
    Minus, Plus, Zap, Pause
} from 'lucide-react';
import Sidebar from '@/app/explore/components/Sidebar';
import Header from '@/app/explore/components/Header';
import { getGameById, recordGameInteraction } from '@/services/gameService';

const RemoteControlPage = ({ params }: { params: Promise<{ game_id: string }> }) => {
    const { game_id } = use(params);

    // STATE UNTUK LOGIN MULTI-ROOM
    const [roomCode, setRoomCode] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [roomError, setRoomError] = useState<string | null>(null);

    // STATE UTAMA REMOTE GAME
    const [game, setGame] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<number | string>('blank');
    const [wrong, setWrong] = useState(0);
    const [activePlayer, setActivePlayer] = useState("L");
    const [team1TempScore, setTeam1TempScore] = useState(0);
    const [team2TempScore, setTeam2TempScore] = useState(0);
    const [team1Score, setTeam1Score] = useState(0);
    const [team2Score, setTeam2Score] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

    const [customTimer, setCustomTimer] = useState(25);
    const [bonusAnswers, setBonusAnswers] = useState<string[]>(Array(10).fill(""));
    const [bonusScores, setBonusScores] = useState<string[]>(Array(10).fill(""));
    const [isPending, setIsPending] = useState(false);
    const [isPausedRemote, setIsPausedRemote] = useState(false);

    const [bonusData, setBonusData] = useState({
        answers: Array(10).fill(""),
        scores: Array(10).fill(""),
        topAnswers: Array(10).fill(false),
    });

    const pointTypes = [
        'SINGLE', 'DOUBLE', 'TRIPLE', 'QUADRUPLE', 'QUINTUPLE', 
        'SEXTUPLE', 'SEPTUPLE', 'OCTUPLE', 'NONUPLE', 'DECUPLE'
    ];

    const socketInstance = useRef<Socket | null>(null);

    // 1. MANAGEMENT SOCKET & LIFECYCLE LISTENER
    useEffect(() => {
        if (!socketInstance.current) {
            socketInstance.current = io(undefined, { path: "/api/socket" });
        }
        
        const currentSocket = socketInstance.current;

        // Listener validasi room dari backend
        currentSocket.on("room-status", async (data: { success: boolean; game_id: string }) => {
            if (data.success) {
                setIsJoined(true);
                setRoomError(null);
                
                const gameData = await getGameById(data.game_id);
                setGame(gameData);

                try {
                    await recordGameInteraction(data.game_id, 'play');
                    console.log(`[STATS] Play count berhasil direkam untuk Game ID: ${data.game_id}`);
                } catch (err) {
                    console.error("Gagal mencatat statistik play dari client:", err);
                }
            }
        });

        currentSocket.on("room-error", (data: { message: string }) => {
            setRoomError(data.message);
            setIsJoined(false);
        });

        currentSocket.on("set-final-top-answer", ({ index, isTop }) => {
            setBonusData(prev => {
                const newTop = prev.topAnswers ? [...prev.topAnswers] : Array(10).fill(false);
                newTop[index] = isTop;
                return { ...prev, topAnswers: newTop };
            });
        });

        currentSocket.on("set-active-tab-timer", () => {
            setActiveTab('timer');
        });

        currentSocket.on("set-stop-timer", () => {
            setIsPausedRemote(false);
        });

        currentSocket.on("room-closed", (data: { message: string }) => {
            alert(data.message);
            window.location.reload(); // Refresh halaman jika display ditutup otomatis
        });

        return () => {
            currentSocket.off("room-status");
            currentSocket.off("room-error");
            currentSocket.off("set-final-top-answer");
            currentSocket.off("set-active-tab-timer");
            currentSocket.off("set-stop-timer");
            currentSocket.off("room-closed");
            currentSocket.disconnect();
            socketInstance.current = null;
        };
    }, []);

    // ACTION: Kirim request join room ke server backend
    const handleJoinRoomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode.trim()) return;
        setRoomError(null);
        
        socketInstance.current?.emit("join-room", { 
            room_code: roomCode.toUpperCase().trim(),
            game_id: game_id // Sinyal validasi dikirim ke backend
        });
    };

    // --- EMITTERS ---
    const handleSound = (music: string) => {
        socketInstance.current?.emit("set-sound-effect", { music });
    };

    const revealAnswer = (index: number, answerId: string) => {
        setRevealedAnswers(prev => ({ ...prev, [answerId]: true }));
        socketInstance.current?.emit("set-reveal-answer", index);
    };
    
    const applyScore = () => {
        handleSound('correct');
        setTeam1Score(team1TempScore);
        setTeam2Score(team2TempScore);
        socketInstance.current?.emit("set-score", { team1TempScoreSO: team1TempScore, team2TempScoreSO: team2TempScore });
    };

    const handleActionWithCooldown = (action: () => void) => {
        if (isPending) return;
        setIsPending(true);
        action();
        setTimeout(() => setIsPending(false), 500);
    };

    // =========================================================================
    // LAYAR REFACTOR 1: TAMPILKAN INPUT KODE KAMAR JIKALAU BELUM TERHUBUNG
    // =========================================================================
    if (!isJoined) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0f172a] items-center justify-center p-6 text-white uppercase font-sans">
                <div className="w-full max-w-md bg-gray-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black italic text-blue-500 tracking-wider">REMOTE CONTROLLER</h1>
                        <p className="text-xs text-gray-400 font-bold tracking-widest">FAMILY FORTUNES KONTROL GAME</p>
                    </div>

                    <form onSubmit={handleJoinRoomSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black tracking-[0.3em] block">KODE KAMAR MONITOR</label>
                            <input 
                                type="text" 
                                maxLength={4}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                placeholder="XXXX" 
                                className="w-full bg-gray-800 border border-white/10 p-4 rounded-2xl text-center text-4xl font-black text-yellow-500 placeholder-gray-700 outline-none focus:border-blue-500 transition-all uppercase"
                            />
                        </div>

                        {roomError && (
                            <p className="text-xs text-red-500 font-bold bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                                ⚠️ {roomError}
                            </p>
                        )}

                        <button 
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                        >
                            SAMBUNGKAN KE MONITOR
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Tampilkan loading data game setelah room valid
    if (!game) return (
        <div className="flex min-h-screen bg-[#0f172a] items-center justify-center font-black italic text-blue-500">
            <Loader2 className="animate-spin mr-3" size={48} /> LOADING DATA GAME...
        </div>
    );

    const currentRoundData = typeof activeTab === 'number' ? game.rounds[activeTab - 1] : null;

    // =========================================================================
    // LAYAR REFACTOR 2: UTAMA REMOTE (SAMA SEPERTI KODE LAMA KAMU)
    // =========================================================================
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans uppercase">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 flex flex-col gap-6">
                <Header />

                {/* Indikator Kamar Aktif */}
                <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-full text-xs font-black text-blue-400 flex items-center justify-between">
                    <span>STATUS: TERKONEKSI AMAN</span>
                    <span>ROOM CODE: {roomCode.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* --- LEFT: NAVIGATION ROUNDS --- */}
                    <div className="lg:col-span-3 space-y-4">
                        <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Game Navigation</h3>
                        <div className="flex flex-col gap-2 pr-2">
                            <button 
                                disabled={activeTab === 'blank'}
                                onClick={() => { setActiveTab('blank'); socketInstance.current?.emit("set-active-tab-blank", null); }}
                                className={`p-4 rounded-2xl font-black text-left border transition-all ${activeTab === 'blank' ? 'bg-white text-black border-white opacity-100 cursor-default' : 'bg-gray-900 border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                                <Tv className="inline-block mr-2" size={16} /> BLANK SCREEN
                            </button>

                            <button 
                                disabled={activeTab === 'main'}
                                onClick={() => { setActiveTab('main'); socketInstance.current?.emit("set-active-tab-main", null); }}
                                className={`p-4 rounded-2xl font-black text-left border transition-all ${activeTab === 'main' ? 'bg-indigo-600 border-indigo-400 shadow-lg cursor-default' : 'bg-gray-900 border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                                <Play className="inline-block mr-2" size={16} /> MAIN INTRO
                            </button>

                            <div className="h-px bg-white/5 my-2" />

                            {game.rounds.map((round: any, idx: number) => (
                                <button 
                                    key={round.id}
                                    disabled={activeTab === idx + 1}
                                    onClick={() => {
                                        setActiveTab(idx + 1);
                                        setWrong(0);
                                        setIsVisible(false);
                                        setRevealedAnswers({}); 
                                        socketInstance.current?.emit("set-active-tab-main-round", idx + 1);
                                    }}
                                    className={`p-4 rounded-2xl font-black text-left border transition-all ${activeTab === idx + 1 ? 'bg-blue-600 border-blue-400 shadow-lg cursor-default' : 'bg-gray-900 border-white/5 text-gray-500 hover:border-white/20'}`}
                                >
                                    <div className="text-[10px] opacity-60 italic">ROUND {idx + 1}</div>
                                    <div className="truncate">{round.question.question}</div>
                                </button>
                            ))}

                            <div className="h-px bg-white/5 my-2" />

                            {pointTypes.map(type => (
                                <button 
                                    key={type}
                                    disabled={activeTab === type}
                                    onClick={() => { setActiveTab(type); socketInstance.current?.emit("set-active-tab-point", type); }}
                                    className={`p-4 rounded-2xl font-black text-left border transition-all ${activeTab === type ? 'bg-yellow-500 text-black border-yellow-400 cursor-default' : 'bg-gray-900 border-white/5 text-yellow-500/50 hover:border-white/20'}`}
                                >
                                    <Hash className="inline-block mr-2" size={16} /> {type} POINT
                                </button>
                            ))}

                            <button 
                                disabled={activeTab === 'final'}
                                onClick={() => { setActiveTab('final'); socketInstance.current?.emit("set-active-tab-final", null); handleSound('show-final-answer'); }}
                                className={`p-4 rounded-2xl font-black text-left border transition-all mt-2 ${activeTab === 'final' ? 'bg-purple-600 border-purple-400 shadow-lg cursor-default' : 'bg-gray-900 border-white/5 text-purple-400/50 hover:border-white/20'}`}
                            >
                                <Trophy className="inline-block mr-2" size={16} /> BONUS ROUND
                            </button>

                            <button 
                                disabled={activeTab === 'timer'}
                                onClick={() => { setActiveTab('timer'); socketInstance.current?.emit("set-active-tab-timer", null); }}
                                className={`p-4 rounded-2xl font-black text-left border transition-all mt-2 ${activeTab === 'timer' ? 'bg-green-600 border-green-400 shadow-lg cursor-default' : 'bg-gray-900 border-white/5 text-green-500/50 hover:border-white/20'}`}
                            >
                                <TimerIcon className="inline-block mr-2" size={16} /> TIMER MODE
                            </button>
                        </div>
                    </div>

                    {/* --- MIDDLE: DYNAMIC CONTENT AREA --- */}
                    <div className="lg:col-span-6 space-y-6">
                        {(activeTab !== 'final' && activeTab !== 'timer') && (
                            <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black italic flex items-center gap-2"><Trophy className="text-yellow-500" /> SCOREBOARD</h3>
                                    <button onClick={() => {setTeam1TempScore(0); setTeam2TempScore(0)}} className="text-[10px] text-gray-500 hover:text-white"><RefreshCcw size={12} className="inline mr-1"/> RESET</button>
                                </div>
                                <div className="grid grid-cols-2 gap-8 mb-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-blue-400 font-bold text-center uppercase tracking-widest">Team Left</p>
                                        <input type="number" value={team1TempScore} onChange={(e) => setTeam1TempScore(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-white/5 p-4 rounded-2xl text-4xl font-black text-blue-400 text-center outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-red-400 font-bold text-center uppercase tracking-widest">Team Right</p>
                                        <input type="number" value={team2TempScore} onChange={(e) => setTeam2TempScore(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-white/5 p-4 rounded-2xl text-4xl font-black text-red-400 text-center outline-none" />
                                    </div>
                                </div>
                                <button onClick={applyScore} className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl shadow-xl transition-all uppercase">Apply Scores to Monitor</button>
                            </div>
                        )}

                        {(activeTab === 'timer') && (
                            <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                                <h3 className="text-xl font-black italic mb-6 flex items-center gap-2 text-green-400"><TimerIcon /> TIMER CONTROL</h3>
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-[2] min-w-0">
                                        <input type="number" value={customTimer} onChange={(e) => setCustomTimer(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-white/5 p-4 rounded-2xl text-3xl font-black text-green-400 text-center outline-none" />
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                                        {[20, 25, 30, 60].map(v => (
                                            <button key={v} onClick={() => setCustomTimer(v)} className="bg-gray-800 rounded-xl text-[10px] font-black hover:bg-gray-700 border border-white/5 py-2">{v}s</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => { socketInstance.current?.emit("set-start-timer", customTimer); setIsPausedRemote(false); }} className="py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-black shadow-lg transition-all text-sm uppercase">Start Timer</button>
                                    <button onClick={() => { socketInstance.current?.emit("set-stop-timer", null); setIsPausedRemote(false); }} className="py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-black shadow-lg transition-all text-sm uppercase">Stop / Reset</button>
                                    <button onClick={() => socketInstance.current?.emit("show-timer-display", customTimer)} className="py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black shadow-lg transition-all text-sm uppercase flex items-center justify-center gap-2"><Tv size={16} /> Show Timer</button>

                                    {isPausedRemote ? (
                                        <button onClick={() => { socketInstance.current?.emit("set-start-timer", null); setIsPausedRemote(false); }} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg transition-all text-sm uppercase flex items-center justify-center gap-2"><Play size={16} /> Resume Timer</button>
                                    ) : (
                                        <button onClick={() => { socketInstance.current?.emit("set-pause-timer", null); setIsPausedRemote(true); }} className="py-4 bg-slate-600 hover:bg-slate-500 rounded-2xl font-black shadow-lg transition-all text-sm uppercase flex items-center justify-center gap-2"><Pause size={16} /> Pause Timer</button>
                                    )}

                                    <button onClick={() => { handleSound('buzzer'); socketInstance.current?.emit("trigger-same-answer", null); }} className="col-span-2 py-4 bg-amber-600 hover:bg-amber-500 rounded-2xl font-black shadow-lg transition-all text-sm uppercase flex items-center justify-center gap-2"><Volume2 size={16} /> Same Answer</button>
                                </div>
                            </div>
                        )}

                        {(activeTab !== 'final' && activeTab !== 'timer') && (
                            <div className="bg-gray-900/50 border border-white/10 rounded-[2.5rem] p-6 space-y-6 overflow-hidden w-full">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 italic">Live Gameplay Controls</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <button 
                                        onClick={() => handleActionWithCooldown(() => { 
                                            socketInstance.current?.emit("handle-incorrect", null);
                                            if (isVisible) setWrong(prev => Math.min(prev + 1, 4));
                                            handleSound('wrong-3');
                                        })}
                                        className={`flex items-center justify-center gap-3 border p-6 rounded-2xl font-black italic transition-all active:scale-95 text-red-500 border-red-500/30 ${isPending ? 'bg-gray-800 opacity-70 cursor-default' : 'bg-red-500/10 hover:bg-red-500/20'}`}
                                    >
                                        <XCircle size={28} /> <span className="text-lg">WRONG!</span>
                                    </button>

                                    <button 
                                        onClick={() => handleActionWithCooldown(() => { 
                                            setIsVisible(!isVisible); 
                                            socketInstance.current?.emit("set-question-visible", null); 
                                        })}
                                        className={`flex items-center justify-center gap-3 p-6 rounded-2xl font-black italic transition-all active:scale-95 border ${isVisible ? 'bg-blue-500 text-white border-blue-400 shadow-lg' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30'}`}
                                    >
                                        {isVisible ? <EyeOff size={24} /> : <Eye size={24} />} <span className="text-lg">{isVisible ? "HIDE QUES" : "SHOW QUES"}</span>
                                    </button>
                                </div>

                                <div className="bg-gray-800/40 p-4 rounded-3xl flex flex-wrap items-center justify-around gap-6 border border-white/5 w-full">
                                    <div className="text-center flex-shrink-0">
                                        <p className="text-[9px] text-gray-500 font-black tracking-widest mb-2 uppercase">Strikes Status</p>
                                        <div className="flex items-center gap-3 justify-center">
                                            <button onClick={() => handleActionWithCooldown(() => { const newVal = Math.max(wrong - 1, 0); setWrong(newVal); socketInstance.current?.emit("set-minus-wrong", newVal); })} className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 text-white hover:bg-white/10">-</button>
                                            <div className="flex gap-1.5 px-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border-2 ${wrong >= i ? 'bg-red-600 border-red-400 text-white' : 'bg-gray-900 border-white/5 text-gray-800'}`}>X</div>
                                                ))}
                                            </div>
                                            <button onClick={() => handleActionWithCooldown(() => { const newVal = Math.min(wrong + 1, 4); setWrong(newVal); socketInstance.current?.emit("set-plus-wrong", newVal); })} className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 text-white hover:bg-white/10">+</button>
                                        </div>
                                    </div>

                                    <div className="hidden md:block h-12 w-px bg-white/10" />

                                    <div className="text-center flex-1 min-w-[200px]">
                                        <p className="text-[9px] text-gray-500 font-black tracking-widest mb-2 uppercase">Current Team Turn</p>
                                        <button onClick={() => handleActionWithCooldown(() => { const next = activePlayer === "L" ? "R" : "L"; setActivePlayer(next); socketInstance.current?.emit("set-active-player", next); })} className={`w-full px-10 py-3 rounded-2xl font-black text-lg transition-all border-b-4 ${activePlayer === 'L' ? 'bg-blue-600 border-blue-800' : 'bg-red-600 border-red-800'}`}>{activePlayer === "L" ? "LEFT TEAM" : "RIGHT TEAM"}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentRoundData && (
                            <div className="bg-gray-900/80 border-2 border-blue-500/30 rounded-[2.5rem] p-6 space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-blue-400 font-black italic text-sm uppercase">Answers Revelation</h3>
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold">ROUND {activeTab}</span>
                                </div>
                                <div className="space-y-2">
                                    {currentRoundData.question.answers.map((ans: any, idx: number) => (
                                        <div key={ans.id || idx} className={`flex items-start justify-between p-4 rounded-2xl border transition-all gap-4 ${revealedAnswers[ans.id] ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5'}`}>
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black mt-1 ${revealedAnswers[ans.id] ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{idx + 1}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold uppercase whitespace-normal break-words leading-tight ${revealedAnswers[ans.id] ? 'text-white' : 'text-gray-500'}`}>{ans.answer}</p>
                                                    <p className="text-[10px] text-yellow-500 font-black mt-1">{ans.poin} PTS</p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 self-center">
                                                <button onClick={() => revealAnswer(idx, ans.id)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 ${revealedAnswers[ans.id] ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500 text-white'}`}>
                                                    {revealedAnswers[ans.id] ? <><Zap size={14} /> Highlight</> : 'Reveal'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'final' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 w-full">
                                {[0, 5].map((startIdx) => (
                                    <div key={startIdx} className="bg-gray-900/90 border border-purple-500/20 p-4 sm:p-6 rounded-[2rem] space-y-4 shadow-2xl w-full min-w-0">
                                        <h4 className="text-center font-black text-purple-400 tracking-[0.2em] text-xs uppercase">PLAYER {startIdx === 0 ? '1' : '2'}</h4>
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const idx = startIdx + i;
                                            return (
                                                <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors space-y-3 w-full min-w-0">
                                                    <div className="flex items-center gap-2 w-full min-w-0">
                                                        <input placeholder={`Jawaban ${idx + 1}`} value={bonusAnswers[idx]} onChange={(e) => { const n = [...bonusAnswers]; n[idx] = e.target.value; setBonusAnswers(n); }} className="flex-1 min-w-0 bg-transparent border-b border-white/20 px-2 py-1 font-bold outline-none text-xs sm:text-sm" />
                                                        <button onClick={() => socketInstance.current?.emit("set-final-answer", { index: idx, answer: bonusAnswers[idx] })} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-black text-[9px] uppercase">SHOW ANS</button>
                                                    </div>
                                                    <div className="flex gap-2 items-center w-full min-w-0">
                                                        <div className="relative w-16 shrink-0">
                                                            <input type="text" inputMode="numeric" placeholder="0" value={bonusScores[idx] ?? ""} onChange={(e) => { const value = e.target.value; if (!/^\d*$/.test(value)) return; const s = [...bonusScores]; s[idx] = value; setBonusScores(s); }} className="w-full bg-gray-800 rounded-lg text-center font-black text-yellow-500 py-1.5 text-xs outline-none border border-white/10" />
                                                            <span className="absolute -top-2 -left-1 text-[7px] bg-yellow-600 text-black px-1 rounded font-bold">PTS</span>
                                                        </div>
                                                        <div className="flex flex-1 gap-2">
                                                            <button onClick={() => socketInstance.current?.emit("set-final-score", { index: idx, score: bonusScores[idx] })} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-black text-[9px] uppercase">SCORE</button>
                                                            <button 
                                                                onClick={() => {
                                                                    const currentStatus = bonusData?.topAnswers?.[idx] || false;
                                                                    const nextStatus = !currentStatus;
                                                                    setBonusData(prev => {
                                                                        const newTop = [...(prev.topAnswers || Array(10).fill(false))];
                                                                        newTop[idx] = nextStatus;
                                                                        return { ...prev, topAnswers: newTop };
                                                                    });
                                                                    socketInstance.current?.emit("set-final-top-answer", { index: idx, score: bonusScores[idx], isTop: nextStatus });
                                                                }} 
                                                                className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase ${bonusData?.topAnswers?.[idx] ? "bg-slate-800 border border-yellow-500 text-yellow-400" : "bg-slate-800 text-slate-400"}`}
                                                            >
                                                                {bonusData?.topAnswers?.[idx] ? "CANCEL" : "TOP ANSWER"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: SFX LIBRARY --- */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-900/50 border border-white/5 p-6 rounded-[2rem]">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Volume2 size={14} /> SFX LIBRARY</h3>
                            <div className="grid grid-cols-1 gap-2 h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                                {['preparation', 'preparation-2', 'applause', 'heartbeat', 'riser', 'victory-2', 'end', 'buzzer', 'siren', 'cashier', 'magic', 'correct', 'wrong-3'].map(s => (
                                    <button key={s} onClick={() => handleSound(s)} className="p-3 bg-gray-800 hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase text-left border border-white/5 flex justify-between items-center group">{s.replace('-', ' ')} <Play size={10} className="opacity-0 group-hover:opacity-100" /></button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RemoteControlPage;