'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GameCard from './components/GameCard';
import Link from 'next/link';
import { PlusCircle, LayoutGrid, Database } from 'lucide-react';
import { getAllGames, getAllQuestions } from '@/services/gameService'; 

// Komponen Skeleton Lokal untuk penggunaan ulang
const CardSkeleton = () => (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden animate-pulse h-full flex flex-col">
        {/* Area Image Skeleton */}
        <div className="w-full h-32 bg-gray-700/50 shrink-0" /> 
        {/* Area Content Skeleton */}
        <div className="p-4 space-y-3 flex-1">
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
            <div className="h-3 bg-gray-700/50 rounded w-1/2" />
        </div>
    </div>
);

const ExplorePage = () => {
    const [myGames, setMyGames] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [gamesRes, questionsRes] = await Promise.all([
                    getAllGames(5, 0),
                    getAllQuestions("", 5, 0)
                ]);
                
                setMyGames(gamesRes?.data || []);
                setTotalGames(gamesRes?.total || 0);
                setMyQuestions(questionsRes?.data || []);
                setTotalQuestions(questionsRes?.total || 0);
                
            } catch (err: any) {
                console.error("Fetch Error:", err.message);
                setError(err.message);
            } finally {
                // Beri sedikit delay agar transisi skeleton ke card tidak terlalu kaget
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchData();
    }, []);

    const publicGames = [
        { id: 101, title: 'Pop Culture Mania', author: 'Admin', plays: 8, image: '/bg-stage.jpg', isPack: false },
    ];

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                <Header />

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-8 text-sm backdrop-blur-sm">
                        ⚠️ <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Section: MY GAMES */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <LayoutGrid className="text-blue-400" size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">
                                My Games <span className="text-gray-600 ml-2">({totalGames})</span>
                            </h2>
                        </div>
                        {totalGames > 5 && (
                            <Link href="/explore/my-games" className="text-blue-400 font-bold hover:text-blue-300 transition-colors text-xs uppercase tracking-widest bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/20">
                                View All
                            </Link>
                        )}
                    </div>

                    {/* Di dalam grid MY GAMES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
                        <Link href="/explore/add-game" className="group flex flex-col h-full">
                            {/* Tombol Add sekarang punya min-h sebagai patokan dasar tinggi baris */}
                            <div className="border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all h-full min-h-[220px]">
                                <PlusCircle className="text-gray-600 group-hover:text-green-500 mb-4 transition-all group-hover:scale-110" size={48} strokeWidth={1.5} />
                                <span className="text-gray-500 group-hover:text-white font-black text-xs tracking-widest uppercase">Add My Game</span>
                            </div>
                        </Link>
                        
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={`game-skel-${i}`} className="h-full">
                                    <CardSkeleton />
                                </div>
                            ))
                        ) : (
                            myGames.map((game: any) => (
                                <GameCard key={game.id} data={game} isOwned />
                            ))
                        )}
                    </div>
                </section>

                {/* Section: MY QUESTIONS */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-yellow-500/10 rounded-xl">
                                <Database className="text-yellow-500" size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">
                                My Questions <span className="text-gray-600 ml-2">({totalQuestions})</span>
                            </h2>
                        </div>
                        {totalQuestions > 5 && (
                            <Link href="/explore/my-questions" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors text-xs uppercase tracking-widest bg-yellow-500/5 px-4 py-2 rounded-full border border-yellow-500/20">
                                View All
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <Link href="/explore/add-question" className="group">
                             <div className="border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all min-h-[180px] h-full">
                                <PlusCircle className="text-gray-600 group-hover:text-yellow-500 mb-3 transition-all group-hover:scale-110" size={32} />
                                <span className="text-gray-500 group-hover:text-white font-black text-xs tracking-widest uppercase">Add Question</span>
                            </div>
                        </Link>

                        {loading ? (
                            Array(4).fill(0).map((_, i) => <CardSkeleton key={`ques-skel-${i}`} height="min-h-[180px]" />)
                        ) : (
                            myQuestions.map((q: any) => (
                                <GameCard key={q.id} data={q} isQuestion />
                            ))
                        )}
                    </div>
                </section>

                {/* Section: PUBLIC GAMES */}
                <section className="border border-white/5 rounded-[2.5rem] p-10 bg-gray-900/40 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-orange-500/10 rounded-2xl">
                            <Database className="text-orange-500" size={28} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Free Public Games</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {loading ? (
                             Array(4).fill(0).map((_, i) => <CardSkeleton key={`pub-skel-${i}`} />)
                        ) : (
                            publicGames.map(game => (
                                <GameCard key={game.id} data={game} />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ExplorePage;