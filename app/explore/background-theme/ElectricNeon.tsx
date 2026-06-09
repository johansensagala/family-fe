'use client';
import { motion } from 'framer-motion';

export default function SupernovaWarp({ count = 80 }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
            {/* Core Glow (Pusat Cahaya) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]" />
            
            {[...Array(count)].map((_, i) => {
                const angle = Math.random() * Math.PI * 2; // Sudut acak 360 derajat
                const distance = 800; // Jarak terbang partikel
                
                return (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_12px_#fff]"
                        initial={{ 
                            x: 0, 
                            y: 0, 
                            scale: 0, 
                            opacity: 0 
                        }}
                        animate={{
                            x: Math.cos(angle) * distance,
                            y: Math.sin(angle) * distance,
                            scale: [0, 4, 12], // Membesar saat "mendekat" ke kamera
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 2 + 1,
                            repeat: Infinity,
                            ease: "easeIn",
                            delay: Math.random() * 5,
                        }}
                    />
                );
            })}

            {/* Overlay Flash (Efek kedip halus) */}
            <motion.div 
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 pointer-events-none"
            />
        </div>
    );
}