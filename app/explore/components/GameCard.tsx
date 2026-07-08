'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, BookPlus, UserCircle, Eye } from 'lucide-react';

interface GameCardProps {
    data: any;
    isOwned?: boolean;
    isQuestion?: boolean; 
}

const GameCard: React.FC<GameCardProps> = ({ data, isOwned, isQuestion }) => {
    
    // 💡 UPDATE 1: Helper diubah untuk mengembalikan null jika data avatar kosong
    const getAvatarSrc = (filename: string) => {
        if (!filename) return null;
        if (filename.startsWith('/uploads') || filename.startsWith('http')) return filename; 
        if (filename.includes('_free_')) return `/assets/avatars/free/${filename}`;
        if (filename.includes('_silver_')) return `/assets/avatars/silver/${filename}`;
        if (filename.includes('_platinum_')) return `/assets/avatars/platinum/${filename}`;
        return null;
    };

    if (isQuestion) {
        return (
            <Link href={`/explore/question/${data.id}`} className="block">
                <div className="bg-[#16213e] border border-gray-700 rounded-2xl p-5 min-h-[150px] flex flex-col justify-between hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden h-full">
                    <div>
                        <h3 className="text-lg font-bold text-gray-100 leading-tight group-hover:text-yellow-400 transition-colors line-clamp-3">
                            {data.question || "Untitled Question"}
                        </h3>
                        <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-medium">
                            {data.answers?.length || 0} Answers
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    const avatarFilename = data.avatar || data.user?.avatar;
    const avatarSrc = getAvatarSrc(avatarFilename);

    // --- MODE MY GAMES & FAVORITE GAMES (Kartu dengan Gambar Utama) ---
    if (isOwned || !data.stats) { 
        return (
            <Link href={`/explore/game/${data.id}`} className="block h-full">
                <div className="bg-[#1e293b] border-2 border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500 transition-all group cursor-pointer flex flex-col h-full relative">
                    <div className="relative h-32 w-full bg-slate-800">
                        <Image 
                            src={data.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500&auto=format&fit=crop'} 
                            alt={data.name || "Game"} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform" 
                            unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                        
                        {/* 💡 UPDATE 2: Kondisi render avatar di pojok kiri atas (Jika null, pakai UserCircle) */}
                        <div className="absolute top-3 left-3 w-7 h-7 rounded-full border border-white/20 bg-gray-950 overflow-hidden shadow-lg flex items-center justify-center">
                            {avatarSrc ? (
                                <img 
                                    src={avatarSrc} 
                                    alt="Author Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircle className="text-gray-400 w-full h-full p-0.5" />
                            )}
                        </div>
                    </div>
                    
                    <div className="p-4 flex-grow">
                        <h3 className="font-bold text-white mb-1 line-clamp-1">
                            {data.name || "Untitled Game"}
                        </h3>
                        {data.category?.name && (
                            <p className="text-orange-400 text-[10px] mt-2 uppercase tracking-widest font-bold">
                                {data.category.name}
                            </p>
                        )}
                        <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold">
                            {data.isPublic ? "Public Game" : "Private"}
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    // --- MODE PUBLIC GAMES (Kartu Besar / Hot Popular) ---
    const cardBg = data.isPack ? 'from-purple-600 to-purple-900' : 'from-orange-400 to-orange-600';
    
    return (
        <Link href={`/explore/game/${data.id}`} className="block h-full">
            <div className="bg-[#1e293b] border border-gray-700 rounded-2xl overflow-hidden shadow-xl flex flex-col group h-full cursor-pointer hover:border-gray-500 transition-all relative">
                <div className={`h-36 w-full bg-gradient-to-b ${cardBg} p-4 flex flex-col justify-between relative`}>
                    <span className="text-4xl font-black italic tracking-tighter text-yellow-300 uppercase leading-none drop-shadow-md">
                        Family <br /> <span className="text-white">Feud</span>
                    </span>
                    
                    {/* 💡 UPDATE 3: Kondisi render badge avatar bulat di bagian bawah header (Jika null, pakai UserCircle) */}
                    <div className="absolute bottom-[-16px] left-4 w-9 h-9 rounded-full bg-gray-900 p-0.5 border border-gray-700 overflow-hidden shadow-xl z-10 flex items-center justify-center">
                        {avatarSrc ? (
                            <img 
                                src={avatarSrc} 
                                alt="Creator Avatar" 
                                className="w-full h-full rounded-full object-cover bg-gray-950" 
                            />
                        ) : (
                            <UserCircle className="text-gray-400 w-full h-full p-1 bg-gray-950 rounded-full" />
                        )}
                    </div>
                </div>
                
                <div className="p-5 pt-7 flex-grow flex flex-col">
                    <h3 className="font-extrabold text-xl text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {data.name || data.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">By {data.author || data.user?.name || 'Community'}</p>
                    
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-4 border-t border-gray-700 pt-3">
                        <span className="font-bold text-blue-400 uppercase tracking-tighter">
                            {data.category?.name || (data.isPack ? 'Question Pack' : 'Community')}
                        </span>
                        <span className="font-bold text-gray-300">{data.rounds?.length || 0} rounds</span>
                    </div>

                    {data.stats && (
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium mb-5 bg-gray-950/30 px-3 py-2 rounded-xl border border-gray-800/50">
                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                                <Eye size={13} className="text-gray-500" /> 
                                {data.stats.views}
                            </span>
                            <span className="text-gray-700">•</span>
                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                                <Play size={11} className="text-gray-500 fill-gray-500" /> 
                                {data.stats.plays} plays
                            </span>
                            
                            {data.stats.avgRating > 0 && (
                                <>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-amber-400 font-bold">
                                        Rating: {data.stats.avgRating.toFixed(1)}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-auto">
                        {data.isPack ? (
                            <div className="w-full bg-blue-600 group-hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase transition-colors">
                                <BookPlus size={16} /> Add to Library
                            </div>
                        ) : (
                            <div className="w-full bg-orange-500 group-hover:bg-orange-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase transition-colors">
                                <Play size={16} className="fill-black" /> Play Now
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;