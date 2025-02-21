'use client';

import { useEffect } from 'react';

export default function Family100Game() {
    // const router = useRouter();

    // Fungsi untuk toggle fullscreen
    function toggleFullscreen() {
        const container = document.getElementById("game-container");
        const buttonContainer = document.getElementById("start-button-container");

        if (!document.fullscreenElement) {
            container?.requestFullscreen().then(() => {
                if (buttonContainer) buttonContainer.style.display = "none";
            });
        } else {
            document.exitFullscreen().then(() => {
                if (buttonContainer) buttonContainer.style.display = "flex";
            });
        }
    }

    // Fungsi untuk memulai babak
    function startRound() {
        toggleFullscreen();
        alert("Babak dimulai!");
    }

    // Shortcut keyboard untuk fullscreen (F11 atau 'f')
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "F11" || event.key === "f") {
                event.preventDefault();
                console.log("testagsa")
                toggleFullscreen();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="bg-blue-900 min-h-screen flex items-center justify-center">
            <div id="game-container" className="max-w-3xl w-full bg-blue-800 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">
                    Family 100
                </h1>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold">
                        Apa makanan favoritmu?
                    </h2>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="bg-blue-700 flex items-center justify-between px-6 py-4 rounded-lg shadow">
                            <span className="text-2xl font-bold">{num}</span>
                            <span className="text-xl font-semibold opacity-50">Jawaban {num}</span>
                            <span className="text-2xl font-bold">{num * 10}</span>
                        </div>
                    ))}
                </div>
                <div id="start-button-container" className="mt-8 flex justify-center">
                    <button onClick={startRound} className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 focus:outline-none">
                        Mulai Babak
                    </button>
                </div>
            </div>
        </div>
    );
}
