'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import { Database, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { getAllQuestions } from '@/services/gameService';
import { useRouter } from 'next/navigation';

const MyQuestionsPage = () => {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const limit = 15; // Kita naikkan limitnya karena kartu pertanyaan lebih kecil

    const observerTarget = useRef(null);

    // 1. Fetch Data (Mendukung Search & Pagination)
    const fetchQuestionsData = async (currentOffset: number, isInitial: boolean, search = '') => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const res = await getAllQuestions(search, limit, currentOffset);
            
            const fetchedData = res.data || [];
            const totalData = res.total || 0;

            if (isInitial) {
                setQuestions(fetchedData);
                setOffset(limit);
                setTotal(totalData);
                setHasMore(fetchedData.length < totalData);
            } else {
                const updatedQuestions = [...questions, ...fetchedData];
                setQuestions(updatedQuestions);
                setOffset(prev => prev + limit);
                setHasMore(updatedQuestions.length < totalData);
            }
        } catch (err) {
            console.error("Failed to fetch questions:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 2. Live Search Debounce (500ms)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchQuestionsData(0, true, searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // 3. Infinite Scroll Observer Logic
    const loadMoreQuestions = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchQuestionsData(offset, false, searchQuery);
        }
    }, [loadingMore, hasMore, offset, searchQuery, questions]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMoreQuestions();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMoreQuestions]);

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                {/* <Header /> */}

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                            <Database className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                                My Question Bank
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                                {total} Questions Total
                            </p>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pertanyaan..."
                            className="bg-gray-800/40 border border-gray-700/50 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all w-full font-bold text-sm text-white"
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array(15).fill(0).map((_, i) => (
                            <div key={i} className="h-44 bg-[#16213e]/50 border border-gray-700/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Render Question Cards */}
                            {questions.map((q: any) => (
                                <GameCard key={q.id} data={q} isQuestion />
                            ))}

                            {/* Loading More Skeletons */}
                            {loadingMore && (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-44 bg-[#16213e]/50 border border-gray-700/50 rounded-2xl animate-pulse" />
                                ))
                            )}
                        </div>

                        {/* Infinite Scroll Sensor */}
                        <div ref={observerTarget} className="h-32 flex flex-col items-center justify-center mt-10">
                            {hasMore && !loadingMore && questions.length > 0 && (
                                <div className="flex items-center gap-3 text-yellow-500/30">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="font-black italic uppercase tracking-widest text-[10px]">Loading more questions</span>
                                </div>
                            )}
                            {!hasMore && questions.length > 0 && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-[1px] w-12 bg-gray-800" />
                                    <p className="text-gray-600 font-black italic uppercase tracking-tighter text-[10px]">End of Question Bank</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!loading && questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem] bg-gray-800/5">
                        <Database size={48} className="text-gray-700 mb-4" />
                        <h3 className="text-sm font-black uppercase italic text-gray-400">
                            {searchQuery ? `Tidak ada pertanyaan untuk "${searchQuery}"` : "Belum ada pertanyaan"}
                        </h3>
                        {!searchQuery && (
                            <button 
                                onClick={() => router.push('/explore/add-question')}
                                className="mt-6 bg-yellow-600 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all"
                            >
                                Add New Question
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyQuestionsPage;