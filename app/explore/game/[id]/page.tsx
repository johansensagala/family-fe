'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Monitor, Smartphone, Star, Loader2, X, Edit3, Trash2, Trophy, MessageCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
    getGameById, 
    addGameReview, 
    getGameReviews, 
    deleteGameReview, 
    deleteGame, 
    recordGameInteraction,
    updateGameReview // 👇 1. Pastikan updateGameReview sudah di-import dari gameService
} from '@/services/gameService';
import { fetchWithAuth } from '@/services/authService';

const GameDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [game, setGame] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRound, setExpandedRound] = useState<number | null>(null);

    // State untuk Modal Review
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // 👇 2. STATE BARU: Untuk melacak mode edit ulasan
    const [editingReviewId, setEditingReviewId] = useState<number | string | null>(null);

    const fetchData = async () => {
        try {
            const [gameRes, reviewRes, userRes] = await Promise.all([
                getGameById(id as string),
                getGameReviews(id as string),
                fetchWithAuth('/users/me').catch(() => null) 
            ]);

            setGame(gameRes);
            setReviews(reviewRes || []);
            setCurrentUser(userRes);

            if (gameRes.rounds?.length > 0) setExpandedRound(gameRes.rounds[0].id);

            if (gameRes) {
                try {
                    await recordGameInteraction(id as string, 'view');
                    console.log(`[STATS] View count berhasil direkam untuk Game ID: ${id}`);
                } catch (statErr) {
                    console.error("Gagal mencatat statistik view:", statErr);
                }
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleDelete = async () => {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus game ini secara permanen?");
        if (!confirmDelete) return;

        try {
            await deleteGame(id as string);
            alert("Game berhasil dihapus");
            router.push('/explore');
        } catch (err: any) {
            alert("Gagal menghapus game: " + err.message);
        }
    };

    // 👇 3. FUNGSI BARU: Mengisi form modal dengan data ulasan yang mau diedit
    const handleOpenEditModal = (review: any) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setComment(review.comment);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) return alert("Komentar tidak boleh kosong");
        
        setSubmitting(true);
        try {
            if (editingReviewId) {
                // 👇 4. JALUR EDIT: Jika ada ID review yang sedang diedit, panggil PATCH
                await updateGameReview(editingReviewId, { rating, comment });
                alert("Ulasan berhasil diperbarui");
            } else {
                // JALUR TAMBAH BARU
                await addGameReview({
                    gameId: Number(id),
                    rating,
                    comment
                });
                alert("Ulasan berhasil dikirim");
            }
            
            // Reset form dan tutup modal
            setShowReviewModal(false);
            setEditingReviewId(null);
            setComment("");
            setRating(5);
            fetchData();
        } catch (err) {
            alert("Gagal memproses ulasan. Pastikan Anda sudah login.");
        } finally {
            setSubmitting(false);
        }
    };

    const isOwner = currentUser && game && currentUser.id === game.userId;
    const hasReviewed = currentUser && reviews.some((review) => review.userId === currentUser.id);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!game) return <div className="p-10 text-white font-black italic uppercase bg-[#0f172a] min-h-screen">Game not found.</div>;

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8">
                <Header />

                {/* Hero Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-10 mb-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30 inline-block">
                                    {game.isPublic ? 'Public Game' : 'Private Game'}
                                </span>
                                {isOwner && (
                                    <span className="px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30 inline-block">
                                        Your Game
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{game.name}</h1>
                            <p className="text-gray-400 mt-4 font-medium">
                                Created on {new Date(game.createdAt).toLocaleDateString()} • {game.rounds?.length || 0} Rounds
                            </p>

                            {isOwner && (
                                <div className="flex gap-4 mt-6">
                                    <button 
                                        onClick={() => router.push(`/explore/edit-game/${id}`)}
                                        className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <Edit3 size={16} /> Edit Game
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                                <Monitor size={20} /> Display
                            </button>
                            <button className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold border border-white/10 hover:bg-gray-700 transition-all active:scale-95">
                                <Smartphone size={20} /> Remote
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Rounds UI */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                            <Trophy className="text-yellow-500" /> Game Content
                        </h2>
                        
                        {game.rounds?.map((round: any, index: number) => (
                            <div key={round.id} className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md transition-all hover:border-white/10">
                                <button 
                                    onClick={() => setExpandedRound(expandedRound === round.id ? null : round.id)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{round.type}</p>
                                            <h3 className="text-lg font-bold leading-tight">{round.question?.question}</h3>
                                        </div>
                                    </div>
                                    {expandedRound === round.id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                                </button>

                                {expandedRound === round.id && (
                                    <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        {round.question?.answers?.map((ans: any, aIdx: number) => (
                                            <div key={ans.id} className="flex justify-between items-center bg-gray-800/30 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-gray-700 text-[10px] rounded-full flex items-center justify-center font-bold text-gray-400">
                                                        {aIdx + 1}
                                                    </span>
                                                    <span className="font-bold text-gray-300">{ans.answer}</span>
                                                </div>
                                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg font-black text-xs">
                                                    {ans.poin}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Reviews UI */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                            <Star className="text-orange-500" fill="currentColor" /> Community Reviews
                        </h2>

                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-gray-600 text-xs italic p-4">Belum ada ulasan untuk game ini.</p>
                            ) : (
                                reviews.map((review) => {
                                    const isMyReview = currentUser && review.userId === currentUser.id;

                                    const handleDeleteReview = async (reviewId: number) => {
                                        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus ulasan Anda?");
                                        if (!confirmDelete) return;
                                        
                                        try {
                                            await deleteGameReview(reviewId);
                                            alert("Ulasan berhasil dihapus");
                                            fetchData();
                                        } catch (err: any) {
                                            alert("Gagal menghapus ulasan: " + err.message);
                                        }
                                    };

                                    return (
                                        <div key={review.id} className="bg-gray-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm relative group transition-all hover:border-white/10">
                                            <div className="flex items-center justify-between gap-4 mb-4">
                                                <div className="flex items-start gap-4">
                                                    <img 
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name || review.userId}`} 
                                                        className="w-10 h-10 rounded-2xl bg-gray-800 border border-white/10" 
                                                        alt="avatar"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm">{review.user?.name || 'User'}</h4>
                                                            {isMyReview && (
                                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                                    KAMU
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star 
                                                                        key={i} size={10} 
                                                                        className={i < review.rating ? "text-yellow-500" : "text-gray-700"} 
                                                                        fill={i < review.rating ? "currentColor" : "none"} 
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] text-gray-500">
                                                                • {review.createdAt ? 
                                                                    new Date(review.createdAt).toLocaleString('id-ID', { 
                                                                        day: 'numeric', 
                                                                        month: 'short', 
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: false 
                                                                    }).replace('.', ':') 
                                                                    : ''
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons (Hanya muncul jika ulasan milik sendiri) */}
                                                {isMyReview && (
                                                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                                        {/* 👇 5. TOMBOL EDIT: Memicu pembukaan modal dengan state data ulasan */}
                                                        <button 
                                                            onClick={() => handleOpenEditModal(review)}
                                                            className="p-2 text-gray-500 hover:text-blue-400 bg-gray-800/0 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 rounded-xl transition-all"
                                                            title="Edit Ulasan"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="p-2 text-gray-500 hover:text-red-400 bg-gray-800/0 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                                                            title="Hapus Ulasan"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-xs leading-relaxed">{review.comment}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Jika sudah review, tampilkan tombol Edit cepat di bagian bawah list review */}
                        {!isOwner && currentUser && hasReviewed && (
                            <button 
                                onClick={() => {
                                    const myReview = reviews.find(r => r.userId === currentUser.id);
                                    if (myReview) handleOpenEditModal(myReview);
                                }}
                                className="w-full py-4 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:border-blue-500/40 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Edit3 size={14} /> Edit Your Review
                            </button>
                        )}

                        {!isOwner && currentUser && !hasReviewed && (
                            <button 
                                onClick={() => {
                                    setEditingReviewId(null); // Bersihkan sisa id edit
                                    setShowReviewModal(true);
                                }}
                                className="w-full py-4 border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] hover:border-blue-500/40 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={14} /> Post a Review
                            </button>
                        )}
                    </div> 
                </div> 

                {/* Modal Review (Dinamis untuk Post / Edit) */}
                {showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#1e293b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
                            <button 
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setEditingReviewId(null);
                                    setComment("");
                                    setRating(5);
                                }} 
                                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* 👇 6. DINAMIS: Label judul modal berubah mengikuti state mode */}
                            <h3 className="text-2xl font-black uppercase mb-2">
                                {editingReviewId ? 'Edit Ulasan Anda' : 'Tulis Ulasan'}
                            </h3>
                            <p className="text-gray-400 text-xs mb-8">
                                {editingReviewId ? 'Perbarui bintang rating dan catatan komentar game ini.' : 'Beri rating dan komentar untuk game ini.'}
                            </p>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                                            <Star 
                                                size={40} 
                                                className={s <= rating ? "text-yellow-500" : "text-gray-700"} 
                                                fill={s <= rating ? "currentColor" : "none"} 
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Komentarmu</label>
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none text-white"
                                        placeholder="Tulis ulasan Anda di sini..."
                                    />
                                </div>

                                <button 
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        editingReviewId ? 'Simpan Perubahan' : 'Kirim Ulasan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GameDetailPage;