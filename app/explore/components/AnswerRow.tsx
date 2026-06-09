'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface AnswerRowProps {
    answer: any;
    index: number;
    multiplier?: number;
    onScoreChange: (score: number) => void;
    onIncorrectRevealWithoutIcon?: () => void;
    correctSound: string;
    incorrectSound: string;
    socket: any;
}

export default function AnswerRow({ 
    answer, 
    index, 
    multiplier = 1, 
    onScoreChange, 
    correctSound, 
    socket 
}: AnswerRowProps) {
    const [revealed, setRevealed] = useState(false);
    const [isHighlight, setIsHighlight] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const fitText = useCallback(() => {
        if (!revealed || !containerRef.current || !textRef.current) return;
        const scale = Math.min(1, (containerRef.current.clientWidth - 20) / textRef.current.scrollWidth);
        textRef.current.style.transform = `scaleX(${scale})`;
    }, [revealed]);

    useEffect(() => {
        fitText();
        window.addEventListener("resize", fitText);
        return () => window.removeEventListener("resize", fitText);
    }, [fitText, answer.answer]);

    const handleClick = useCallback(() => {
        if (revealed) {
            // EFEK AGRESIF SAAT DITEKAN ULANG
            setIsHighlight(true);
            const ding = new Audio('/sounds/wrong-3.mp3'); 
            ding.volume = 0.7;
            ding.play().catch(() => {});
            
            // Durasi efek dibuat lebih singkat tapi intens (500ms)
            setTimeout(() => setIsHighlight(false), 1000); 
            return;
        }

        setRevealed(true);
        const audioFile = answer.isSurprise 
            ? "/sounds/siren.mp3" 
            : index === 0 ? "/sounds/top-survey-5.mp3" : `/sounds/${correctSound}.mp3`;
        
        const audio = new Audio(audioFile);
        audio.play().catch(err => console.log("Audio play blocked:", err));
        
        if (answer.isSurprise) {
            new Audio("/sounds/cashier.mp3").play().catch(() => {});
        }
        
        onScoreChange(answer.poin * multiplier);
    }, [revealed, answer.isSurprise, answer.poin, index, multiplier, correctSound, onScoreChange]);

    useEffect(() => {
        if (!socket) return;
        const handleReveal = (indexSO: number) => {
            if (index === indexSO) handleClick();
        };
        socket.on("set-reveal-answer", handleReveal);
        return () => { socket.off("set-reveal-answer", handleReveal); };
    }, [index, socket, handleClick]);
    
    const getBgColor = () => {
        if (!revealed) {
            return 'bg-gradient-to-b from-slate-800 to-slate-900 border-white/20 hover:border-blue-400/50';
        }

        if (isHighlight) {
            return 'bg-gradient-to-b from-red-500 to-red-700 border-red-400 shadow-[0_0_40px_rgba(220,38,38,0.8)]';
        }

        if (answer.isSurprise) {
            return 'bg-gradient-to-b from-blue-500 to-yellow-700 border-yellow-400 shadow-[0_0_30px_rgba(234,88,12,0.6)] animate-pulse';
        }

        return 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-300';
    };

    return (
        <div 
            onClick={handleClick}
            className={`relative flex items-center justify-between px-6 py-4 rounded-xl shadow-2xl border-2 transition-all duration-100 overflow-hidden cursor-pointer 
                ${getBgColor()} 
                ${isHighlight 
                    ? 'scale-110 z-50 animate-shake brightness-125 ring-8 ring-red-500' 
                    : 'z-10'
                }
            `}
        >
            {/* Index Number */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-4xl shadow-inner transition-all ${
                revealed ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
                {index + 1}
            </div>

            {/* Answer Text */}
            <div ref={containerRef} className="flex-1 flex justify-center px-4 overflow-hidden relative z-10">
                <span 
                    ref={textRef} 
                    className={`text-4xl font-black uppercase transition-all duration-500 whitespace-nowrap origin-center drop-shadow-2xl ${
                        revealed ? 'opacity-100 text-white scale-110' : 'opacity-0 scale-50'
                    } ${isHighlight ? 'text-white' : ''}`}
                >
                    {revealed ? answer.answer : ""}
                </span>
            </div>

            {/* Points */}
            <div className={`w-20 h-12 rounded-lg flex items-center justify-center font-black text-4xl border transition-all ${
                revealed 
                ? 'bg-yellow-400 text-blue-900 border-yellow-200 shadow-lg' 
                : 'bg-slate-700/50 text-slate-500 border-white/5'
            } ${isHighlight ? 'scale-125 bg-white text-red-600' : ''}`}>
                {revealed ? answer.poin : ""}
            </div>
        </div>
    );
}