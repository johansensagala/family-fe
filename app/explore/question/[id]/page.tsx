'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { 
    MessageSquare, Hash, Calendar, 
    Edit3, Trash2, ArrowLeft, Loader2, 
    CheckCircle2, AlertCircle 
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getQuestionById, deleteQuestion } from '@/services/gameService';
import { fetchWithAuth } from '@/services/authService';

const QuestionDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [quesRes, userRes] = await Promise.all([
                getQuestionById(id as string),
                fetchWithAuth('/users/me').catch(() => null)
            ]);
            setQuestion(quesRes);
            setCurrentUser(userRes);
        } catch (err) {
            console.error("Failed to fetch question:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleDelete = async () => {
        // Implementasi SweetAlert2 untuk konfirmasi
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Tindakan ini tidak bisa dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // warna merah tailwind
            cancelButtonColor: '#374151',  // warna gray tailwind
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#1e293b',         // warna slate-800 agar matching
            color: '#fff',
            borderRadius: '2rem'
        });

        if (result.isConfirmed) {
            try {
                await deleteQuestion(id as string);
                
                // Alert Sukses
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Pertanyaan berhasil dihapus.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1e293b',
                    color: '#fff',
                });

                router.push('/explore/questions');
            } catch (err: any) {
                Swal.fire({
                    title: 'Error!',
                    text: err.message || 'Gagal menghapus pertanyaan.',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#fff',
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-yellow-500" size={48} />
            </div>
        );
    }

    if (!question) return <div className="p-10 text-white font-black uppercase">Question Not Found.</div>;

    const isOwner = currentUser && question && currentUser.id === question.userId;

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8">
                <Header />

                {/* Navigation & Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={18} /> Back to List
                    </button>

                    {isOwner && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => router.push(`/explore/edit-question/${id}`)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-blue-400 mb-4">
                                    <MessageSquare size={20} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Primary Question</span>
                                </div>
                                <h1 className="text-4xl font-black italic uppercase leading-tight tracking-tighter">
                                    {question.question}
                                </h1>
                                <div className="flex gap-6 mt-8 border-t border-white/5 pt-6 text-gray-400 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} /> Created {new Date(question.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} /> {question.answers?.length || 0} Total Answers
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />
                        </div>

                        {/* Answers List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic flex items-center gap-3 ml-2">
                                <CheckCircle2 className="text-green-500" /> Correct Answers
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                {question.answers?.sort((a: any, b: any) => b.poin - a.poin).map((ans: any, idx: number) => (
                                    <div 
                                        key={ans.id} 
                                        className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:border-yellow-500/30 transition-all backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center font-black text-gray-500 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors">{ans.answer}</p>
                                                {ans.isSurprise && (
                                                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-widest mt-1 block">✨ Surprise Answer</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-blue-400 group-hover:scale-110 transition-transform">
                                                {ans.poin}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/60 border border-white/5 p-8 rounded-[2rem] backdrop-blur-md">
                            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                                <AlertCircle className="text-blue-500" /> Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Created By</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-xs">
                                            {question.user?.name?.[0] || 'U'}
                                        </div>
                                        <span className="font-bold">{question.user?.name || 'Unknown User'}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Usage in Games</p>
                                    <div className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 font-bold text-xs">
                                        Used in {question.rounds?.length || 0} Game Rounds
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuestionDetailPage;