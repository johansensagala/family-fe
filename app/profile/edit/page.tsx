'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Mail, 
    ArrowLeft, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Upload,
    Crown,
    X,
    Camera
} from 'lucide-react';
import Sidebar from '../../explore/components/Sidebar';
import Header from '../../explore/components/Header';
import { fetchWithAuth, updateProfile } from '@/services/authService';

const AVATARS_FREE = Array.from({ length: 50 }, (_, i) => `avatar_free_${i + 1}.png`);
const AVATARS_SILVER = Array.from({ length: 20 }, (_, i) => `avatar_silver_${i + 1}.png`);
const AVATARS_PLATINUM = Array.from({ length: 10 }, (_, i) => `avatar_platinum_${i + 1}.png`);

export default function EditProfilePage() {
    const router = useRouter();
    
    // State Form Akun
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(''); 
    
    // State Avatar & Upload (💡 UPDATE: Set initial default value ke avatar_free_1.png)
    const [currentAvatar, setCurrentAvatar] = useState('avatar_free_1.png');
    const [selectedPreset, setSelectedPreset] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    
    // State Modal Ganti Avatar
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State UI Status
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const currentTierLower = role.toLowerCase();
    const canUploadCustom = currentTierLower === 'titan' || currentTierLower === 'admin';
    const hasSilverAccess = ['silver', 'gold', 'platinum', 'titan', 'admin'].includes(currentTierLower);
    const hasPlatinumAccess = ['platinum', 'titan', 'admin'].includes(currentTierLower);

    // 💡 UPDATE: Helper path resolution dengan fallback terarah ke avatar_free_1.png
    const getAvatarSrc = (filename: string) => {
        if (!filename) return '/assets/avatars/free/avatar_free_1.png';
        if (filename.startsWith('/uploads') || filename.startsWith('http')) return filename; 
        if (filename.includes('_free_')) return `/assets/avatars/free/${filename}`;
        if (filename.includes('_silver_')) return `/assets/avatars/silver/${filename}`;
        if (filename.includes('_platinum_')) return `/assets/avatars/platinum/${filename}`;
        return `/assets/avatars/free/avatar_free_1.png`;
    };

    useEffect(() => {
        const fetchCurrentProfile = async () => {
            try {
                setLoadingData(true);
                const res = await fetchWithAuth('/users/me');
                if (res) {
                    setName(res.name || '');
                    setEmail(res.email || '');
                    const tierName = res.role?.name || res.role || 'free';
                    setRole(tierName);
                    
                    // 💡 UPDATE: Fallback string jika record data avatar di db null/kosong
                    const userAvatar = res.avatar || 'avatar_free_1.png';
                    setCurrentAvatar(userAvatar);
                    
                    if (userAvatar.startsWith('avatar_')) {
                        setSelectedPreset(userAvatar);
                    } else {
                        setPreviewUrl(userAvatar); 
                    }
                }
            } catch (err) {
                console.error("Gagal memuat data profil:", err);
                setStatusMessage({ type: 'error', text: 'Gagal mengambil data profil terkini.' });
            } finally {
                setLoadingData(false);
            }
        };
        fetchCurrentProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadCustom) return;
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setSelectedPreset('');
            setPreviewUrl(URL.createObjectURL(file));
            setIsModalOpen(false);
        }
    };

    const handleSelectPreset = (filename: string) => {
        setSelectedPreset(filename);
        setUploadFile(null);
        setPreviewUrl('');
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setStatusMessage({ type: 'error', text: 'Nama dan Email tidak boleh kosong!' });
            return;
        }

        try {
            setSubmitting(true);
            setStatusMessage(null);
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            
            if (uploadFile) {
                formData.append('avatarFile', uploadFile);
            } else if (selectedPreset) {
                formData.append('avatar', selectedPreset);
            }

            await updateProfile(formData);
            
            setStatusMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            
            setTimeout(() => {
                router.push('/profile');
                router.refresh();
            }, 1500);

        } catch (err: any) {
            console.error("Gagal memperbarui profil:", err);
            setStatusMessage({ type: 'error', text: err.message || 'Gagal menyimpan perubahan.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex min-h-screen bg-[#0f172a] items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 pl-24 pr-8 py-8 relative z-10">
                <Header />

                <div className="max-w-2xl mx-auto mt-4 space-y-6">
                    
                    <button 
                        onClick={() => router.push('/profile')}
                        className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-orange-400 transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                        Kembali ke Profil
                    </button>

                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
                            Edit Profil Anda
                        </h1>
                        <p className="text-sm text-gray-400">Sesuaikan data info akun dan tampilan foto profil utama kamu.</p>
                    </div>

                    {statusMessage && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold backdrop-blur-sm ${
                            statusMessage.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            
                            {/* PREVIEW IMAGE HANDLER (BULAT PENUH) */}
                            <div className="flex flex-col items-center justify-center space-y-3 border-b border-white/5 pb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-950 flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview Upload" className="w-full h-full object-cover" />
                                        ) : selectedPreset ? (
                                            <img src={getAvatarSrc(selectedPreset)} alt="Preview Preset" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={getAvatarSrc(currentAvatar)} alt="Current Avatar" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2.5 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border border-white/10"
                                    >
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-xs font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Ubah Foto Profil
                                </button>
                            </div>

                            {/* FIELD INPUT */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Nama Lengkap</label>
                                    <div className="relative flex items-center">
                                        <User size={18} className="absolute left-4 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500 transition-all"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Alamat Email</label>
                                    <div className="relative flex items-center">
                                        <Mail size={18} className="absolute left-4 text-gray-500" />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500 transition-all"
                                            placeholder="nama@domain.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 opacity-60">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500">Tier Akun Pengguna</label>
                                <input 
                                    type="text" 
                                    value={role.toUpperCase()} 
                                    disabled
                                    className="w-full bg-gray-900/40 border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-orange-400 cursor-not-allowed uppercase tracking-wider"
                                />
                            </div>

                            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.push('/profile')}
                                    className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-gray-400 hover:text-white px-6 py-3 rounded-xl text-sm font-bold transition-all"
                                >
                                    Batal
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <><Loader2 className="animate-spin" size={16} /> Menyimpan...</>
                                    ) : (
                                        <><Save size={16} /> Simpan Profil</>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>

            {/* MODAL GRID AVATAR LINGKARAN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#111827] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative">
                        
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-950/40">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-wide text-white">Pilih Avatar Profil</h3>
                                <p className="text-xs text-gray-500">Sesuaikan tampilan avatar sesuai batas eksklusivitas tier akunmu.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            
                            {/* Section Upload Khusus Titan */}
                            <div className="space-y-2">
                                <div className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <span>Upload Foto Kustom</span>
                                    <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                        <Crown size={10} className="fill-amber-400" /> TITAN ONLY
                                    </span>
                                </div>
                                <div className={`relative border-2 border-dashed rounded-xl p-4 text-center ${
                                    canUploadCustom ? 'border-white/10 hover:border-orange-500/40 bg-gray-950/20' : 'border-white/5 bg-gray-950/40 opacity-40 cursor-not-allowed'
                                }`}>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        disabled={!canUploadCustom}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <Upload size={20} className={`mx-auto mb-1 ${canUploadCustom ? 'text-orange-400' : 'text-gray-600'}`} />
                                    <p className={`text-xs font-bold ${canUploadCustom ? 'text-gray-200' : 'text-gray-500'}`}>
                                        {canUploadCustom ? 'Klik untuk upload gambar kustom' : 'Fitur upload terkunci. Tersedia eksklusif di Tier Titan.'}
                                    </p>
                                </div>
                            </div>

                            {/* Section GRID PRESET AVATAR */}
                            <div className="space-y-4">
                                {/* 1. Grid Folder Free & Bronze */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-emerald-400">Preset Avatar Free & Bronze</label>
                                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 bg-gray-950/40 rounded-xl border border-white/5">
                                        {AVATARS_FREE.map((filename) => (
                                            <button
                                                key={filename} type="button" onClick={() => handleSelectPreset(filename)}
                                                className={`aspect-square rounded-full border bg-gray-900/60 transition-all overflow-hidden ${selectedPreset === filename ? 'border-orange-500 bg-orange-500/5 scale-105 ring-2 ring-orange-500/30' : 'border-white/5 opacity-80 hover:opacity-100'}`}
                                            >
                                                <img src={`/assets/avatars/free/${filename}`} alt="Free Avatar" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Grid Folder Silver */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-yellow-400">Preset Avatar Silver & Gold</label>
                                    {hasSilverAccess ? (
                                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 bg-gray-950/40 rounded-xl border border-white/5">
                                            {AVATARS_SILVER.map((filename) => (
                                                <button
                                                    key={filename} type="button" onClick={() => handleSelectPreset(filename)}
                                                    className={`aspect-square rounded-full border bg-gray-900/60 transition-all overflow-hidden ${selectedPreset === filename ? 'border-orange-500 bg-orange-500/5 scale-105 ring-2 ring-orange-500/30' : 'border-white/5 opacity-80 hover:opacity-100'}`}
                                                >
                                                    <img src={`/assets/avatars/silver/${filename}`} alt="Silver Avatar" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-gray-950/60 text-center text-xs text-gray-600 border border-white/5 font-semibold">🔒 Naik ke Tier Silver untuk membuka 20 avatar eksklusif komunitas ini.</div>
                                    )}
                                </div>

                                {/* 3. Grid Folder Platinum */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-pink-400">Preset Avatar Platinum</label>
                                    {hasPlatinumAccess ? (
                                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 bg-gray-950/40 rounded-xl border border-white/5">
                                            {AVATARS_PLATINUM.map((filename) => (
                                                <button
                                                    key={filename} type="button" onClick={() => handleSelectPreset(filename)}
                                                    className={`aspect-square rounded-full border bg-gray-900/60 transition-all overflow-hidden ${selectedPreset === filename ? 'border-orange-500 bg-orange-500/5 scale-105 ring-2 ring-orange-500/30' : 'border-white/5 opacity-80 hover:opacity-100'}`}
                                                >
                                                    <img src={`/assets/avatars/platinum/${filename}`} alt="Platinum Avatar" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-gray-950/60 text-center text-xs text-gray-600 border border-white/5 font-semibold">🔒 Naik ke Tier Platinum untuk membuka 10 avatar panggung megah streamer ini.</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}