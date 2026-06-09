'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
// import '../../app/globals.css';
// import "../ShineEffect.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Memanggil service login gaya fetch
      const result = await login({ email, password });
      
      if (result && result.access_token) {
        // Redirect jika login berhasil
        router.push("/"); 
      }
    } catch (err: any) {
      // Menangkap 'throw new Error' dari service (Invalid credentials, dll)
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Background Decor (Optional - Bisa disesuaikan dengan Snowfall kamu) */}
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
            <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"> FAMILY</span>
          </h1>
          <p className="text-red-200 text-sm mt-2 font-medium tracking-widest uppercase">Presenter Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-yellow-500 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
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
        <span className="mx-4 text-red-300 text-xs font-bold uppercase tracking-widest">Atau</span>
        <div className="flex-grow border-t border-red-700"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
        <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Integrasi Google */}}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
        </motion.button>

        <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Integrasi Facebook */}}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all"
        >
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
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