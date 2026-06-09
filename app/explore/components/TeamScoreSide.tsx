'use client';

import React from 'react';
import { motion } from 'framer-motion';
import RollingNumber from './RollingNumber';

interface TeamScoreSideProps {
    side: 'L' | 'R';
    score: number;
    active: boolean;      // Apakah tim ini yang sedang aktif
    wrongCount: number;   // Jumlah salah saat ini
    isTurn: boolean;      // Penanda giliran untuk memunculkan X
}

export default function TeamScoreSide({ side, score, active, wrongCount, isTurn }: TeamScoreSideProps) {
    return (
        <div className='col-span-2 flex flex-col items-center gap-6 transition-all duration-500 scale-110'>
            
            {/* Box Skor - Warna tetap konsisten sesuai 'side' */}
            <div className={`w-full p-8 rounded-[2.5rem] border-4 text-center shadow-2xl transition-all duration-500 ${
                side === 'L' 
                    ? 'bg-blue-600 border-blue-300 shadow-blue-500/40' 
                    : 'bg-red-600 border-red-300 shadow-red-500/40'
            }`}>
                {/* Logo Trophy dihapus sesuai permintaan */}
                <div className="text-6xl font-black text-white drop-shadow-lg">
                    <RollingNumber value={score} duration={500} />
                </div>
            </div>

            {/* Indikator X */}
            <div className="flex flex-col gap-3 min-h-[200px]">
                {[1, 2, 3].map(i => {
                    const shouldShowX = (wrongCount >= i && isTurn) || (wrongCount > 3 && i == 1);

                    return (
                        <div key={i} className="relative w-16 h-16">
                            {shouldShowX && (
                                <motion.div 
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-full h-full rounded-2xl flex items-center justify-center text-5xl"
                                >
                                    ❌
                                </motion.div>
                            )}
                            
                            {/* Placeholder agar posisi tetap konsisten meskipun X belum muncul (dimatikan sementara) */}
                            {/* {!shouldShowX && (
                                <div className="w-full h-full rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm" />
                            )} */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}