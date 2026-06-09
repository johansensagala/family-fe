'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { LayoutGrid, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { getAllGames } from '@/services/gameService';
import { useRouter } from 'next/navigation';

const MyGamesPage = () => {
    const router = useRouter();
    const [games, setGames] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const limit = 10;

    const observerTarget = useRef(null);

    // 1. Perbaikan Fungsi Fetch: Pastikan param 'search' dikirim ke API
    const fetchGamesData = async (currentOffset: number, isInitial: boolean, search = '') => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            // PERBAIKAN: Masukkan variable 'search' ke parameter ke-4 getAllGames
            const res = await getAllGames(limit, currentOffset, "", search); 
            
            const fetchedData = res.data || [];
            const totalData = res.total || 0;

            if (isInitial) {
                setGames(fetchedData);
                setOffset(limit);
                setTotal(totalData);
                setHasMore(fetchedData.length < totalData);
            } else {
                const updatedGames = [...games, ...fetchedData];
                setGames(updatedGames);
                setOffset(prev => prev + limit);
                setHasMore(updatedGames.length < totalData);
            }
        } catch (err) {
            console.error("Failed to fetch games:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 2. Perbaikan Debounce: 500ms adalah standar kenyamanan user
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchGamesData(0, true, searchQuery);
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // 3. Infinite Scroll Observer
    const loadMoreGames = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchGamesData(offset, false, searchQuery);
        }
    }, [loadingMore, hasMore, offset, searchQuery, games]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMoreGames();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMoreGames]);

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                {/* <Header /> */}

                {/* Header Area */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <LayoutGrid className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                                My Games
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                                {total} Collections
                            </p>
                        </div>
                    </div>

                    {/* LIVE SEARCH BAR */}
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari koleksi game..."
                            className="bg-gray-800/40 border border-gray-700/50 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all w-full font-bold text-sm text-white"
                        />
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {Array(10).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-800/40 rounded-3xl animate-pulse border border-gray-700/50" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                            {games.map((game: any) => (
                                <GameCard key={game.id} data={game} isOwned />
                            ))}

                            {loadingMore && (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-64 bg-gray-800/40 rounded-3xl animate-pulse border border-gray-700/50" />
                                ))
                            )}
                        </div>

                        {/* Sentinel for Infinite Scroll */}
                        <div ref={observerTarget} className="h-32 flex flex-col items-center justify-center mt-10">
                            {hasMore && !loadingMore && games.length > 0 && (
                                <div className="flex items-center gap-3 text-blue-400/30">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="font-black italic uppercase tracking-widest text-[10px]">Scanning more...</span>
                                </div>
                            )}
                            {!hasMore && games.length > 0 && (
                                <p className="text-gray-600 font-black italic uppercase tracking-tighter text-xs">End of collection</p>
                            )}
                        </div>
                    </>
                )}

                {/* Empty Search State */}
                {!loading && games.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem] opacity-50 bg-gray-800/10">
                        <Search size={48} className="text-gray-700 mb-4" />
                        <h3 className="text-sm font-black uppercase italic text-gray-400">Tidak ada hasil untuk "{searchQuery}"</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyGamesPage;