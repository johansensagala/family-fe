'use client';

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BonusTimerDisplayProps {
    socketInstance: any;
}

export default function BonusTimerDisplay({ socketInstance }: BonusTimerDisplayProps) {
    const [timerSO, setTimerSO] = useState(0);
    const [isRendered, setIsRendered] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSameAnswerAlert, setIsSameAnswerAlert] = useState(false);

    // Menyimpan instance audio di useRef agar tidak terbuat ulang saat re-render
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Inisialisasi audio hanya sekali di client-side
    useEffect(() => {
        audioRef.current = new Audio('/sounds/timer-music.mp3');
        audioRef.current.loop = true; // Set true jika ingin lagu otomatis mengulang jika durasi timer sangat panjang

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // ==========================================
    // 1. LOGIKA COUNTDOWN INTERVAL LOKAL & AUDIO CONTROL
    // ==========================================
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        const currentAudio = audioRef.current;

        if (isRunning && !isPaused && timerSO > 0) {
            // 1. Mainkan backsound saat timer berjalan aktif
            if (currentAudio) {
                currentAudio.play().catch((err) => {
                    console.log("Gagal memutar backsound (butuh interaksi user pertama):", err);
                });
            }

            // 2. Jalankan hitung mundur per detik
            interval = setInterval(() => {
                setTimerSO((prevSeconds) => {
                    if (prevSeconds <= 1) {
                        if (interval) clearInterval(interval);
                        setIsRunning(false);
                        
                        // Matikan backsound & reset ke detik 0 jika waktu habis
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio.currentTime = 0;
                        }

                        new Audio('/sounds/timeup.mp3').play().catch((err) => {
                            console.log("Gagal memutar suara end (autoplay blocked):", err);
                        });

                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        } else {
            // Jika isRunning false ATAU sedang isPaused true, matikan musik sementara
            if (currentAudio) {
                currentAudio.pause();
                
                // Jika timer di-stop total (timerSO bernilai 0), kembalikan track musik ke detik awal
                if (timerSO === 0) {
                    currentAudio.currentTime = 0;
                }
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, isPaused, timerSO]);


    // ==========================================
    // 2. MANAGEMENT SOCKET LISTENER
    // ==========================================
    useEffect(() => {
        if (!socketInstance) return;

        const handleShowTimer = (customTimerValue: number) => {
            new Audio(`/sounds/timer.mp3`).play().catch(() => {});
            setTimerSO(customTimerValue || 0);
            setIsRendered(true);
        };

        const handleStartTimer = (customTimerValue: number | null) => {
            if (customTimerValue !== null && customTimerValue !== undefined) {
                setTimerSO(customTimerValue);
            }
            
            setIsPaused(false); 
            setIsRunning(true); 
            setIsRendered(true); 
        };

        const handleStopTimer = () => {
            setTimerSO(0);
            setIsPaused(false);
            setIsRunning(false);
            setIsSameAnswerAlert(false);
            setIsRendered(false);
        };

        const handlePauseTimer = () => {
            setIsPaused(true);
        };

        const handleSameAnswer = () => {
            setIsSameAnswerAlert(true);
            setTimeout(() => {
                setIsSameAnswerAlert(false);
            }, 2000);
        };

        socketInstance.on("show-timer-display", handleShowTimer);
        socketInstance.on("set-start-timer", handleStartTimer);
        socketInstance.on("set-stop-timer", handleStopTimer);
        socketInstance.on("set-pause-timer", handlePauseTimer);
        socketInstance.on("trigger-same-answer", handleSameAnswer);

        return () => {
            socketInstance.off("show-timer-display", handleShowTimer);
            socketInstance.off("set-start-timer", handleStartTimer);
            socketInstance.off("set-stop-timer", handleStopTimer);
            socketInstance.off("set-pause-timer", handlePauseTimer);
            socketInstance.off("trigger-same-answer", handleSameAnswer);
        };
    }, [socketInstance]);

    return (
        <div className="flex items-center justify-center w-full select-none min-h-[40rem]">
            <AnimatePresence mode="wait">
                {isRendered && (
                    <motion.div
                        key="timer-numeric"
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ 
                            opacity: 1, 
                            scale: isPaused || isSameAnswerAlert ? 1 : timerSO <= 5 && timerSO > 0 ? 1.05 : 1 
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 20,
                            scale: { duration: 0.2 }
                        }}
                        className={`text-[30rem] font-black font-mono leading-none tracking-tight transition-all duration-300 ${
                            isPaused || isSameAnswerAlert
                                ? "text-red-500 animate-pulse drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                                : timerSO <= 5 && timerSO > 0
                                    ? "text-red-500 drop-shadow-[0_0_60px_rgba(239,68,68,0.8)]"
                                    : "text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                        }`}
                    >
                        {timerSO}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}