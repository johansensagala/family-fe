'use client';

import React from 'react';
import Sidebar from '../explore/components/Sidebar';
import Header from '../explore/components/Header';
import { 
    Users, Trophy, Terminal, Sparkles, Layers, ShieldCheck, Heart, ArrowRight, HelpCircle, Laptop, Smartphone, HelpCircle as QuestionIcon
} from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-orange-500/30">
            {/* Navigasi Utama */}
            <Sidebar />

            {/* Layout Utama dengan ruang bernapas yang lega (tidak mepet pinggir) */}
            <main className="flex-1 pl-28 pr-16 py-12 relative z-10 overflow-hidden">
                <Header />

                {/* Decorative Blur Backgrounds */}
                <div className="absolute top-20 right-[-10rem] w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute top-[40%] left-[-10rem] w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* ==========================================
                    1. HERO BANNER: VISI UTAMA PLATFORM
                   ========================================== */}
                <section className="relative rounded-[2.5rem] border border-white/5 bg-gray-900/20 backdrop-blur-md p-12 mb-14 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    
                    <div className="max-w-4xl relative z-10">
                        <span className="px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20 mb-4 inline-block">
                            Behind The Stage
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-black italic tracking-tighter uppercase leading-none mb-6">
                            Survei <span className="text-orange-500">Membuktikan!</span>
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                            Selamat datang di platform **Family 100 Digital**, ekosistem interaktif modern yang menghidupkan kembali kuis klasik legendaris televisi. Kami merancang platform ini bukan sekadar permainan biasa, melainkan sebuah perkakas (*toolkit*) lengkap bagi komunitas, korporasi, hingga acara keluarga untuk mengadakan pertunjukan kuis profesional secara mandiri tanpa membutuhkan peralatan studio yang rumit.
                        </p>
                    </div>
                </section>

                {/* ==========================================
                    2. CORE ARCHITECTURE / PILAR PLATFORM
                   ========================================== */}
                <section className="mb-14">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Layers className="text-orange-400" size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight uppercase italic">
                            Pilar Utama <span className="text-gray-500">Sistem</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pilar 1 */}
                        <div className="bg-gray-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:border-orange-500/30 transition-all group duration-300 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users size={22} />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-3 tracking-tight">Kreator & Komunitas</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Siapa pun bisa menjadi bank data survei. Anda dapat menyusun paket pertanyaan kustom, mengatur bobot poin jawaban, dan mempublikasikannya agar dapat diakses secara global atau menyimpannya secara privat untuk lingkaran internal.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 2 */}
                        <div className="bg-gray-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:border-blue-500/30 transition-all group duration-300 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Terminal size={22} />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-3 tracking-tight">Dual-Screen Engine</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Infrastruktur real-time berbasis WebSocket yang memisahkan layar papan skor publik (*Display*) dengan panel kendali rahasia milik pembawa acara (*Remote*) secara sinkron tanpa jeda.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 3 */}
                        <div className="bg-gray-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm hover:border-purple-500/30 transition-all group duration-300 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Sparkles size={22} />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-3 tracking-tight">Hot Ranking Algorithm</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Sistem rekomendasi kurasi pintar yang terinspirasi oleh algoritma distribusi konten global. Menghitung rasio pemutaran (*plays*) dan impresi (*views*) terhadap usia rilis untuk menyajikan konten terbaik.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    3. DETAIL MEKANISME DUAL-SCREEN ECOSYSTEM
                   ========================================== */}
                <section className="mb-14 bg-gray-900/20 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Terminal className="text-blue-400" size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight uppercase italic">
                            Ekosistem <span className="text-gray-500">Dual-Screen</span>
                        </h2>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-10">
                        Aplikasi ini memisahkan peran visual secara drastis demi menjaga kejutan dan kelancaran jalannya kompetisi kuis. Berikut adalah dua modul utama yang bekerja secara simultan:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl flex gap-5 items-start">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                                <Laptop size={24} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-base uppercase text-blue-400 mb-1">1. Mode Display (Papan Skor)</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Didesain untuk diproyeksikan ke layar monitor besar, TV panggung, atau proyektor aula. Mode ini murni menampilkan papan top 10 jawaban tersembunyi, total akumulasi nilai regu, dan efek visual pembalik jawaban saat peserta berhasil menebak dengan benar.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-950/40 border border-white/5 p-6 rounded-2xl flex gap-5 items-start">
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 shrink-0">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-base uppercase text-orange-400 mb-1">2. Mode Remote (Panel Host)</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Didesain untuk dibuka melalui *smartphone* atau tablet genggam milik pembawa acara (*Host*). Menampilkan teks pertanyaan utuh, daftar contekan jawaban beserta poin aslinya, serta tombol trigger untuk membuka jawaban atau memberikan tanda silang kesalahan (X).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    4. GAMEPLAY RULES & INTEGRITY (ATURAN KUIS)
                   ========================================== */}
                <section className="mb-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <ShieldCheck className="text-purple-400" size={24} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">
                                Regulasi & <span className="text-gray-500">Integritas Data</span>
                            </h2>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Untuk mempertahankan cita rasa permainan tebak survei asli dan menjamin keseimbangan mekanis game saat dimainkan secara kompetitif di atas panggung, sistem manajemen konten kuis kami mengunci standarisasi parameter data berikut:
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong className="text-gray-200">Batas Maksimal 20 Ronde:</strong> Mencegah kelelahan durasi panggung. Paket kuis yang ideal umumnya terdiri dari 4 ronde standar (Single, Double, Triple poin) ditambah ronde bonus.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong className="text-gray-200">Rentang 1 - 10 Jawaban:</strong> Papan skor display membatasi visualisasi hingga maksimal 10 baris teratas hasil survei komunitas agar elemen keterbacaan audiens tetap tajam.
                                </p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong className="text-gray-200">Akumulasi Mutlak 100 Poin:</strong> Total jumlahan poin dari seluruh alternatif jawaban di dalam satu pertanyaan wajib menyentuh angka 100 poin (merepresentasikan 100 orang responden survei).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stat Box Kreatif */}
                    <div className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/5 p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden flex justify-around text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500" />
                        <div>
                            <p className="text-5xl font-black text-orange-500 tracking-tighter italic">100</p>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2">Target Poin</p>
                        </div>
                        <div className="w-px bg-gray-800 h-16 self-center" />
                        <div>
                            <p className="text-5xl font-black text-blue-400 tracking-tighter italic">10</p>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2">Slot Jawaban</p>
                        </div>
                        <div className="w-px bg-gray-800 h-16 self-center" />
                        <div>
                            <p className="text-5xl font-black text-purple-400 tracking-tighter italic">20</p>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2">Limit Ronde</p>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    5. CALL TO ACTION (CTA)
                   ========================================== */}
                <section className="border border-white/5 rounded-[2.5rem] p-12 bg-gradient-to-r from-blue-950/40 via-gray-900/40 to-orange-950/20 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-inner">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Siap Menjadi Host Berikutnya?</h3>
                        <p className="text-xs text-gray-500 max-w-xl font-medium">Masuk ke ruang dasbor, buat pertanyaan unik komunitas Anda, atau mainkan paket kuis terpopuler kiriman pengguna lain yang siap pakai di server global.</p>
                    </div>

                    <Link href="/explore">
                        <button className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs tracking-widest uppercase py-4 px-8 rounded-full shadow-lg shadow-orange-500/10 active:scale-95 transition-all shrink-0">
                            Mulai Bermain <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </section>

                {/* Footer Hak Cipta */}
                <footer className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-16 flex items-center justify-center gap-1.5">
                    Made with <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> for Family 100 Enthusiasts • 2026
                </footer>
            </main>
        </div>
    );
};

export default AboutPage;