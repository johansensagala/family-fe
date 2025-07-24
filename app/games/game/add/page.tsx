'use client'

import { createGameWithRounds, getAllQuestions } from '@/services/gameService'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

interface Answer {
    id: number
    answer: string
    poin: number
    isSurprise: boolean
}

interface Question {
    id: number
    question: string
    answers: Answer[]
}

interface RoundInput {
    type: string
    questionId: number | ''
}

export default function Game() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [rounds, setRounds] = useState<RoundInput[]>([{ type: 'SINGLE', questionId: '' }])
    const [questions, setQuestions] = useState<Question[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchQuestions = async () => {
            const data = await getAllQuestions()
            setQuestions(data)
        }
        fetchQuestions()
    }, [])

    const handleRoundChange = (index: number, field: keyof RoundInput, value: any) => {
        const updatedRounds = [...rounds]
        updatedRounds[index][field] = value
        setRounds(updatedRounds)
    }

    const addRound = () => {
        console.log(questions)

        setRounds([...rounds, { type: 'SINGLE', questionId: '' }])
    }

    const removeRound = (index: number) => {
        const updatedRounds = rounds.filter((_, i) => i !== index)
        setRounds(updatedRounds)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        for (const round of rounds) {
            if (!round.questionId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Pilih pertanyaan untuk semua round'
                })
                return
            }
        }

        try {
            setIsSubmitting(true)
            const payload = {
                name,
                rounds: rounds.map(r => ({
                    type: r.type,
                    questionId: r.questionId
                }))
            }

            await createGameWithRounds(payload)

            Swal.fire({
                icon: 'success',
                title: 'Game berhasil dibuat!'
            })

            setName('')
            setRounds([{ type: 'SINGLE', questionId: '' }])
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal menyimpan game',
                text: err.message || ''
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{
                backgroundImage: "url('/background/black.webp')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                fontFamily: '"Michroma", sans-serif'
            }}
        >
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            <div className="w-full max-w-3xl bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Buat Game + Rounds</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block mb-2 font-semibold">Name of Game:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-gray-200 text-gray-900"
                            required
                        />
                    </div>

                    {rounds.map((round, i) => (
                        <div key={i} className="p-4 bg-gray-700 rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Round {i + 1}</h3>
                                {rounds.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRound(i)}
                                        className="text-red-300 hover:text-red-500"
                                    >
                                        Delete Round
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1">Round Type:</label>
                                <select
                                    value={round.type}
                                    onChange={(e) => handleRoundChange(i, 'type', e.target.value)}
                                    className="w-full px-4 py-2 rounded bg-gray-200 text-gray-900"
                                >
                                    <option value="SINGLE">SINGLE</option>
                                    <option value="DOUBLE">DOUBLE</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1">Select Question:</label>
                                <select
                                    value={round.questionId}
                                    onChange={(e) => handleRoundChange(i, 'questionId', Number(e.target.value))}
                                    className="w-full px-4 py-2 rounded bg-gray-200 text-gray-900"
                                    required
                                >
                                    <option value="">-- Select Question --</option>
                                    {questions.map((q) => (
                                        <option key={q.id} value={q.id}>
                                            {q.question} ({q.answers.length} answer)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addRound}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded"
                        >
                            Add Round
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Save Game'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
