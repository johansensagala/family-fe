'use client';
import { motion } from 'framer-motion';

interface ParticleProps {
    count?: number;
    color?: string;
}

export default function MidnightStudio({ count = 50, color = "#fff" }: ParticleProps) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-3">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full opacity-0"
                    style={{
                        width: Math.random() * 6 + 2 + 'px', // Ukuran acak 2px - 8px
                        height: Math.random() * 6 + 2 + 'px',
                        backgroundColor: color,
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [0, Math.random() * -100 - 50], // Bergerak ke atas
                        opacity: [0, Math.random() * 0.5 + 0.1, 0], // Memudar masuk lalu keluar
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10, // Durasi acak 10s - 20s
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10, // Delay acak agar tidak muncul bareng
                    }}
                />
            ))}
        </div>
    );
}