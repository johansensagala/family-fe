'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GameCard from './components/GameCard';
import Link from 'next/link';
import { PlusCircle, LayoutGrid, Database, Loader2, Heart } from 'lucide-react'; 
import { getAllGames, getAllQuestions, getPublicGames, getFavoriteGames } from '@/services/gameService'; 

// Konstanta Konfigurasi
const LIMIT_PREVIEW = 5;
const LIMIT_PUBLIC_PREVIEW = 4; // Jumlah item sekali pencet load more
const LIMIT_FAVORITE_PREVIEW = 5; // Jumlah item favorit sekali pencet load more
const DEFAULT_OFFSET = 0;

const CardSkeleton = ({ className = "" }) => (
    <div className={`bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden animate-pulse h-full flex flex-col ${className}`}>
        <div className="w-full h-32 bg-gray-700/50 shrink-0" /> 
        <div className="p-4 space-y-3 flex-1">
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
            <div className="h-3 bg-gray-700/50 rounded w-1/2" />
        </div>
    </div>
);

const ExplorePage = () => {
    const [myGames, setMyGames] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [publicGames, setPublicGames] = useState([]); 
    const [favoriteGames, setFavoriteGames] = useState([]); 
    
    const [totalGames, setTotalGames] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalPublicGames, setTotalPublicGames] = useState(0); 
    const [totalFavoriteGames, setTotalFavoriteGames] = useState(0); 
    
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); 
    const [loadingMoreFav, setLoadingMoreFav] = useState(false); 
    const [publicOffset, setPublicOffset] = useState(LIMIT_PUBLIC_PREVIEW); 
    const [favoriteOffset, setFavoriteOffset] = useState(LIMIT_FAVORITE_PREVIEW); 
    const [error, setError] = useState(null);

    // 💡 STATE LIVE SEARCH & DEBOUNCE
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // 💡 1. Efek Debounce: Mengulur waktu perubahan text input selama 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // 💡 2. Trigger Fetch Data Utama (Mendukung parameter debouncedSearch)
    useEffect(() => {
        let timeoutId;
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Pastikan setiap backend endpoint service kamu menerima parameter search (ke-5 atau disesuaikan)
                const [gamesRes, questionsRes, publicGamesRes, favoriteGamesRes] = await Promise.all([
                    getAllGames(LIMIT_PREVIEW, DEFAULT_OFFSET, "", debouncedSearch),
                    getAllQuestions(debouncedSearch, LIMIT_PREVIEW, DEFAULT_OFFSET),
                    getPublicGames(LIMIT_PUBLIC_PREVIEW, DEFAULT_OFFSET, debouncedSearch),
                    // Catatan: Jika getFavoriteGames di BE belum ditambahi parameter search, kamu bisa memfilternya di client-side
                    getFavoriteGames(LIMIT_FAVORITE_PREVIEW, DEFAULT_OFFSET) 
                ]);
                
                setMyGames(gamesRes?.data || []);
                setTotalGames(gamesRes?.total || 0);
                
                setMyQuestions(questionsRes?.data || []);
                setTotalQuestions(questionsRes?.total || 0);
                
                setPublicGames(publicGamesRes?.data || []);
                setTotalPublicGames(publicGamesRes?.total || 0); 
                
                // Jika backend favorit belum mendukung search query, lakukan filter lokal:
                const rawFavs = favoriteGamesRes?.data || [];
                const filteredFavs = debouncedSearch
                    ? rawFavs.filter((g: any) => g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
                    : rawFavs;

                setFavoriteGames(filteredFavs); 
                setTotalFavoriteGames(favoriteGamesRes?.total || 0); 

                // Reset offset setiap kali query pencarian berubah
                setPublicOffset(LIMIT_PUBLIC_PREVIEW);
                setFavoriteOffset(LIMIT_FAVORITE_PREVIEW);
                
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
                console.error("Fetch Error:", errorMessage);
                setError(errorMessage);
            } finally {
                timeoutId = setTimeout(() => setLoading(false), 200);
            }
        };

        fetchData();
        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [debouncedSearch]); // 💡 Pemicu ulang dijalankan saat teks debounced berubah

    // Fungsi Aksi Load More Data Publik
    const handleLoadMorePublic = async () => {
        if (loadingMore) return;
        try {
            setLoadingMore(true);
            const res = await getPublicGames(LIMIT_PUBLIC_PREVIEW, publicOffset, debouncedSearch);
            if (res?.data && res.data.length > 0) {
                setPublicGames((prev) => [...prev, ...res.data]);
                setPublicOffset((prevOffset) => prevOffset + LIMIT_PUBLIC_PREVIEW);
            }
        } catch (err) {
            console.error("Load More Error:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    // Fungsi Aksi Load More Data Favorit
    const handleLoadMoreFavorite = async () => {
        if (loadingMoreFav) return;
        try {
            setLoadingMoreFav(true);
            const res = await getFavoriteGames(LIMIT_FAVORITE_PREVIEW, favoriteOffset);
            if (res?.data && res.data.length > 0) {
                const newFavs = debouncedSearch
                    ? res.data.filter((g: any) => g.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
                    : res.data;
                setFavoriteGames((prev) => [...prev, ...newFavs]);
                setFavoriteOffset((prevOffset) => prevOffset + LIMIT_FAVORITE_PREVIEW);
            }
        } catch (err) {
            console.error("Load More Favorite Error:", err);
        } finally {
            setLoadingMoreFav(false);
        }
    };

    const hasMorePublic = publicGames.length < totalPublicGames;
    const hasMoreFavorite = favoriteGames.length < totalFavoriteGames && !debouncedSearch; 

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                {/* 💡 Kirimkan State & Handler ke Komponen Header */}
                <Header value={searchQuery} onChange={setSearchQuery} />

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-8 text-sm backdrop-blur-sm">
                        ⚠️ <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Section: PUBLIC GAMES */}
                <section className="border border-white/5 rounded-[2.5rem] p-10 bg-gray-900/40 backdrop-blur-sm shadow-2xl relative overflow-hidden mb-14">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-orange-500/10 rounded-2xl">
                            <Database className="text-orange-500" size={28} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Popular Games</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {loading ? (
                             Array(LIMIT_PUBLIC_PREVIEW).fill(0).map((_, i) => (
                                 <CardSkeleton key={`pub-skel-${i}`} className="min-h-[220px]" />
                             ))
                        ) : publicGames.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-4 font-medium text-sm">
                                Tidak ada game populer yang cocok dengan "{debouncedSearch}"
                            </div>
                        ) : (
                            publicGames.map((game: any) => (
                                <GameCard key={game.id} data={game} />
                            ))
                        )}

                        {loadingMore && (
                            Array(LIMIT_PUBLIC_PREVIEW).fill(0).map((_, i) => (
                                <CardSkeleton key={`load-more-skel-${i}`} className="min-h-[220px]" />
                            ))
                        )}
                    </div>

                    {!loading && hasMorePublic && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMorePublic}
                                disabled={loadingMore}
                                className="group flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 font-black text-xs tracking-widest uppercase py-4 px-8 rounded-full border border-orange-500/20 hover:border-orange-500/40 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="animate-spin text-orange-400" size={16} />
                                        Loading Aset...
                                    </>
                                ) : (
                                    "Load More Games"
                                )}
                            </button>
                        </div>
                    )}
                </section>

                {/* Section: FAVORITE GAMES */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-pink-500/10 rounded-xl">
                                <Heart className="text-pink-400 fill-pink-400/20" size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">
                                Favorite Games <span className="text-gray-600 ml-2">({favoriteGames.length})</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={`fav-skel-${i}`} className="h-full">
                                    <CardSkeleton className="min-h-[220px]" />
                                </div>
                            ))
                        ) : favoriteGames.length === 0 ? (
                            <div className="col-span-full border border-dashed border-gray-800 rounded-2xl py-10 text-center text-gray-500 font-medium text-sm">
                                {debouncedSearch ? "Tidak ada game favorit yang cocok" : "Belum ada game yang kamu favoritkan ❤️"}
                            </div>
                        ) : (
                            favoriteGames.map((game: any) => (
                                <GameCard key={game.id} data={game} />
                            ))
                        )}

                        {loadingMoreFav && (
                            Array(LIMIT_FAVORITE_PREVIEW).fill(0).map((_, i) => (
                                <div key={`load-more-fav-skel-${i}`} className="h-full">
                                    <CardSkeleton className="min-h-[220px]" />
                                </div>
                            ))
                        )}
                    </div>

                    {!loading && hasMoreFavorite && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMoreFavorite}
                                disabled={loadingMoreFav}
                                className="group flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 text-pink-400 font-black text-xs tracking-widest uppercase py-4 px-8 rounded-full border border-pink-500/20 hover:border-pink-500/40 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loadingMoreFav ? (
                                    <>
                                        <Loader2 className="animate-spin text-pink-400" size={16} />
                                        Loading Favorit...
                                    </>
                                ) : (
                                    "Load More Favorites"
                                )}
                            </button>
                        </div>
                    )}
                </section>

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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
                        {!debouncedSearch && (
                            <Link href="/explore/add-game" className="group flex flex-col h-full">
                                <div className="border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all h-full min-h-[220px]">
                                    <PlusCircle className="text-gray-600 group-hover:text-green-500 mb-4 transition-all group-hover:scale-110" size={48} strokeWidth={1.5} />
                                    <span className="text-gray-500 group-hover:text-white font-black text-xs tracking-widest uppercase">Add My Game</span>
                                </div>
                            </Link>
                        )}
                        
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={`game-skel-${i}`} className="h-full">
                                    <CardSkeleton className="min-h-[220px]" />
                                </div>
                            ))
                        ) : myGames.length === 0 ? (
                            <div className={`col-span-full border border-dashed border-gray-800 rounded-2xl py-10 text-center text-gray-500 font-medium text-sm ${debouncedSearch ? "" : "lg:col-span-4"}`}>
                                Tidak ada koleksi game yang cocok
                            </div>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
                        {!debouncedSearch && (
                            <Link href="/explore/add-question" className="group flex flex-col h-full">
                                 <div className="border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all min-h-[150px] h-full">
                                    <PlusCircle className="text-gray-600 group-hover:text-yellow-500 mb-3 transition-all group-hover:scale-110" size={32} />
                                    <span className="text-gray-500 group-hover:text-white font-black text-xs tracking-widest uppercase">Add Question</span>
                                </div>
                            </Link>
                        )}

                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={`ques-skel-${i}`} className="h-full">
                                    <CardSkeleton className="min-h-[180px]" />
                                </div>
                            ))
                        ) : myQuestions.length === 0 ? (
                            <div className={`col-span-full border border-dashed border-gray-800 rounded-2xl py-10 text-center text-gray-500 font-medium text-sm ${debouncedSearch ? "" : "lg:col-span-4"}`}>
                                Tidak ada pertanyaan yang cocok
                            </div>
                        ) : (
                            myQuestions.map((q: any) => (
                                <GameCard key={q.id} data={q} isQuestion />
                            ))
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ExplorePage;