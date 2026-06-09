'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HelpCircle, Info, LogOut } from 'lucide-react';
import { logout } from '@/services/authService';

const Sidebar = () => {
    const router = useRouter();

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
            {/* Logo */}
            <div className="relative h-10 w-10 mb-12">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>

            {/* Navigasi Bawah (Fixed) */}
            <div className="mt-auto flex flex-col gap-6">
                <SidebarIcon icon={HelpCircle} label="Help" />
                <SidebarIcon icon={Info} label="About" />
                
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
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon: Icon, label, isLogout }) => (
    <div className="flex flex-col items-center group cursor-pointer">
        <div className={`p-3 bg-gray-800/50 rounded-full border border-gray-700 transition-all 
            ${isLogout 
                ? 'group-hover:bg-red-500/10 group-hover:border-red-500' 
                : 'group-hover:bg-gray-700 group-hover:border-yellow-400'
            }`}
        >
            <Icon 
                size={22} 
                className={`transition-colors 
                    ${isLogout 
                        ? 'text-gray-400 group-hover:text-red-500' 
                        : 'text-gray-400 group-hover:text-yellow-400'
                    }`} 
            />
        </div>
        <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider transition-colors
            ${isLogout 
                ? 'text-gray-500 group-hover:text-red-500' 
                : 'text-gray-500 group-hover:text-yellow-400'
            }`}
        >
            {label}
        </span>
    </div>
);

export default Sidebar;