'use client';
import { motion } from 'framer-motion';

interface ParticleProps {
    count?: number;
}

export default function WinterWonderland({ count = 80 }: ParticleProps) {
    const snowflakes = [...Array(count)].map((_, i) => ({
        id: i,
        size: Math.random() * 8 + 2, // Variasi ukuran salju
        left: Math.random() * 100,
        duration: Math.random() * 10 + 15, // Jatuh perlahan
        delay: Math.random() * 20,
        drift: Math.random() * 100 - 50, // Goyangan ke samping saat jatuh
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#050b18]">
            
            {/* 1. Aurora Borealis Efek (Latar Belakang) */}
            <motion.div 
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d3d31_0%,_transparent_70%)] opacity-40"
            />

            {/* 2. Spotlight Hangat (Warna Candle Light) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-[radial-gradient(circle_at_bottom,_rgba(234,179,8,0.1)_0%,_transparent_70%)]" />

            {/* 3. Salju Jatuh Merata */}
            {snowflakes.map((s) => (
                <motion.div
                    key={s.id}
                    className="absolute bg-white rounded-full opacity-80"
                    style={{
                        width: s.size + 'px',
                        height: s.size + 'px',
                        left: s.left + '%',
                        top: '-10%',
                        filter: s.size > 5 ? 'blur(1px)' : 'none', // Salju besar agak blur (bokeh)
                        boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, s.drift],
                        rotate: 360,
                    }}
                    transition={{
                        duration: s.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: -s.delay, // Agar salju sudah ada di layar saat render pertama
                    }}
                />
            ))}

            {/* 4. Frost Effect (Pinggiran Layar) */}
            <div className="absolute inset-0 border-[40px] border-transparent shadow-[inset_0_0_100px_rgba(255,255,255,0.1)] opacity-50" />
        </div>
    );
}