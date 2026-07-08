'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Check, 
    X, 
    Crown, 
    Zap, 
    Gamepad2, 
    Layers, 
    Upload, 
    Volume2, 
    ArrowLeft,
    Loader2
} from 'lucide-react';
import Sidebar from '../explore/components/Sidebar';
import Header from '../explore/components/Header';
import { fetchWithAuth } from '@/services/authService';

// Data Struktur Tier Berdasarkan Skema yang Sudah Kita Sesuaikan
const TIER_CARDS = [
    {
        id: 'free',
        name: 'Tier 0: Free',
        subName: 'Basic Player',
        price: 'Rp 0',
        period: 'selamanya',
        color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
        btnStyle: 'bg-gray-800 hover:bg-gray-700 text-white',
        features: [
            { text: 'Bisa ikut main semua game publik', value: true },
            { text: 'Membuat game sendiri', value: false },
            { text: 'Custom upload foto/avatar', value: false },
            { text: 'Akses Bonus Round & Surprise Answer', value: false },
        ]
    },
    {
        id: 'bronze',
        name: 'Tier 1: Bronze',
        subName: 'Casual Gathering',
        price: 'Rp 15.000',
        period: 'bulan',
        color: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
        btnStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
        features: [
            { text: 'Bisa buat maksimal 2 Game', value: true },
            { text: 'Maksimal 2 Ronde per game', value: true },
            { text: 'Maksimal 4 Jawaban per ronde', value: true },
            { text: 'Download template PPT Family 100', value: true },
            { text: 'Custom upload foto/avatar', value: false },
        ]
    },
    {
        id: 'silver',
        name: 'Tier 2: Silver',
        subName: 'Community Creator',
        price: 'Rp 35.000',
        period: 'bulan',
        color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5',
        btnStyle: 'bg-yellow-600 hover:bg-yellow-500 text-gray-950 font-black shadow-lg shadow-yellow-500/20',
        features: [
            { text: 'Bisa buat maksimal 5 Game', value: true },
            { text: 'Maksimal 4 Ronde per game', value: true },
            { text: 'Maksimal 6 Jawaban per ronde', value: true },
            { text: 'Terbuka akses Bonus Round', value: true },
            { text: 'Pilihan Preset Avatar lebih banyak', value: true },
            { text: 'Custom upload foto/avatar', value: false },
        ]
    },
    {
        id: 'gold',
        name: 'Tier 3: Gold',
        subName: 'Pro Creator',
        price: 'Rp 75.000',
        period: 'bulan',
        color: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
        btnStyle: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20',
        features: [
            { text: 'Bisa buat maksimal 20 Game', value: true },
            { text: 'Maksimal 6 Ronde per game', value: true },
            { text: 'Maksimal 8 Jawaban per ronde (Full)', value: true },
            { text: 'Fitur Jawaban Kejutan (Surprise)', value: true },
            { text: 'Lebih banyak Tema Visual Papan', value: true },
            { text: 'Custom upload foto/avatar', value: false },
        ]
    },
    {
        id: 'platinum',
        name: 'Tier 4: Platinum',
        subName: 'Pro Streamer',
        price: 'Rp 150.000',
        period: 'bulan',
        color: 'border-pink-500/20 text-pink-400 bg-pink-500/5',
        btnStyle: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/20',
        features: [
            { text: 'Bisa buat maksimal 100 Game', value: true },
            { text: 'Bebas jumlah ronde (Tanpa Batas)', value: true },
            { text: 'Bebas jumlah jawaban (Tanpa Batas)', value: true },
            { text: 'Publish game buatanmu ke Publik', value: true },
            { text: 'Semua Preset Avatar & Tema terbuka', value: true },
            { text: 'Efek Suara (SFX) jauh lebih lengkap', value: true },
        ]
    },
    {
        id: 'titan',
        name: 'Tier 5: Titan',
        subName: 'Enterprise Whitelabel',
        price: 'Rp 350.000',
        period: 'bulan',
        color: 'border-amber-500/30 text-amber-400 bg-gradient-to-b from-amber-500/10 to-transparent',
        btnStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 font-black shadow-xl shadow-amber-500/20',
        isPopular: true,
        features: [
            { text: 'Bebas buat game sepuasnya', value: true },
            { text: 'Upload foto/avatar sendiri dari HP', value: true },
            { text: 'Upload SFX & Musik latar kustom', value: true },
            { text: 'Upload tema buatan sendiri', value: true },
            { text: 'Ganti logo aplikasi (Full Branding)', value: true },
        ]
    }
];

