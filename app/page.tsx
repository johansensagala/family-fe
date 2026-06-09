'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Globe, Search, HelpCircle, User, LogOut, Play, UserCircle } from 'lucide-react';
import { logout } from '@/services/authService';

const FamilyFeudHome = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const router = useRouter();

    // Fungsi helper untuk membaca cookie biasa (bukan HttpOnly)
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    useEffect(() => {
        // Cek status login berdasarkan cookie 'user_role'
        const role = getCookie('user_role');
        setIsLoggedIn(!!role);
        
        // Ambil nama dari localStorage (jika disimpan saat login)
        const savedName = localStorage.getItem('user_name');
        if (savedName) setUserName(savedName);
    }, []);

    const handleLogout = async () => {
        try {
            await logout(); // Memanggil API logout BE untuk clear cookies
            
            // Bersihkan state lokal
            localStorage.removeItem('user_name');
            setIsLoggedIn(false);
            
            // Redirect ke home untuk mereset tampilan
            router.push("/");
            router.refresh(); 
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="relative min-h-screen bg-indigo-950 text-white flex flex-col font-sans overflow-x-hidden">
            
            {/* Background Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-30 bg-[url('/bg-stage.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-indigo-950/80 to-black" />
            </div>

            {/* Main Content Container - Flex Gro w agar footer nempel bawah */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                
                {/* Logo Section - Ukuran teks responsif */}
                <div className="mb-10 md:mb-16 transform hover:scale-105 transition-transform duration-300 w-full max-w-sm md:max-w-xl text-center">
                    <div className="relative bg-blue-600 border-4 md:border-8 border-white rounded-full px-6 py-4 md:px-12 md:py-6 shadow-[0_0_30px_rgba(59,130,246,0.6)] border-double outline outline-2 md:outline-4 outline-orange-500 inline-block">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-yellow-400 drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] leading-none">
                            FAMILY <br /> <span className="text-white">FEUD</span>
                        </h1>
                    </div>
                    <p className="mt-5 text-base sm:text-lg md:text-2xl font-bold tracking-wide drop-shadow-lg px-2">
                        {isLoggedIn ? `Welcome Back, ${userName || "Player"}!` : "Play. Compete. Have Fun!"}
                    </p>
                </div>

                {/* Action Buttons Grid - Tidak maksa besar, menyebar */}
                <div className="w-full max-w-4xl px-2 sm:px-4 mb-10">
                    {isLoggedIn ? (
                        /* TAMPILAN JIKA SUDAH LOGIN */
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button 
                                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 px-6 py-3 rounded-lg font-bold text-lg md:text-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider italic"
                            >
                                <Play size={22} /> Start New Game
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 px-6 py-3 rounded-lg font-bold text-lg md:text-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    ) : (
                        /* TAMPILAN JIKA BELUM LOGIN */
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/login" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto min-w-[180px] bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 px-8 py-3 rounded-lg font-bold text-lg md:text-xl shadow-md transition-all uppercase">
                                    Login
                                </button>
                            </Link>
                            <Link href="/register" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto min-w-[180px] bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 px-8 py-3 rounded-lg font-bold text-lg md:text-xl shadow-md transition-all uppercase">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Promo & Secondary Buttons - Rapi & Responsif */}
                <div className="w-full max-w-4xl px-2 sm:px-4 flex flex-col gap-6 items-center">
                    
                    {/* Promo Banner */}
                    <div className="w-full max-w-xl bg-green-700/80 border-2 border-green-500 p-3 sm:p-4 rounded-md flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg text-center sm:text-left">
                        <span className="text-sm md:text-base font-semibold">Download FREE PowerPoint Template!</span>
                        <button className="bg-yellow-400 text-black text-xs md:text-sm font-bold py-1.5 px-4 rounded hover:bg-yellow-300 transition-colors whitespace-nowrap">
                            Get PPT
                        </button>
                    </div>

                    {/* Secondary Buttons */}
                    <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {isLoggedIn ? (
                            <button className="w-full sm:w-auto min-w-[160px] bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 px-5 py-2.5 rounded-lg font-bold text-base md:text-lg shadow-md italic transition-all flex items-center justify-center gap-2">
                                <UserCircle size={20} /> My Profile
                            </button>
                        ) : (
                            <button className="w-full sm:w-auto min-w-[160px] bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 px-5 py-2.5 rounded-lg font-bold text-base md:text-lg shadow-md italic transition-all">
                                Start Free Trial
                            </button>
                        )}
        
                        <Link href="/explore" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto min-w-[160px] bg-gradient-to-b from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 px-5 py-2.5 rounded-lg font-bold text-base md:text-lg shadow-md italic transition-all">
                                Explore Games
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Sidebar Icons (Desktop) / Bottom Icons (Mobile) */}
                <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20 flex-col gap-6 pr-4 hidden lg:flex">
                    <ActionButton icon={HelpCircle} label="Help" />
                    <ActionButton icon={User} label="About" />
                </div>
                
                {/* Mobile version of side icons */}
                <div className="relative z-10 flex lg:hidden justify-center gap-8 mt-12 mb-6">
                    <ActionButton icon={HelpCircle} label="Help" mobile />
                    <ActionButton icon={User} label="About" mobile />
                </div>

            </div>

            {/* Bottom Navigation Bar - Menyebar & Rapi */}
            <div className="relative z-10 w-full bg-blue-950/95 border-t-2 md:border-t-4 border-blue-800 py-3 sm:py-4 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-x-6 gap-y-3">
                    <FooterLink icon={Globe} label="Language" />
                    <FooterLink icon={Settings} label="Settings" />
                    <FooterLink icon={Search} label="How to Play" />
                </div>
            </div>

        </div>
    );
};

// Komponen kecil untuk Sidebar/Mobile Icons agar kode lebih bersih
interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    mobile?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, mobile }) => (
    <div className={`flex flex-col items-center group cursor-pointer ${mobile ? 'scale-90' : ''}`}>
        <div className="p-3 bg-gray-800/90 rounded-full border-2 border-gray-400 group-hover:bg-gray-700 group-hover:border-yellow-400 transition-all shadow-md">
            <Icon size={mobile ? 24 : 32} />
        </div>
        <span className="text-xs mt-1 font-bold group-hover:text-yellow-400">{label}</span>
    </div>
);

// Komponen kecil untuk Footer Links
interface FooterLinkProps {
    icon: React.ElementType;
    label: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ icon: Icon, label }) => (
    <button className="flex items-center gap-2 hover:text-yellow-400 transition-colors group px-2 py-1">
        <Icon size={18} className="text-gray-400 group-hover:text-yellow-400" /> 
        <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{label}</span>
    </button>
);

export default FamilyFeudHome;