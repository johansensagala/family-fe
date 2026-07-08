'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
    value: string;
    onChange: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ value, onChange }) => {
    return (
        <div className="flex flex-col items-center mb-12 w-full">
            <h1 className="text-5xl font-black italic tracking-tighter text-white mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">
                Explore Games
            </h1>
            <div className="relative w-full max-w-2xl">
                <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search games, questions, or authors..." 
                    className="w-full bg-white text-gray-900 rounded-full py-4 pl-14 pr-6 text-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
        </div>
    );
};

export default Header;