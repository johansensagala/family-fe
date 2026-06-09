'use client';

import { motion } from "framer-motion";
import TeamScoreSide from "./TeamScoreSide";
import AnswerRow from "./AnswerRow";
import RollingNumber from "./RollingNumber";

interface MainGameRoundProps {
    currentRound: any;
    activeTab: string | number;
    team1Score: number;
    team2Score: number;
    activePlayer: string;
    wrong: number;
    isVisible: boolean;
    team1TotalScore: number;
    team2TotalScore: number;
    socketInstance: any;
    currentMultiplier: number;
    setTeam1TotalScore: React.Dispatch<React.SetStateAction<number>>;
    setTeam2TotalScore: React.Dispatch<React.SetStateAction<number>>;
    staggerDelay?: number; 
    startDelay?: number;
}

export default function MainGameRound({
    currentRound,
    activeTab,
    team1Score,
    team2Score,
    activePlayer,
    wrong,
    isVisible,
    team1TotalScore,
    team2TotalScore,
    socketInstance,
    currentMultiplier,
    setTeam1TotalScore,
    setTeam2TotalScore,
    staggerDelay = 0.1,
    startDelay = 0.7
}: MainGameRoundProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                delayChildren: startDelay, 
                staggerChildren: staggerDelay, 
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.div 
            key="game" 
            initial={{ y: 30, opacity: 0 }} 
            animate ={{ y: 0, opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="w-full grid grid-cols-12 gap-8 items-center"
        >
            <TeamScoreSide 
                side="L" 
                score={team1Score} 
                active={activePlayer === 'L'} 
                wrongCount={wrong} 
                isTurn={activePlayer === 'L'} 
            />
            
            <div className="col-span-8 flex flex-col gap-6">
                {/* Board Utama: Perubahan pada warna border dan shadow agar lebih mewah */}
                <div className="bg-gradient-to-b from-slate-800 via-slate-900 to-black border-[6px] border-blue-500/20 p-10 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                    
                    {/* Skor Total Atas: Menggunakan Emas yang lebih bertekstur */}
                    <div className="flex justify-center -mt-20 mb-10">
                        <div className="bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 text-blue-950 px-14 py-3 rounded-2xl text-6xl font-black border-4 border-yellow-200 shadow-[0_10px_25px_rgba(0,0,0,0.4)] min-w-[220px] text-center tracking-tight">
                            <RollingNumber value={team1TotalScore + team2TotalScore} duration={600} />
                        </div>
                    </div>

                    {/* Teks Pertanyaan: Dibuat lebih kontras dan glow tipis */}
                    <div className="text-center min-h-[100px] mb-6 flex items-center justify-center">
                        {isVisible && (
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(147,197,253,0.3)] leading-tight"
                            >
                                {currentRound.question.question}
                            </motion.h2>
                        )}
                    </div>

                    {/* List Jawaban: Grid dibersihkan */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-4"
                    >
                        {currentRound.question.answers.map((ans: any, idx: number) => (
                            <motion.div key={`${activeTab}-${ans.id || idx}`} variants={itemVariants}>
                                <AnswerRow 
                                    answer={ans} 
                                    index={idx} 
                                    socket={socketInstance}
                                    multiplier={currentMultiplier}
                                    correctSound="correct" 
                                    incorrectSound="wrong-3"
                                    onScoreChange={(s: number) => {
                                        if (wrong >= 3) return; // Jangan tambahkan skor jika sudah 3 salah
                                        if (activePlayer === 'L') {
                                            setTeam1TotalScore(prev => prev + s);
                                        } else {
                                            setTeam2TotalScore(prev => prev + s);
                                        }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <TeamScoreSide 
                side="R" 
                score={team2Score} 
                active={activePlayer === 'R'} 
                wrongCount={wrong} 
                isTurn={activePlayer === 'R'} 
            />
        </motion.div>
    );
}