export default function PricingPage() {
    const router = useRouter();
    const [currentTier, setCurrentTier] = useState<string>('free');
    const [loading, setLoading] = useState<boolean>(true);

    // Ambil data user terkini untuk mengetahui posisi tier dia saat ini
    useEffect(() => {
        const fetchUserTier = async () => {
            try {
                setLoading(true);
                const res = await fetchWithAuth('/users/me');
                if (res && res.role) {
                    setCurrentTier(res.role.toLowerCase()); // misal 'free', 'bronze', dll.
                }
            } catch (err) {
                console.error("Gagal memuat tier user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserTier();
    }, []);

    const handleUpgrade = (tierId: string) => {
        if (tierId === currentTier) return;
        // Integrasikan rute ke sistem pembayaran sandbox/midtrans kamu di sini
        router.push(`/pricing/checkout?tier=${tierId}`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10 overflow-x-hidden">
                <Header />

                <div className="max-w-7xl mx-auto space-y-10 mt-4">
                    
                    {/* Tombol Back Atas */}
                    <button 
                        onClick={() => router.push('/profile')}
                        className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-orange-400 transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                        Kembali ke Profil
                    </button>

                    {/* Header Utama Section */}
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                            <Crown size={12} className="fill-orange-400" /> Premium Subscription
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
                            Pilih Tier Permainanmu
                        </h1>
                        <p className="text-sm text-gray-400">
                            Buka kuota game lebih masif, akses kustomisasi penuh, dan kendalikan papan kuis sesukamu.
                        </p>
                    </div>

                    {/* Grid Pembagian 6 Tier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        {TIER_CARDS.map((tier) => {
                            const isUserCurrentTier = currentTier === tier.id;

                            return (
                                <div 
                                    key={tier.id}
                                    className={`relative rounded-[2.5rem] p-6 border flex flex-col justify-between transition-all duration-300 backdrop-blur-sm shadow-2xl ${tier.color} ${
                                        tier.isPopular 
                                            ? 'ring-2 ring-amber-500/40 hover:border-amber-500/60' 
                                            : 'border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {/* Lencana Spesial untuk Tier Paling Rekomendasi (Titan) */}
                                    {tier.isPopular && (
                                        <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Zap size={10} className="fill-gray-950" /> Paling Direkomendasikan
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {/* Bagian Atas: Nama Tier & Subtitle */}
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {tier.subName}
                                            </span>
                                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                                                {tier.name}
                                            </h3>
                                        </div>

                                        {/* Bagian Harga */}
                                        <div className="flex items-baseline gap-1 border-b border-white/5 pb-4">
                                            <span className="text-3xl font-black tracking-tight text-white">{tier.price}</span>
                                            <span className="text-xs text-gray-500 font-semibold">/{tier.period}</span>
                                        </div>

                                        {/* List Detail Fitur */}
                                        <ul className="space-y-3 text-sm">
                                            {tier.features.map((feat, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-gray-300">
                                                    {feat.value ? (
                                                        <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0 border border-emerald-500/20">
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                    ) : (
                                                        <div className="p-0.5 rounded-full bg-red-500/10 text-red-400 mt-0.5 shrink-0 border border-red-500/20">
                                                            <X size={12} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                    <span className={`text-xs font-medium ${feat.value ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                                                        {feat.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Bagian Bawah: Tombol Aksi */}
                                    <div className="pt-6 mt-auto">
                                        <button
                                            onClick={() => handleUpgrade(tier.id)}
                                            disabled={isUserCurrentTier}
                                            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isUserCurrentTier 
                                                    ? 'bg-white/5 text-gray-500 border border-white/5' 
                                                    : tier.btnStyle
                                            }`}
                                        >
                                            {isUserCurrentTier ? 'Tier Aktif Saat Ini' : 'Pilih Paket Ini'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Informasi Footer Tambahan Keamanan */}
                    <p className="text-center text-[10px] text-gray-600 font-medium">
                        Semua transaksi diproses secara aman. Anda dapat membatalkan atau mengubah paket tier langganan kapan saja melalui menu pengaturan tagihan akun.
                    </p>

                </div>
            </main>
        </div>
    );
}