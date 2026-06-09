'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/authService";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }
        
        setLoading(true);

        try {
            // Menghubungkan ke service gaya fetch kamu
            await register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            alert("Registrasi Berhasil! Silakan Login.");
            router.push("/login");
        } catch (err: any) {
            // Menangkap pesan error dari throw new Error di service
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-900/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-900/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-gradient-to-b from-red-800 to-red-950 p-8 rounded-2xl shadow-2xl border-4 border-yellow-600/50"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-white tracking-tighter italic">
                        <span className="text-yellow-400">DAFTAR</span>
                        <span className="text-white"> PESERTA</span>
                    </h1>
                    <p className="text-red-200 text-xs mt-2 font-medium tracking-widest uppercase">Buat Akun Family 100 Kamu</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-yellow-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Nama Lengkap</label>
                        <input 
                            name="fullName"
                            type="text" 
                            onChange={handleChange}
                            className="w-full bg-red-900/40 border-2 border-red-700 rounded-lg py-2.5 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-all"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-yellow-500 text-[10px] font-bold mb-1 uppercase tracking-wider">E-mail</label>
                        <input 
                            name="email"
                            type="email" 
                            onChange={handleChange}
                            className="w-full bg-red-900/40 border-2 border-red-700 rounded-lg py-2.5 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-all"
                            placeholder="pilih email..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-yellow-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Password</label>
                            <input 
                                name="password"
                                type="password" 
                                onChange={handleChange}
                                className="w-full bg-red-900/40 border-2 border-red-700 rounded-lg py-2.5 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-yellow-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Konfirmasi</label>
                            <input 
                                name="confirmPassword"
                                type="password" 
                                onChange={handleChange}
                                className="w-full bg-red-900/40 border-2 border-red-700 rounded-lg py-2.5 px-4 text-white placeholder-red-400 focus:outline-none focus:border-yellow-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-red-950 font-black py-3.5 rounded-xl shadow-[0_4px_0_rgb(180,83,9)] hover:brightness-110 transition-all uppercase tracking-widest flex justify-center items-center"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-red-950/30 border-t-red-950 rounded-full animate-spin"></div>
                        ) : (
                            "Daftar Akun"
                        )}
                    </motion.button>
                </form>

                {/* Social Register */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-red-700"></div>
                    <span className="mx-4 text-red-300 text-[10px] font-bold uppercase tracking-widest text-center">Atau Daftar Via</span>
                    <div className="flex-grow border-t border-red-700"></div>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-xs font-semibold hover:bg-white/10 transition-all">
                        Google
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-xs font-semibold hover:bg-white/10 transition-all">
                        Facebook
                    </button>
                </div>

                {/* Back to Login */}
                <div className="mt-8 text-center border-t border-red-700/50 pt-6">
                    <p className="text-red-200 text-sm">
                        Sudah punya akun?{' '}
                        <button 
                            onClick={() => router.push('/login')}
                            className="text-yellow-400 font-bold hover:text-yellow-300 underline underline-offset-4 transition-colors"
                        >
                            Masuk Sini
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}