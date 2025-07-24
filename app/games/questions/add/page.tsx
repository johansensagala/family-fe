'use client'

import { createQuestion } from '@/services/gameService'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Swal from 'sweetalert2'

interface AnswerInput {
    answer: string
    poin: number
    isSurprise: boolean
}

export default function Family100QuestionForm() {
    const router = useRouter()

    const [question, setQuestion] = useState('')
    const [answers, setAnswers] = useState<AnswerInput[]>([
        { answer: '', poin: 0, isSurprise: false }
    ])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const totalPoints = answers.reduce((acc, curr) => acc + curr.poin, 0)

    const handleAnswerChange = (index: number, field: keyof AnswerInput, value: any) => {
        const newAnswers = [...answers]
        newAnswers[index][field] = field === 'poin' ? Number(value) : value
        setAnswers(newAnswers)
    }

    const addAnswer = () => {
        setAnswers([...answers, { answer: '', poin: 0, isSurprise: false }])
    }

    const removeAnswer = (index: number) => {
        setAnswers(answers.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (totalPoints > 100) {
            Swal.fire({
                icon: 'error',
                title: 'Total poin tidak boleh melebihi 100',
            })
            return
        }

        try {
            setIsSubmitting(true)
            await createQuestion({ question, answers })
            Swal.fire({
                icon: 'success',
                title: 'Pertanyaan berhasil disimpan!'
            })
            setQuestion('')
            setAnswers([{ answer: '', poin: 0, isSurprise: false }])
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal menyimpan pertanyaan',
                text: err.message || ''
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="min-h-screen px-4 py-8 md:px-12 md:py-10 flex flex-col items-center justify-center relative"
            style={{
                backgroundImage: "url('/background/black.webp')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                imageRendering: 'auto',
                fontFamily: '"Michroma", sans-serif'
            }}
        >
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
            </div>
            
            <div className="w-full max-w-3xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-6 rounded-lg shadow-lg mt-16">
                <h2 className="text-2xl font-bold mb-4 text-center">Create Question</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-semibold">Question:</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-gray-200 text-gray-900"
                            placeholder="Contoh: Sebutkan benda yang sering dibawa ke sekolah"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Answer:</h3>
                        {answers.map((ans, index) => (
                            <div
                                key={index}
                                className="bg-gray-600 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4"
                            >
                                <input
                                    type="text"
                                    value={ans.answer}
                                    onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                                    className="flex-1 px-4 py-2 rounded bg-gray-200 text-gray-900"
                                    placeholder={`Jawaban ${index + 1}`}
                                    required
                                />
                                <input
                                    type="number"
                                    value={ans.poin}
                                    onChange={(e) => handleAnswerChange(index, 'poin', e.target.value)}
                                    className="w-24 px-4 py-2 rounded bg-gray-200 text-gray-900"
                                    placeholder="Poin"
                                    required
                                    min={0}
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={ans.isSurprise}
                                        onChange={(e) => handleAnswerChange(index, 'isSurprise', e.target.checked)}
                                    />
                                    <span>Surprise?</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeAnswer(index)}
                                    className="text-red-300 hover:text-red-500 font-bold"
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAnswer}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded"
                        >
                            Add Answer
                        </button>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="text-right">
                            <div
                                className={`inline-block font-bold px-4 py-2 rounded shadow ${
                                    totalPoints > 100
                                        ? 'bg-red-400 text-white'
                                        : 'bg-yellow-300 text-gray-900'
                                }`}
                            >
                                Total Point: {totalPoints}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
