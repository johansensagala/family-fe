'use client';

import React, { useState } from 'react';
import Sidebar from '../explore/components/Sidebar';
import Header from '../explore/components/Header';
import { 
    HelpCircle, ChevronDown, ChevronUp, MessageSquare, Play, Video, Monitor, Smartphone, PlusCircle 
} from 'lucide-react';

const HelpPage = () => {
    // State untuk melacak FAQ mana yang sedang terbuka
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0); // Default buka FAQ pertama

    const faqs = [
        {
            id: 0,
            icon: Play,
            color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
            question: "Bagaimana cara memulai permainan Family 100 di panggung?",
            answer: "Untuk memulai permainan, Anda membutuhkan dua perangkat atau dua tab browser. Satu perangkat diarahkan untuk membuka 'Mode Display' (diperlihatkan ke audiens/proyektor), dan satu perangkat genggam (smartphone/tablet) membuka 'Mode Remote' untuk Pembawa Acara (Host). Host akan mengendalikan seluruh jalannya kuis dari genggaman tangan."
        },
        {
            id: 1,
            icon: PlusCircle,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            question: "Bagaimana aturan standarisasi poin saat membuat pertanyaan baru?",
            answer: "Sistem kami menerapkan aturan mutlak kuis Family 100: Akumulasi nilai dari seluruh jawaban di dalam satu pertanyaan WAJIB berjumlah tepat 100 poin (merepresentasikan 100 responden survei). Anda bisa membagi poin tersebut, misalnya Jawaban Top bernilai 45 poin, Jawaban Kedua 25 poin, dan seterusnya hingga total jumlahan pas 100."
        },
        {
            id: 2,
            icon: Monitor,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
            question: "Mengapa layar Display Papan Skor tidak memunculkan teks pertanyaan?",
            answer: "Hal ini disengaja untuk menjaga estetika panggung kuis televisi asli. Layar Display hanya berfokus menampilkan nomor slot jawaban yang masih tertutup, total skor regu, dan efek strike (X). Teks pertanyaan utuh sepenuhnya merupakan hak eksklusif pembawa acara yang tertera di layar panel Remote."
        },
        {
            id: 3,
            icon: Smartphone,
            color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
            question: "Bagaimana cara memberikan sanksi kesalahan (X) pada regu yang salah menebak?",
            answer: "Di dalam panel Remote Host, terdapat tombol berlambang silang kesalahan (Strike Button). Setiap kali regu gagal menebak atau menjawab di luar survei, Host cukup menekan tombol tersebut. Layar proyektor utama (Display) otomatis akan memunculkan grafik tanda silang besar beserta efek suara kesalahan secara real-time."
        },
        {
            id: 4,
            icon: Video,
            color: "text-green-400 bg-green-500/10 border-green-500/20",
            question: "Apakah game yang saya buat bisa dimainkan oleh pengguna lain?",
            answer: "Bisa, asalkan saat membuat atau mengedit game, Anda menyalakan opsi konfigurasi 'Public Game'. Setelah diaktifkan, game Anda akan masuk ke dalam algoritma kurasi server global kami dan dapat ditemukan oleh host lain di seluruh dunia melalui kolom 'Popular Games'."
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-yellow-500/30">
            {/* Navigasi Utama */}
            <Sidebar />

            {/* Layout Utama yang seimbang (pl-28 untuk space sidebar, pr-16 agar tidak mepet kanan) */}
            <main className="flex-1 pl-28 pr-16 py-12 relative z-10 overflow-hidden">
                <Header />

                {/* Decorative Ambient Blurs */}
                <div className="absolute top-10 right-[-5rem] w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

                {/* ==========================================
                    1. HERO BANNER
                   ========================================== */}
                <section className="relative rounded-[2.5rem] border border-white/5 bg-gray-900/20 backdrop-blur-md p-12 mb-14 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="max-w-4xl relative z-10">
                        <span className="px-4 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 mb-4 inline-block">
                            Support Center
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-black italic tracking-tighter uppercase leading-none mb-6">
                            Pusat <span className="text-yellow-400">Bantuan</span>
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                            Butuh panduan mengenai cara mengoperasikan kuis, sinkronisasi layar proyektor panggung, atau aturan validasi data survei? Temukan seluruh jawaban teknis mendalam di bawah ini untuk menyelenggarakan kuis Family 100 yang lancar dan profesional.
                        </p>
                    </div>
                </section>

                {/* ==========================================
                    2. FAQ ACCORDION SECTION
                   ========================================== */}
                <section className="mb-14 max-w-5xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <HelpCircle className="text-yellow-400" size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight uppercase italic">
                            Pertanyaan <span className="text-gray-500">Sering Diajukan</span>
                        </h2>
                    </div>

                    {/* Akordeon List */}
                    <div className="space-y-4">
                        {faqs.map((faq) => {
                            const isExpanded = expandedFaq === faq.id;
                            const IconComponent = faq.icon;

                            return (
                                <div 
                                    key={faq.id} 
                                    className={`bg-gray-900/30 border rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-300
                                        ${isExpanded ? 'border-yellow-500/30 bg-gray-900/50 shadow-lg shadow-yellow-500/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    {/* Tombol Pemicu Klik */}
                                    <button
                                        onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Kotak Ikon Dinamis */}
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 ${faq.color} ${isExpanded ? 'scale-105' : ''}`}>
                                                <IconComponent size={18} />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-extrabold text-gray-200 tracking-tight leading-tight">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        
                                        {/* Indikator Panah Navigasi */}
                                        <div className="ml-4 text-gray-500 shrink-0">
                                            {isExpanded ? <ChevronUp size={20} className="text-yellow-400" /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>

                                    {/* Panel Konten Jawaban (Render Kondisional dengan Animasi Halus) */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 pl-21 text-sm text-gray-400 leading-relaxed border-t border-white/[0.02] pt-4 ml-[3.75rem] animate-in fade-in slide-in-from-top-2 duration-200">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ==========================================
                    3. EMERGENCY CONTACT / EXTRA SUPPORT
                   ========================================== */}
                <section className="border border-white/5 rounded-[2.5rem] p-12 bg-gradient-to-r from-gray-900/60 to-yellow-950/10 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-400 shrink-0">
                            <MessageSquare size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">Masih Mengalami Kendala Teknis?</h3>
                            <p className="text-xs text-gray-500 max-w-md font-medium">Jika Anda menemukan bug pada engine WebSocket real-time atau kendala otentikasi akun, tim teknis kami siap membantu Anda.</p>
                        </div>
                    </div>

                    <a href="mailto:support@family100-digital.com" className="shrink-0 w-full md:w-auto">
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40 font-black text-xs tracking-widest uppercase py-4 px-8 rounded-full transition-all shadow-lg active:scale-95">
                            Hubungi Support
                        </button>
                    </a>
                </section>
            </main>
        </div>
    );
};

export default HelpPage;