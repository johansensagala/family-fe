'use client';

import { useState, useRef } from 'react'

type BuzzerType = 'A' | 'B' | null

export default function Home() {
    const [lastPressed, setLastPressed] = useState<{ buzzer: BuzzerType; time: number } | null>(null)
    const [locked, setLocked] = useState(false)
    const [activeBuzzer, setActiveBuzzer] = useState<BuzzerType>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handlePress = (buzzer: BuzzerType) => {
        if (locked || !buzzer) return

        const now = performance.now()

        if (!lastPressed) {
            setLastPressed({ buzzer, time: now })
            setActiveBuzzer(buzzer)
            playSound()
            lockInput()
        } else if (now - lastPressed.time <= 3000) {
            // Tekanan kedua dalam 3 detik diabaikan
        } else {
            setLastPressed({ buzzer, time: now })
            setActiveBuzzer(buzzer)
            playSound()
            lockInput()
        }
    }

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(err => console.error('Gagal memutar suara:', err))
        }
    }

    const lockInput = () => {
        setLocked(true)
        timeoutRef.current = setTimeout(() => {
            setLocked(false)
            setLastPressed(null)
            setActiveBuzzer(null)
        }, 3000)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 px-4">
            <div className="flex flex-col gap-10 w-full items-center">
                <button
                    onTouchStart={() => handlePress('A')}
                    onClick={() => handlePress('A')} // fallback desktop
                    className={`w-48 h-48 mb-20 rounded-full text-white text-xl font-bold transition duration-150 ease-in-out transform focus:outline-none relative shadow-lg active:scale-90
                    ${activeBuzzer === 'A'
                        ? 'bg-red-600 ring-4 ring-red-300 shadow-red-500 animate-pulse'
                        : 'bg-red-500 hover:bg-red-600'}`}
                >
                    Buzzer A
                </button>

                <button
                    onTouchStart={() => handlePress('B')}
                    onClick={() => handlePress('B')} // fallback desktop
                    className={`w-48 h-48 mt-20 rounded-full text-white text-xl font-bold transition duration-150 ease-in-out transform focus:outline-none relative shadow-lg active:scale-90
                    ${activeBuzzer === 'B'
                        ? 'bg-blue-600 ring-4 ring-blue-300 shadow-blue-500 animate-pulse'
                        : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                    Buzzer B
                </button>
            </div>

            <audio ref={audioRef} src="/sounds/school-bell.mp3" />
        </div>
    )
}
