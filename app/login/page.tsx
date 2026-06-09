'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() { 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // State untuk pesan error
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset error setiap kali mencoba login

        try {
            const result = await login({ email, password });
            
            if (result && result.message === 'Logged in successfully') {
                if (result.user?.name) {
                    localStorage.setItem('user_name', result.user.name);
                }
                router.push("/"); 
            }
        } catch (err: any) {
            // Tampilkan pesan error di UI, bukan alert lagi
            setError(err.message || "Email atau password salah!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-900/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-900/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-gradient-to-b from-red-800 to-red-950 p-8 rounded-2xl shadow-2xl border-4 border-yellow-600/50"
            >
                {/* Header Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter italic">
                        <span className="text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">FAMILY</span>
                        <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"> FEUD</span>
                    </h1>
                    <p className="text-red-200 text-sm mt-2 font-medium tracking-widest uppercase text-center">Presenter Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-yellow-500 text-xs font-bold mb-2 uppercase tracking-wider">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-red-900/50 border-2 border-red-700 rounded-lg py-3 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-colors"
                            placeholder="Masukkan email..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-yellow-500 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-red-900/50 border-2 border-red-700 rounded-lg py-3 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Menampilkan pesan error di atas tombol */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-500/20 border border-red-500 text-red-200 text-xs py-2 px-4 rounded-lg font-bold text-center italic tracking-wide"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-red-950 font-black py-4 rounded-xl shadow-[0_4px_0_rgb(180,83,9)] hover:brightness-110 transition-all uppercase tracking-widest flex justify-center items-center"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-red-950/30 border-t-red-950 rounded-full animate-spin"></div>
                        ) : (
                            "Masuk ke Game"
                        )}
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-red-700"></div>
                    <span className="mx-4 text-red-300 text-xs font-bold uppercase tracking-widest text-center">Atau</span>
                    <div className="flex-grow border-t border-red-700"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                        {/* SVG Google ... */}
                        Google
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                        {/* SVG Facebook ... */}
                        Facebook
                    </motion.button>
                </div>

                {/* Register Link */}
                <div className="mt-8 text-center border-t border-red-700/50 pt-6">
                    <p className="text-red-200 text-sm">
                        Belum punya akun?{' '}
                        <button 
                            onClick={() => router.push('/register')}
                            className="text-yellow-400 font-bold hover:text-yellow-300 underline underline-offset-4 transition-colors"
                        >
                            Daftar Sekarang
                        </button>
                    </p>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center">
                    <p className="text-red-300/50 text-[10px] uppercase tracking-tighter font-bold">
                        Authorized Personnel Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
}