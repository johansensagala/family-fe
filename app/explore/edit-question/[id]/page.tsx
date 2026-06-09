'use client'

import { getQuestionById, updateQuestion } from '@/services/gameService'
import { ArrowLeft, Plus, Trash2, Save, HelpCircle, ListPlus, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

interface AnswerInput {
    answer: string
    poin: number
    isSurprise: boolean
}

export default function EditQuestionPage() {
    const router = useRouter()
    const { id } = useParams() // Ambil ID dari URL
    
    const [question, setQuestion] = useState('')
    const [answers, setAnswers] = useState<AnswerInput[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // 1. Fetch data lama saat komponen dimuat
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsLoading(true)
                const data = await getQuestionById(id as string)
                setQuestion(data.question)
                // Map data jawaban dari API ke state
                setAnswers(data.answers.map((a: any) => ({
                    answer: a.answer,
                    poin: a.poin,
                    isSurprise: a.isSurprise || false
                })))
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengambil data pertanyaan.' })
                router.back()
            } finally {
                setIsLoading(false)
            }
        }
        if (id) fetchDetail()
    }, [id, router])

    const handleAnswerChange = (index: number, field: keyof AnswerInput, value: any) => {
        const updatedAnswers = [...answers]
        updatedAnswers[index] = { ...updatedAnswers[index], [field]: value }
        setAnswers(updatedAnswers)
    }

    const addAnswer = () => {
        if (answers.length < 10) {
            setAnswers([...answers, { answer: '', poin: 0, isSurprise: false }])
        } else {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Limit Tercapai!', 
                text: 'Maksimal 10 jawaban per pertanyaan.',
                background: '#1e293b', color: '#fff', confirmButtonColor: '#8b5cf6'
            })
        }
    }

    const removeAnswer = (index: number) => {
        setAnswers(answers.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!question.trim()) return Swal.fire({ icon: 'error', title: 'Kosong', text: 'Pertanyaan tidak boleh kosong!' })
        if (answers.some(a => !a.answer.trim() || a.poin <= 0)) {
            return Swal.fire({ icon: 'error', title: 'Data Tidak Valid', text: 'Semua jawaban harus diisi dan poin harus lebih dari 0' })
        }

        const totalPoin = answers.reduce((acc, curr) => acc + curr.poin, 0);
        if (totalPoin > 100) {
            return Swal.fire({ 
                icon: 'error', 
                title: 'Poin Terlalu Tinggi', 
                text: `Total poin adalah ${totalPoin}. Maksimal adalah 100.`,
                background: '#1e293b', color: '#fff', confirmButtonColor: '#ef4444'
            });
        }

        try {
            setIsSubmitting(true)
            await updateQuestion(id as string, { question, answers })
            
            await Swal.fire({ 
                icon: 'success', 
                title: 'Berhasil Diperbarui!', 
                text: 'Perubahan telah disimpan ke bank soal.',
                timer: 2000 
            })
            router.push('/explore/my-questions') // Redirect ke list pertanyaan
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.message })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
                <p className="font-black italic tracking-widest animate-pulse uppercase text-xs">Loading Question...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <button onClick={() => router.back()} className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft size={18} /> Kembali
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <HelpCircle className="text-purple-500" size={40} />
                            Edit Question
                        </h1>
                        <p className="text-gray-400 mt-2 italic font-medium">Ubah detail pertanyaan yang sudah ada.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 transition-all transform hover:scale-105 active:scale-95 text-xs tracking-widest"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'UPDATING...' : 'UPDATE QUESTION'}
                    </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="bg-[#1e293b]/50 border border-gray-800 p-8 rounded-[2rem] backdrop-blur-sm shadow-xl">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4">
                            Question Prompt
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-[#0f172a] border border-gray-700 text-white text-xl font-bold rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600 resize-none"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3 italic">
                                <ListPlus className="text-blue-500" size={24} />
                                <h2 className="text-xl font-black uppercase tracking-tight">Answer Options</h2>
                            </div>
                            <span className={`text-xs font-black ${answers.length >= 10 ? 'text-orange-500' : 'text-gray-500'}`}>
                                {answers.length} / 10
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {answers.map((ans, i) => (
                                <div key={i} className="group bg-[#1e293b]/30 border border-gray-800 hover:border-gray-700 p-4 rounded-2xl transition-all flex flex-col md:flex-row gap-4 items-center">
                                    <div className="bg-gray-800 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 border border-gray-700 shadow-inner italic">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            value={ans.answer}
                                            onChange={(e) => handleAnswerChange(i, 'answer', e.target.value)}
                                            className="w-full bg-[#0f172a] border border-gray-700 text-white font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="w-full md:w-32 flex flex-col gap-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={ans.poin}
                                                onChange={(e) => handleAnswerChange(i, 'poin', parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#0f172a] border border-gray-700 text-white font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                            />
                                            <span className="absolute right-3 top-3.5 text-[9px] font-black text-gray-500 uppercase tracking-tighter">Pts</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleAnswerChange(i, 'isSurprise', !ans.isSurprise)}
                                            className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                                                ans.isSurprise 
                                                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' 
                                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                                            }`}
                                        >
                                            <CheckCircle2 size={20} className={ans.isSurprise ? 'animate-pulse' : ''} />
                                            <span className="text-[10px] font-black uppercase md:hidden">Surprise</span>
                                        </button>
                                        {answers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAnswer(i)}
                                                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addAnswer}
                            disabled={answers.length >= 10}
                            className={`w-full py-5 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all group ${
                                answers.length >= 10 
                                ? 'border-gray-800 opacity-50 cursor-not-allowed text-gray-700' 
                                : 'border-gray-800 text-gray-500 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/5'
                            }`}
                        >
                            <Plus className={answers.length < 10 ? "group-hover:rotate-90 transition-transform" : ""} />
                            <span className="font-black tracking-[0.2em] uppercase text-xs">
                                {answers.length >= 10 ? 'MAXIMUM ANSWERS REACHED' : 'Add New Answer Slot'}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}