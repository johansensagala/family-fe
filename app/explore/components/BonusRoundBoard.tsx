'use client';

import { motion } from "framer-motion";
import { useState, useRef, useCallback, useLayoutEffect } from "react";

interface BonusRoundBoardProps {
    data: {
        answers: string[];
        scores: string[];
        topAnswers?: boolean[]; // Tambahkan properti ini untuk menandai Top Answer
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15 // Jeda antar kotak saat muncul (0.15 detik)
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
};

const AnswerRow = ({ answer, cIdx, isTop }: { answer: string, cIdx: number, isTop: boolean }) => {
    const [scale, setScale] = useState(1);
    const [ready, setReady] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const fitText = useCallback(() => {
        if (!containerRef.current || !textRef.current) return;
        const containerWidth = containerRef.current.offsetWidth - 64;
        const textWidth = textRef.current.scrollWidth;
        const newScale = textWidth > containerWidth && containerWidth > 0 ? containerWidth / textWidth : 1;
        setScale(newScale);
    }, []);

    useLayoutEffect(() => {
        setReady(false);
        fitText();
        const t = setTimeout(() => setReady(true), 50);
        return () => clearTimeout(t);
    }, [answer, fitText]);

    return (
        <div
            ref={containerRef}
            className="flex-1 rounded-2xl flex items-center px-8 overflow-hidden border-[3px] transition-all duration-500 bg-gradient-to-r from-slate-800 to-slate-900 border-blue-500/30"
        >
            <div className={`w-full flex ${cIdx === 0 ? 'justify-start' : 'justify-end'}`}>
                <motion.span
                    key={answer}
                    ref={textRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        scaleX: scale,
                        transformOrigin: cIdx === 0 ? 'left' : 'right',
                        display: 'inline-block'
                    }}
                    className="text-4xl font-black uppercase whitespace-nowrap drop-shadow-md text-white"
                >
                    {answer}
                </motion.span>
            </div>
        </div>
    );
};

export default function BonusRoundBoard({ data }: BonusRoundBoardProps) {
    const columns = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9]];

    const [showText, setShowText] = useState(false);

    useLayoutEffect(() => {
        const timer = setTimeout(() => {
            setShowText(true);
        }, 1500); // Batasi delay tepat 2 detik

        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-7xl grid grid-cols-2 gap-12 p-12 bg-gradient-to-b from-slate-800 via-slate-900 to-black rounded-[3.5rem] border-[6px] border-blue-500/20"
        >
            {columns.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col justify-center">
                    {col.map(idx => {
                        const score = data.scores[idx];
                        const isTop = data.topAnswers ? data.topAnswers[idx] : false;

                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className={`flex gap-4 h-20 mb-4 ${cIdx === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                {/* 1. Kirim prop showText ke AnswerRow */}
                                <AnswerRow 
                                    answer={showText ? data.answers[idx] : ""} 
                                    cIdx={cIdx} 
                                    isTop={isTop} 
                                />

                                <div className={`w-28 border-[3px] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
                                    isTop && showText
                                    ? "bg-white border-yellow-400 shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse" 
                                    : ""
                                }`}>
                                    {/* 2. Sembunyikan angka skor jika showText masih false */}
                                    <span className={`text-4xl font-black ${isTop ? "text-red-600" : "text-white"}`}>
                                        {showText ? score : ""}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </motion.div>
    );
}