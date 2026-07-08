'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Mail, 
    Calendar, 
    Award, 
    Gamepad2, 
    HelpCircle, 
    Heart, 
    Grid, 
    FolderHeart,
    ChevronRight,
    Edit3,
    Loader2
} from 'lucide-react';
import Sidebar from '../explore/components/Sidebar';
import Header from '../explore/components/Header';
import { fetchWithAuth } from '@/services/authService';
import { getAllGames, getFavoriteGames } from '@/services/gameService';

const LIMIT_PROFILE_TAB = 6; 

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'my-games' | 'favorites'>('my-games');
    
    // State Data Dinamis
    const [userProfile, setUserProfile] = useState<any>(null);
    const [myGames, setMyGames] = useState<any[]>([]);
    const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
    
    // State Tracker Pagination & Total Data
    const [myGamesOffset, setMyGamesOffset] = useState(LIMIT_PROFILE_TAB);
    const [favGamesOffset, setFavGamesOffset] = useState(LIMIT_PROFILE_TAB);
    const [totalMyGames, setTotalMyGames] = useState(0);
    const [totalFavGames, setTotalFavGames] = useState(0);

    // State Loading & Error
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 💡 UPDATE 1: Helper function penentu path folder aset agar mengarah ke folder/file lingkaran yang benar
    const getAvatarSrc = (filename: string) => {
        if (!filename) return '/assets/avatars/free/avatar_free_1.png';
        if (filename.startsWith('/uploads') || filename.startsWith('http')) return filename; 
        if (filename.includes('_free_')) return `/assets/avatars/free/${filename}`;
        if (filename.includes('_silver_')) return `/assets/avatars/silver/${filename}`;
        if (filename.includes('_platinum_')) return `/assets/avatars/platinum/${filename}`;
        return `/assets/avatars/free/avatar_free_1.png`;
    };

    useEffect(() => {
        const fetchInitialDataAndProfile = async () => {
            try {
                setLoadingProfile(true);
                
                const [profileRes, myGamesRes, favGamesRes] = await Promise.all([
                    fetchWithAuth('/users/me'),
                    getAllGames(LIMIT_PROFILE_TAB, 0, "questions"),
                    getFavoriteGames(LIMIT_PROFILE_TAB, 0)
                ]);

                setUserProfile(profileRes);
                setMyGames(myGamesRes?.data || []);
                setTotalMyGames(myGamesRes?.total || 0);
                setFavoriteGames(favGamesRes?.data || []);
                setTotalFavGames(favGamesRes?.total || 0);

            } catch (err) {
                console.error("Gagal memuat inisialisasi awal halaman profil:", err);
                setError("Gagal mengambil data profil.");
            } finally {
                setLoadingProfile(false);
            }
        };
        
        fetchInitialDataAndProfile();
    }, []);

    useEffect(() => {
        if (loadingProfile) return;

        const fetchTabDataOnSwitch = async () => {
            try {
                setLoadingTab(true);
                if (activeTab === 'my-games') {
                    const res = await getAllGames(LIMIT_PROFILE_TAB, 0);
                    setMyGames(res?.data || []);
                    setTotalMyGames(res?.total || 0);
                    setMyGamesOffset(LIMIT_PROFILE_TAB); 
                } else {
                    const res = await getFavoriteGames(LIMIT_PROFILE_TAB, 0);
                    setFavoriteGames(res?.data || []);
                    setTotalFavGames(res?.total || 0);
                    setFavGamesOffset(LIMIT_PROFILE_TAB); 
                }
            } catch (err) {
                console.error(`Gagal menyegarkan tab ${activeTab}:`, err);
            } finally {
                setLoadingTab(false);
            }
        };

        fetchTabDataOnSwitch();
    }, [activeTab]);

    const handleLoadMore = async () => {
        if (loadingMore) return;
        try {
            setLoadingMore(true);
            if (activeTab === 'my-games') {
                const res = await getAllGames(LIMIT_PROFILE_TAB, myGamesOffset);
                if (res?.data && res.data.length > 0) {
                    setMyGames((prev) => [...prev, ...res.data]);
                    setMyGamesOffset((prevOffset) => prevOffset + LIMIT_PROFILE_TAB);
                }
            } else {
                const res = await getFavoriteGames(LIMIT_PROFILE_TAB, favGamesOffset);
                if (res?.data && res.data.length > 0) {
                    setFavoriteGames((prev) => [...prev, ...res.data]);
                    setFavGamesOffset((prevOffset) => prevOffset + LIMIT_PROFILE_TAB);
                }
            }
        } catch (err) {
            console.error("Gagal memuat data tambahan:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] text-white p-10 font-bold uppercase italic">
                {error || "Sesi tidak ditemukan."}
            </div>
        );
    }

    const formattedDate = new Date(userProfile.createdAt).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
    });

    const hasMoreData = activeTab === 'my-games' 
        ? myGames.length < totalMyGames 
        : favoriteGames.length < totalFavGames;

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                <Header />

                <div className="max-w-5xl mx-auto space-y-8 mt-4">
                    
                    {/* 1. HERO PROFILE CARD */}
                    <div className="relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[2.5rem] border border-white/5 p-8 overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                            
                            {/* 💡 UPDATE 2: Tampilan Frame Avatar diubah menjadi Lingkaran Penuh (rounded-full + object-cover) */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-950 flex items-center justify-center shadow-2xl shrink-0 border border-white/10 overflow-hidden">
                                <img 
                                    src={getAvatarSrc(userProfile.avatar)} 
                                    alt="User Profile Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* User Info */}
                            <div className="text-center sm:text-left flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                                    <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
                                        {userProfile.name}
                                    </h1>
                                    <span className="inline-flex items-center self-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                                        {userProfile.role}
                                    </span>
                                </div>
                                <p className="text-gray-400 font-semibold text-sm sm:text-base">Kreator Family Feud</p>
                                
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-gray-500 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Mail size={16} className="text-gray-400" />
                                        <span>{userProfile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>Bergabung {formattedDate}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/profile/edit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900/60 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-white/10 transition-all active:scale-95 shrink-0 shadow-lg">
                                <Edit3 size={16} /> Edit Profil
                            </Link>
                        </div>
                    </div>

                    {/* 2. STATS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-md">
                            <div className="p-3.5 bg-orange-500/10 rounded-xl text-orange-500">
                                <Gamepad2 size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Game Dibuat</p>
                                <h3 className="text-2xl font-black text-white mt-0.5">
                                    {userProfile.stats?.gamesCreated ?? 0}
                                </h3>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-md">
                            <div className="p-3.5 bg-yellow-500/10 rounded-xl text-yellow-500">
                                <HelpCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Pertanyaan</p>
                                <h3 className="text-2xl font-black text-white mt-0.5">
                                    {userProfile.stats?.questionsCreated ?? 0}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-md">
                            <div className="p-3.5 bg-pink-500/10 rounded-xl text-pink-400">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Dimainkan</p>
                                <h3 className="text-2xl font-black text-white mt-0.5">
                                    {(userProfile.stats?.totalPlays ?? 0).toLocaleString('id-ID')}x
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* 3. TABS NAVIGATION */}
                    <div className="space-y-4">
                        <div className="flex border-b border-white/5 gap-6">
                            <button 
                                onClick={() => setActiveTab('my-games')}
                                className={`flex items-center gap-2 pb-3 font-black uppercase text-xs tracking-widest transition-all relative ${
                                    activeTab === 'my-games' ? 'text-orange-400' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Grid size={16} /> Game Saya <span className="text-gray-600 font-bold ml-1">({totalMyGames})</span>
                                {activeTab === 'my-games' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full"></div>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('favorites')}
                                className={`flex items-center gap-2 pb-3 font-black uppercase text-xs tracking-widest transition-all relative ${
                                    activeTab === 'favorites' ? 'text-pink-400' : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <FolderHeart size={16} /> Favorit <span className="text-gray-600 font-bold ml-1">({totalFavGames})</span>
                                {activeTab === 'favorites' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-400 rounded-full"></div>
                                )}
                            </button>
                        </div>

                        {/* 4. LIST CONTENT BASED ON TAB */}
                        {loadingTab ? (
                            <div className="flex py-12 justify-center w-full">
                                <Loader2 className="animate-spin text-gray-500" size={24} />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeTab === 'my-games' ? (
                                        myGames.length === 0 ? (
                                            <div className="col-span-full text-center py-12 border border-dashed border-white/5 rounded-2xl text-gray-500 font-medium text-sm">
                                                Belum ada game yang dibuat. Yuk buat kuis pertamamu!
                                            </div>
                                        ) : (
                                            myGames.map((game) => (
                                                <Link 
                                                    href={`/explore/game/${game.id}`} 
                                                    key={game.id}
                                                    className="group bg-gray-900/20 hover:bg-gray-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:border-white/10 cursor-pointer"
                                                >
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                                                            {game.category?.name || 'General'}
                                                        </span>
                                                        <h4 className="font-bold text-white text-base pt-1 group-hover:text-blue-400 transition-colors">
                                                            {game.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {game.rounds?.length || 0} Ronde tersedia
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </Link>
                                            ))
                                        )
                                    ) : (
                                        favoriteGames.length === 0 ? (
                                            <div className="col-span-full text-center py-12 border border-dashed border-white/5 rounded-2xl text-gray-500 font-medium text-sm">
                                                Belum ada game favorit. Tekan ❤️ pada game publik untuk menambahkannya ke sini!
                                            </div>
                                        ) : (
                                            favoriteGames.map((fav) => (
                                                <Link 
                                                    href={`/explore/game/${fav.id}`} 
                                                    key={fav.id}
                                                    className="group bg-gray-900/20 hover:bg-gray-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:border-white/10 cursor-pointer"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-pink-400 bg-pink-500/5 px-2 py-0.5 rounded border border-pink-500/10">
                                                                {fav.category?.name || 'Public'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">Oleh {fav.author}</span>
                                                        </div>
                                                        <h4 className="font-bold text-white text-base pt-1 group-hover:text-pink-400 transition-colors">
                                                            {fav.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {fav.rounds?.length || 0} Ronde kuis tersedia
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/10 transition-all shrink-0">
                                                        <Heart size={16} fill="currentColor" className="text-pink-500" />
                                                    </div>
                                                </Link>
                                            ))
                                        )
                                    )}

                                    {loadingMore && Array(2).fill(0).map((_, i) => (
                                        <div key={`load-more-skel-${i}`} className="bg-gray-900/10 border border-white/5 rounded-2xl p-5 animate-pulse h-[98px] flex items-center justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 bg-gray-800 rounded w-1/4" />
                                                <div className="h-4 bg-gray-800 rounded w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {!loadingTab && hasMoreData && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className={`group flex items-center gap-2 font-black text-xs tracking-widest uppercase py-4 px-8 rounded-full border transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                                                activeTab === 'my-games'
                                                    ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 hover:border-orange-500/40'
                                                    : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20 hover:border-pink-500/40'
                                            }`}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <Loader2 className={`animate-spin ${activeTab === 'my-games' ? 'text-orange-400' : 'text-pink-400'}`} size={16} />
                                                    Memuat Konten...
                                                </>
                                            ) : (
                                                "Load More Assets"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}