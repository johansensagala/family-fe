'use client'

import { createGameWithRounds, getAllQuestions, getAllCategories } from '@/services/gameService'
import { AsyncPaginate } from 'react-select-async-paginate'
import { ArrowLeft, Plus, Trash2, Save, Gamepad2, ListOrdered, Globe, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

const pointTypes = [
    'SINGLE', 'DOUBLE', 'TRIPLE', 'QUADRUPLE', 'QUINTUPLE',
    'SEXTUPLE', 'SEPTUPLE', 'OCTUPLE', 'NONUPLE', 'DECUPLE',
] as const

export default function AddGamePage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [categoryId, setCategoryId] = useState('') // STATE UNTUK CATEGORY
    const [categories, setCategories] = useState([]) // STATE UNTUK LIST CATEGORIES
    const [isPublic, setIsPublic] = useState(false)
    const [rounds, setRounds] = useState([{ type: 'SINGLE', questionId: '', questionLabel: '' }])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 1. Fetch Categories saat komponen di-mount
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await getAllCategories()
                setCategories(res || [])
            } catch (err) {
                console.error("Gagal memuat kategori:", err)
            }
        }
        fetchCats()
    }, [])

    const loadQuestions = async (search: string, loadedOptions: any[], { page }: any) => {
        const limit = 10;
        const offset = (page - 1) * limit;
        try {
            const response = await getAllQuestions(search, limit, offset);
            return {
                options: response.data.map((q: any) => ({
                    value: q.id,
                    label: `${q.question} (${q.answers?.length || 0} pts)`
                })),
                hasMore: loadedOptions.length < response.total,
                additional: { page: page + 1 },
            };
        } catch (error) {
            return { options: [], hasMore: false };
        }
    };

    const handleRoundChange = (index: number, field: string, value: any) => {
        const updatedRounds = [...rounds] as any
        updatedRounds[index][field] = value
        setRounds(updatedRounds)
    }

    const addRound = () => {
        if (rounds.length < 20) {
            setRounds([...rounds, { type: 'SINGLE', questionId: '', questionLabel: '' }])
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Batas Tercapai',
                text: 'Maksimal hanya 20 ronde yang diperbolehkan.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            })
        }
    }

    const removeRound = (index: number) => setRounds(rounds.filter((_, i) => i !== index))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // VALIDASI INPUT UTAMA
        if (!name || !categoryId) {
            return Swal.fire({ 
                icon: 'warning', 
                title: 'Belum Lengkap', 
                text: 'Nama game dan Kategori wajib diisi.' 
            })
        }

        if (rounds.some(r => !r.questionId)) {
            return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Pilih pertanyaan untuk semua round' })
        }

        try {
            setIsSubmitting(true)
            await createGameWithRounds({ 
                name, 
                rounds, 
                isPublic,
                categoryId: Number(categoryId) // Kirim categoryId ke backend
            })
            
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Game kustom Anda telah disimpan.' })
            router.push('/explore')
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.message })
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#1e293b',
            borderColor: state.isFocused ? '#3b82f6' : '#334155',
            borderRadius: '0.75rem',
            padding: '4px',
            color: 'white',
            boxShadow: 'none',
            '&:hover': { borderColor: '#475569' }
        }),
        menu: (base: any) => ({ ...base, backgroundColor: '#1e293b', borderRadius: '0.75rem', overflow: 'hidden', zIndex: 50 }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
            color: 'white',
            '&:active': { backgroundColor: '#2563eb' }
        }),
        singleValue: (base: any) => ({ ...base, color: 'white' }),
        input: (base: any) => ({ ...base, color: 'white' }),
        placeholder: (base: any) => ({ ...base, color: '#94a3b8' })
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <button 
                    onClick={() => router.back()}
                    className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all"
                >
                    <div className="p-2 rounded-full group-hover:bg-gray-800 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium tracking-wide font-bold uppercase text-xs">Back to Explore</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <Gamepad2 className="text-blue-500" size={40} />
                            Create New Game
                        </h1>
                        <p className="text-gray-400 mt-2">Atur identitas game dan susun ronde permainan.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-widest px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'SAVING...' : 'SAVE GAME'}
                    </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Game Identity Input */}
                        <div className="md:col-span-2 bg-[#1e293b]/50 border border-gray-800 p-8 rounded-[2rem] backdrop-blur-sm space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 px-1">
                                        Game Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama game..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#0f172a] border border-gray-700 text-white font-bold rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 px-1">
                                        Category
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-[#0f172a] border border-gray-700 text-white font-bold rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                                        required
                                    >
                                        <option value="">Pilih Kategori...</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Visibility Toggle Box */}
                        <div className="bg-[#1e293b]/50 border border-gray-800 p-8 rounded-[2rem] backdrop-blur-sm flex flex-col justify-center">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4 px-1">
                                Visibility
                            </label>
                            <div 
                                onClick={() => setIsPublic(!isPublic)}
                                className="flex items-center justify-between bg-[#0f172a] p-4 rounded-2xl border border-gray-700 cursor-pointer hover:border-gray-500 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {isPublic ? <Globe size={18} className="text-green-400" /> : <Lock size={18} className="text-orange-400" />}
                                    <span className="font-black text-[10px] uppercase tracking-tight">
                                        {isPublic ? 'Public' : 'Private'}
                                    </span>
                                </div>
                                <div className={`w-8 h-4 flex items-center rounded-full px-1 transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-700'}`}>
                                    <div className={`bg-white w-2 h-2 rounded-full shadow-md transform transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rounds Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3 italic">
                                <ListOrdered className="text-orange-500" size={24} />
                                <h2 className="text-xl font-black uppercase tracking-tight">Rounds Setup</h2>
                            </div>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                {rounds.length} / 20 Rounds
                            </span>
                        </div>

                        {rounds.map((round, i) => (
                            <div 
                                key={i} 
                                className="group bg-[#1e293b]/30 border border-gray-800 hover:border-gray-700 p-6 rounded-[2rem] transition-all relative"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="bg-gray-800 text-gray-500 w-10 h-10 rounded-xl flex items-center justify-center font-black italic shrink-0 border border-gray-700">
                                        {i + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase px-1 tracking-tighter">Point Multiplier</label>
                                            <select
                                                value={round.type}
                                                onChange={(e) => handleRoundChange(i, 'type', e.target.value)}
                                                className="bg-[#1e293b] border border-gray-700 text-white font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                                            >
                                                {pointTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase px-1 tracking-tighter">Question Set</label>
                                            <AsyncPaginate
                                                key={`round-${i}`}
                                                styles={selectStyles}
                                                additional={{ page: 1 }}
                                                value={round.questionId ? { value: round.questionId, label: (round as any).questionLabel || 'Selected' } : null}
                                                loadOptions={loadQuestions}
                                                onChange={(selected: any) => {
                                                    handleRoundChange(i, "questionId", selected?.value || "");
                                                    handleRoundChange(i, "questionLabel", selected?.label || "");
                                                }}
                                                debounceTimeout={500}
                                                placeholder="Cari soal..."
                                            />
                                        </div>
                                    </div>

                                    {rounds.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRound(i)}
                                            className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-end md:self-center"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addRound}
                            disabled={rounds.length >= 20}
                            className={`w-full py-6 border-2 border-dashed rounded-[2rem] flex items-center justify-center gap-3 transition-all group ${
                                rounds.length >= 20 
                                ? 'border-gray-800 text-gray-700 cursor-not-allowed opacity-50' 
                                : 'border-gray-800 text-gray-600 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/5'
                            }`}
                        >
                            <Plus className={rounds.length < 20 ? "group-hover:rotate-90 transition-transform" : ""} size={20} />
                            <span className="font-black tracking-widest uppercase text-xs">
                                {rounds.length >= 20 ? 'Batas Ronde Tercapai' : 'Add Another Round'}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}