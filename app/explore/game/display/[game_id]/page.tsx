'use client';

import { motion, AnimatePresence } from "framer-motion";
import { use, useEffect, useRef, useState, useMemo } from 'react';
import io, { Socket } from "socket.io-client";
import { getGameById } from '@/services/gameService';
import { Loader2 } from 'lucide-react';
import Snowfall from "@/app/Snowfall";
import PointOverlay from "@/app/explore/components/PointOverlay";
import "@/app/globals.css";
import MainGameRound from "@/app/explore/components/MainGameRound";
import BonusRoundBoard from "@/app/explore/components/BonusRoundBoard";
import BonusTimerDisplay from "@/app/explore/components/BonusTimerDisplay";

// Definisi Interface Tipe Data (TypeScript)
interface Answer {
    id: string;
    answer: string;
    poin: number;
}

interface Round {
    id: string;
    type: string;
    question: {
        question: string;
        answers: Answer[];
    };
}

interface GameData {
    rounds: Round[];
}

// Fungsi pembantu generate kode unik pendek untuk kelompok
const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export default function GameDisplayPage({ params }: { params: Promise<{ game_id: string }> }) {
    const { game_id } = use(params);
    
    // Generate room code sekali saja saat mount
    const [roomCode] = useState(() => generateRoomCode());
    const [roomError, setRoomError] = useState<string | null>(null);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);

    const [game, setGame] = useState<GameData | null>(null);
    const [activeTab, setActiveTab] = useState<number | string>('blank');
    const [showIncorrect, setShowIncorrect] = useState(false);
    const [wrong, setWrong] = useState(0);
    const [activePlayer, setActivePlayer] = useState("L");
    const [team1Score, setTeam1Score] = useState(0);
    const [team2Score, setTeam2Score] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    
    const [team1TotalScore, setTeam1TotalScore] = useState(0);
    const [team2TotalScore, setTeam2TotalScore] = useState(0);
    const [currentMultiplier, setCurrentMultiplier] = useState(1);

    const [bonusData, setBonusData] = useState({
        answers: Array(10).fill(""),
        scores: Array(10).fill(""),
        topAnswers: Array(10).fill(false),
    });

    const pointTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUADRUPLE', 'QUINTUPLE', 'SEXTUPLE', 'SEPTUPLE', 'OCTUPLE', 'NONUPLE', 'DECUPLE'];
    
    const pointMultiplierMap: Record<string, number> = {
        'SINGLE': 1, 'DOUBLE': 2, 'TRIPLE': 3, 'QUADRUPLE': 4, 'QUINTUPLE': 5,
        'SEXTUPLE': 6, 'SEPTUPLE': 7, 'OCTUPLE': 8, 'NONUPLE': 9, 'DECUPLE': 10
    };

    const socketInstance = useRef<Socket | null>(null);

    // Menggunakan Ref untuk menghindari stale closure pada socket event listener
    const stateRef = useRef({ game, isVisible, activeTab });
    useEffect(() => {
        stateRef.current = { game, isVisible, activeTab };
    }, [game, isVisible, activeTab]);

    const handleMainRound = (index: number) => {
        const currentGame = stateRef.current.game;
        if (!currentGame?.rounds) return;

        setActiveTab(index);
        setWrong(0);
        setTeam1TotalScore(0);
        setTeam2TotalScore(0);
        setIsVisible(false);
        
        const roundData = currentGame.rounds[index - 1];
        if (roundData) {
            const m = pointMultiplierMap[roundData.type] || 1;
            setCurrentMultiplier(m);
            
            new Audio('/sounds/start.mp3').play().catch(() => {});
            roundData.question.answers.forEach((_: any, idx: number) => {
                setTimeout(() => {
                    const flip = new Audio('/sounds/flip.mp3');
                    flip.volume = 0.4;
                    flip.play().catch(() => {});
                }, 1000 + (idx * 100));
            });
        }
    };

    const handleSound = (music: string) => {
        new Audio(`/sounds/${music}.mp3`).play().catch((err) => {
            console.log("Error audio:", err);
        });
    };

    // MANAGEMENT SOCKET ROOM & LISTENERS
    useEffect(() => {
        if (!socketInstance.current) {
            socketInstance.current = io(undefined, { path: "/api/socket" });
        }
        
        const socket = socketInstance.current;

        // Autentikasi pembuatan kamar saat socket berhasil connect
        socket.on("connect", () => {
            if (game_id) {
                socket.emit("create-room", { game_id, room_code: roomCode });
            }
        });

        socket.on("room-error", (data: { message: string }) => {
            setRoomError(data.message);
        });

        socket.on("remote-connected", () => {
            setIsRemoteConnected(true);
        });

        socket.on("remote-disconnected", () => {
            setIsRemoteConnected(false); // Munculkan kode lagi jika HP remote tiba-tiba terputus/ditutup
        });

        // Event-event interaksi gameplay dari remote kontrol
        socket.on("set-active-tab-blank", () => setActiveTab('blank'));
        
        socket.on("set-active-tab-main", () => {
            handleSound('preparation');
            setActiveTab('main');
        });

        socket.on("set-active-tab-final", () => {
            handleSound('coin');
            setActiveTab('final');
        });

        socket.on("set-active-tab-timer", () => setActiveTab('timer'));

        socket.on("set-active-tab-point", (type: string) => {
            handleSound('preparation');
            setActiveTab(type);
        });

        socket.on("set-active-tab-main-round", handleMainRound);
        
        socket.on("handle-incorrect", () => {
            setShowIncorrect(true);
            new Audio(`/sounds/wrong-3.mp3`).play().catch(() => {});
            setTimeout(() => setShowIncorrect(false), 2000);
            
            const { activeTab: currentTab, isVisible: currentVisibility } = stateRef.current;
            if (typeof currentTab === 'number' && currentVisibility) {
                setWrong(prev => Math.min(prev + 1, 4));
            }
        });

        socket.on("set-plus-wrong", (val: number) => setWrong(val));
        socket.on("set-minus-wrong", (val: number) => setWrong(val));

        socket.on("set-score", (data: any) => {
            setTeam1Score(data.team1TempScoreSO);
            setTeam2Score(data.team2TempScoreSO);
            new Audio('/sounds/correct.mp3').play().catch(() => {});
        });

        socket.on("set-active-player", (player: string) => setActivePlayer(player));
        socket.on("set-question-visible", () => setIsVisible(prev => !prev));
        socket.on("update-bonus-display", (data: any) => setBonusData(data));
        
        socket.on("set-final-answer", ({ index, answer }: { index: number, answer: string }) => {
            setBonusData(prev => {
                const newAnswers = [...prev.answers];
                newAnswers[index] = answer;
                return { ...prev, answers: newAnswers };
            });
            new Audio('/sounds/magic.mp3').play().catch(() => {});
        });

        socket.on("set-final-score", ({ index, score }: { index: number, score: string }) => {
            setBonusData(prev => {
                const newScores = [...prev.scores];
                newScores[index] = score;
                return { ...prev, scores: newScores };
            });
            const soundFile = score === "0" ? '/sounds/wrong.mp3' : '/sounds/correct.mp3';
            new Audio(soundFile).play().catch(() => {});
        });
        
        socket.on("set-final-top-answer", ({ index, score, isTop }: { index: number, score: string, isTop: boolean }) => {
            setBonusData(prev => {
                const newScores = [...prev.scores];
                const newTop = prev.topAnswers ? [...prev.topAnswers] : Array(10).fill(false);
                
                newTop[index] = isTop;
                newScores[index] = score;

                if (isTop) {
                    new Audio('/sounds/top-survey.mp3').play().catch(() => {});
                }

                return { ...prev, scores: newScores, topAnswers: newTop };
            });
        });
        
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketInstance.current = null;
        };
    }, [game_id, roomCode]);

    // FETCH DATA TEMPLATE GAME
    useEffect(() => {
        const fetchGame = async () => {
            if (game_id) {
                const data = await getGameById(game_id);
                setGame(data);
            }
        };
        fetchGame();
    }, [game_id]);

    // Menggunakan useMemo untuk kalkulasi skor bonus round agar hemat resource
    const totalBonusScore = useMemo(() => {
        return bonusData.scores.reduce((acc, curr) => {
            if (curr === "" || isNaN(Number(curr))) return acc;
            return acc + Number(curr);
        }, 0);
    }, [bonusData.scores]);

    const isFireEffect = totalBonusScore >= 200;

    if (roomError) return (
        <div className="flex h-screen bg-[#0f172a] items-center justify-center font-black text-red-500 text-center p-8">
            ⚠️ ERROR KONEKSI KAMAR: {roomError}
        </div>
    );

    if (!game) return (
        <div className="flex h-screen bg-[#0f172a] items-center justify-center font-black text-white">
            <Loader2 className="animate-spin text-blue-500 mr-4" size={64} /> LOADING...
        </div>
    );

    const currentRound = typeof activeTab === 'number' ? game.rounds[activeTab - 1] : null;

    return (
        <div className="relative h-screen w-full bg-[#0f172a] overflow-hidden flex items-center justify-center font-sans uppercase">
            <div className="absolute inset-0 bg-[url('/background/background-1.gif')] bg-cover opacity-10 pointer-events-none" />
            <Snowfall count={100} />

            {/* BOX KODE KAMAR: Hanya muncul jika remote BELUM terkoneksi */}
            {!isRemoteConnected && (
                <div className="absolute top-6 right-6 z-50 bg-yellow-500 text-slate-900 px-6 py-2.5 rounded-full font-black text-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] tracking-wider animate-in fade-in duration-300">
                    KODE REMOTE: {roomCode}
                </div>
            )}

            <div className="relative z-10 w-full max-w-screen-2xl px-12 h-full flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {activeTab === 'main' && (
                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                            <h1 className="text-[12rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-600">
                                FAMILY<br/>FORTUNES
                            </h1>
                        </motion.div>
                    )}

                    {typeof activeTab === 'string' && pointTypes.includes(activeTab) && (
                        <PointOverlay key={activeTab} title={activeTab} />
                    )}

                    {currentRound && (
                        <MainGameRound
                            key={`round-${activeTab}`} 
                            currentRound={currentRound}
                            activeTab={activeTab}
                            team1Score={team1Score}
                            team2Score={team2Score}
                            activePlayer={activePlayer}
                            wrong={wrong}
                            isVisible={isVisible}
                            team1TotalScore={team1TotalScore}
                            team2TotalScore={team2TotalScore}
                            socketInstance={socketInstance.current}
                            currentMultiplier={currentMultiplier}
                            setTeam1TotalScore={setTeam1TotalScore}
                            setTeam2TotalScore={setTeam2TotalScore}
                        />
                    )}

                    {activeTab === 'final' && (
                        <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
                            <BonusRoundBoard data={bonusData} />
                            
                            <div className={`mt-8 px-12 py-4 rounded-2xl border-4 text-5xl font-black uppercase transition-all duration-700 ${
                                isFireEffect
                                    ? "bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 border-orange-400 text-white shadow-[0_0_50px_rgba(239,68,68,0.8),_inset_0_0_20px_rgba(252,211,77,0.6)] animate-pulse"
                                    : "bg-yellow-500 border-yellow-200 text-blue-900 shadow-2xl"
                            }`}>
                                <span className="flex items-center gap-3">
                                    TOTAL: {totalBonusScore}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'timer' && (
                        <BonusTimerDisplay socketInstance={socketInstance.current} />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showIncorrect && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] pointer-events-none bg-red-600/20 shadow-[inset_0_0_200px_rgba(255,0,0,0.7)]"
                            />

                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }} 
                                animate={{ scale: 1.3, opacity: 1 }} 
                                exit={{ scale: 2, opacity: 0 }} 
                                className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center"
                            >
                                {/* <span className="text-[28rem] text-red-600 drop-shadow-[0_0_100px_rgba(255,0,0,1)] font-bold">
                                    X
                                </span> */}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}