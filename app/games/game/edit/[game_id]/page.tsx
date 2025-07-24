'use client'

import { getAllQuestions, getGameById, updateGame } from '@/services/gameService'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

interface Question {
    id: number
    question: string
}

interface RoundInput {
    type: string
    questionId: number | ''
}

export default function EditGame() {
    const router = useRouter()
    const params = useParams()
    const gameId = Number(params?.game_id)

    const [name, setName] = useState('')
    const [rounds, setRounds] = useState<RoundInput[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gameData, questionsData] = await Promise.all([
                    getGameById(gameId),
                    getAllQuestions(),
                ])

                setName(gameData.name || '')
                setRounds(
                    gameData.rounds.map((r: any) => ({
                        type: r.type || 'SINGLE',
                        questionId: r.question?.id || '',
                    }))
                )
                setQuestions(questionsData)
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal memuat data game',
                    text: (err as any).message || '',
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (gameId) fetchData()
    }, [gameId])

    const handleRoundChange = (index: number, field: keyof RoundInput, value: any) => {
        const updated = [...rounds]
        updated[index][field] = value
        setRounds(updated)
    }

    const addRound = () => {
        setRounds([...rounds, { type: 'SINGLE', questionId: '' }])
    }

    const removeRound = (index: number) => {
        const updated = rounds.filter((_, i) => i !== index)
        setRounds(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            Swal.fire({ icon: 'error', title: 'Nama game tidak boleh kosong' })
            return
        }

        for (const r of rounds) {
            if (!r.questionId) {
                Swal.fire({ icon: 'error', title: 'Semua round harus punya pertanyaan' })
                return
            }
        }

        try {
            setIsSubmitting(true)

            const payload = {
                name,
                rounds: rounds.map((r) => ({
                    type: r.type,
                    questionId: r.questionId,
                })),
            }

            await updateGame(gameId, payload)

            Swal.fire({
                icon: 'success',
                title: 'Game berhasil diperbarui!',
            }).then(() => {
                router.push('/games') // redirect ke list game
            })
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal update game',
                text: (err as any).message || '',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="text-white text-center py-10">Loading...</div>
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{
                backgroundImage: "url('/background/black.webp')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                fontFamily: '"Michroma", sans-serif',
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
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Game</h2>
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
                                            {q.question}
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
                            {isSubmitting ? 'Menyimpan...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
