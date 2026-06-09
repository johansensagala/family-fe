'use client';
import { motion } from "framer-motion";
import { Hash, Star } from 'lucide-react';

interface PointOverlayProps {
    title: string;
    isBonus?: boolean;
}

export default function PointOverlay({ title, isBonus }: PointOverlayProps) {
    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 1.1, opacity: 0 }}
            className="text-center bg-blue-600/10 border-4 border-blue-400 p-20 rounded-[4rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] backdrop-blur-sm"
        >
            {isBonus ? (
                <Star size={80} className="text-yellow-400 mx-auto mb-6 animate-pulse" />
            ) : (
                <Hash size={80} className="text-yellow-500 mx-auto mb-6 animate-bounce" />
            )}
            
            <h1 className="text-9xl font-black italic text-white tracking-tighter leading-none">
                {title} <br/>
                <span className={isBonus ? "text-purple-400" : "text-yellow-500"}>
                    {isBonus ? "ROUND" : "POINTS"}
                </span>
            </h1>
        </motion.div>
    );
}