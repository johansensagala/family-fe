'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, BookPlus, Star, UserCircle, Bookmark } from 'lucide-react';

interface GameCardProps {
    data: any;
    isOwned?: boolean;
    isQuestion?: boolean; // Prop untuk mode pertanyaan
}

const GameCard: React.FC<GameCardProps> = ({ data, isOwned, isQuestion }) => {
    
    // --- MODE MY QUESTIONS (Kartu Navy Gelap) ---
    if (isQuestion) {
        return (
            <Link href={`/explore/question/${data.id}`} className="block">
                <div className="bg-[#16213e] border border-gray-700 rounded-2xl p-5 min-h-[180px] flex flex-col justify-between hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden h-full">
                    <div>
                        <h3 className="text-lg font-bold text-gray-100 leading-tight group-hover:text-yellow-400 transition-colors line-clamp-3">
                            {data.question || "Untitled Question"}
                        </h3>
                        <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-medium">
                            {data.answers?.length || 0} Answers
                        </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <Bookmark size={18} className="text-orange-500 fill-orange-500/20" />
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // --- MODE MY GAMES (Kartu dengan Gambar) ---
    if (isOwned) {
        return (
            <Link href={`/explore/game/${data.id}`} className="block h-full">
                <div className="bg-[#1e293b] border-2 border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500 transition-all group cursor-pointer flex flex-col h-full">
                    <div className="relative h-32 w-full bg-slate-800">
                        <Image 
                            src={data.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500&auto=format&fit=crop'} 
                            alt={data.name || "Game"} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                        <Star className="absolute top-3 right-3 text-gray-400 group-hover:text-yellow-400" size={18} />
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

    // --- MODE PUBLIC GAMES (Kartu Besar/Main) ---
    const cardBg = data.isPack ? 'from-purple-600 to-purple-900' : 'from-orange-400 to-orange-600';
    
    return (
        <Link href={`/explore/game/${data.id}`} className="block h-full">
            <div className="bg-[#1e293b] border border-gray-700 rounded-2xl overflow-hidden shadow-xl flex flex-col group h-full cursor-pointer hover:border-gray-500 transition-all">
                <div className={`h-36 w-full bg-gradient-to-b ${cardBg} p-4 flex flex-col justify-between relative`}>
                    <Star className="absolute top-3 right-3 text-white/50" size={16} />
                    <span className="text-4xl font-black italic tracking-tighter text-yellow-300 uppercase leading-none drop-shadow-md">
                        Family <br /> <span className="text-white">Feud</span>
                    </span>
                    <div className="absolute bottom-[-15px] left-4 bg-gray-900 p-1 rounded-full border border-gray-700">
                        <UserCircle className="text-gray-400" size={24} />
                    </div>
                </div>
                
                <div className="p-5 pt-7 flex-grow flex flex-col">
                    <h3 className="font-extrabold text-xl text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {data.name || data.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">By {data.author || 'Community'}</p>
                    
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-5 border-t border-gray-700 pt-3">
                        <span className="font-bold text-blue-400 uppercase tracking-tighter">
                            {data.category?.name || (data.isPack ? 'Question Pack' : 'Community')}
                        </span>
                        <span className="font-bold text-gray-300">{data.plays || 0} rounds</span>
                    </div>

                    <div className="mt-auto">
                        {data.isPack ? (
                            <div className="w-full bg-blue-600 group-hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase transition-colors">
                                <BookPlus size={16} /> Add to Library
                            </div>
                        ) : (
                            <div className="w-full bg-orange-500 group-hover:bg-orange-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase transition-colors">
                                <Play size={16} /> Play Now
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GameCard;