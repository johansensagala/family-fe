'use client';
import { motion } from 'framer-motion';

interface ParticleProps {
    count?: number;
}

export default function QuantumField({ count = 100 }: ParticleProps) {
    // Membuat array posisi acak yang merata di seluruh layar
    const particles = [...Array(count)].map((_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        // Posisi awal acak dari 0% - 100% (Merata)
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        // Pergerakan acak pelan
        moveX: Math.random() * 20 - 10, // -10% ke 10%
        moveY: Math.random() * 20 - 10,
        duration: Math.random() * 10 + 10, // 10s - 20s (Pelan agar tidak pusing)
        delay: Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#00010a]">
            
            {/* 1. Grid Pattern Statis (Menyelimuti Seluruh Layar) */}
            <div 
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px', // Ukuran kotak grid
                }}
            />

            {/* 2. Glow Orbs Merata di Pojok-Pojok */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-900/30 rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-blue-900/30 rounded-full blur-[120px]" />
            </div>

            {/* 3. Partikel Dinamis Merata */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-blue-400 opacity-0 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)] blur-[0.5px]"
                    style={{
                        width: p.size + 'px',
                        height: p.size + 'px',
                        left: p.initialX + '%',
                        top: p.initialY + '%',
                    }}
                    animate={{
                        // Bergerak pelan di area posisinya
                        x: [0, p.moveX + '%', 0],
                        y: [0, p.moveY + '%', 0],
                        opacity: [0, Math.random() * 0.5 + 0.2, 0], // Kedip pelan
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                />
            ))}

            {/* 4. Vignette Akhir agar fokus tetap di tengah */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000_110%)] opacity-80" />
        </div>
    );
}