'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// 💡 Import ikon User dari lucide-react untuk menu Profile
import { HelpCircle, Info, LogOut, LayoutGrid, User } from 'lucide-react';
import { logout } from '@/services/authService';

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname(); // Tracker untuk mendeteksi halaman aktif saat ini

    const handleLogout = async () => {
        try {
            const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
            if (!confirmLogout) return;

            await logout();
            
            // Setelah cookie dihapus backend, arahkan ke login
            router.push('/login');
            router.refresh(); 
        } catch (err: any) {
            console.error("Logout failed:", err.message);
            alert("Gagal logout, silakan coba lagi.");
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-20 bg-[#0b1120] border-r border-gray-800 flex flex-col items-center py-6 z-20">
            {/* Logo Dashboard Utama */}
            <Link href="/explore" className="relative h-10 w-10 mb-12 cursor-pointer active:scale-95 transition-transform">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </Link>

            {/* Navigasi Tengah: Menu Utama Aplikasi */}
            <div className="flex flex-col gap-6">
                <Link href="/explore">
                    <SidebarIcon 
                        icon={LayoutGrid} 
                        label="Explore" 
                        isActive={pathname === '/explore'} 
                    />
                </Link>
                
                {/* 💡 MENU BARU: Navigasi ke halaman Profil */}
                <Link href="/profile">
                    <SidebarIcon 
                        icon={User} 
                        label="Profile" 
                        isActive={pathname === '/profile'} 
                    />
                </Link>
            </div>

            {/* Navigasi Bawah (Fixed) */}
            <div className="mt-auto flex flex-col gap-6">
                <Link href="/help">
                    <SidebarIcon 
                        icon={HelpCircle} 
                        label="Help" 
                        isActive={pathname === '/help'} 
                    />
                </Link>
                
                <Link href="/about">
                    <SidebarIcon 
                        icon={Info} 
                        label="About" 
                        isActive={pathname === '/about'} // Otomatis menyala jika user di halaman /about
                    />
                </Link>
                
                {/* Tombol Logout dengan handler */}
                <div onClick={handleLogout}>
                    <SidebarIcon 
                        icon={LogOut} 
                        label="Logout" 
                        isLogout={true} 
                    />
                </div>
            </div>
        </aside>
    );
};

interface SidebarIconProps {
    icon: React.ElementType;
    label: string;
    isLogout?: boolean;
    isActive?: boolean; // Prop untuk menandai status halaman aktif
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon: Icon, label, isLogout, isActive }) => (
    <div className="flex flex-col items-center group cursor-pointer select-none">
        <div className={`p-3 rounded-full border transition-all duration-200
            ${isLogout 
                ? 'bg-gray-800/50 border-gray-700 group-hover:bg-red-500/10 group-hover:border-red-500' 
                : isActive
                    ? 'bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/5' // Style saat menu aktif
                    : 'bg-gray-800/50 border-gray-700 group-hover:bg-gray-700 group-hover:border-yellow-400'
            }`}
        >
            <Icon 
                size={22} 
                className={`transition-colors duration-200
                    ${isLogout 
                        ? 'text-gray-400 group-hover:text-red-500' 
                        : isActive
                            ? 'text-orange-400' // Warna ikon aktif
                            : 'text-gray-400 group-hover:text-yellow-400'
                    }`} 
            />
        </div>
        <span className={`text-[9px] mt-1 font-black uppercase tracking-widest transition-colors duration-200
            ${isLogout 
                ? 'text-gray-500 group-hover:text-red-500' 
                : isActive
                    ? 'text-orange-400' // Warna teks aktif
                    : 'text-gray-500 group-hover:text-yellow-400'
            }`}
        >
            {label}
        </span>
    </div>
);

export default Sidebar;