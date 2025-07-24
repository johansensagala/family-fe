'use client'

import { getAllGames } from '@/services/gameService'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GameQuestionList() {
	const [games, setGames] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
    const [selectedGame, setSelectedGame] = useState(null)
	const router = useRouter()

	useEffect(() => {
		const fetchGames = async () => {
			try {
				const response = await getAllGames()
				setGames(response)
			} catch (err) {
				setError('Gagal mengambil data game')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetchGames()
	}, [])

	if (loading) return <div className="text-white text-center p-8">Loading...</div>
	if (error) return <div className="text-red-400 text-center p-8">{error}</div>

	// Flatten semua pertanyaan dari semua games dan rounds
	const allQuestions = games.flatMap((game) =>
		game.rounds
			.filter((round) => round?.question) // pastikan question ada
			.map((round) => ({
				gameName: game.name,
				roundId: round.id,
				roundType: round.type,
				questionData: round.question,
			}))
	)

	return (
		<div className="min-h-screen px-4 py-10 text-white overflow-y-auto"
			style={{
				backgroundImage: "url('/background/black.webp')",
				backgroundSize: '100% 100%',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				fontFamily: '"Michroma", sans-serif',
			}}
		>
			<div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={() => router.push('/games/game/add')}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
                    >
                        Add Game
                    </button>
                </div>

				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
				>
					List of Game
				</motion.h1>

				<div className="grid gap-4">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedGame(game)}
                            className="cursor-pointer bg-[#1f0036]/60 hover:bg-[#3a1c71]/70 transition-colors duration-300 backdrop-blur-md border border-purple-400/30 rounded-xl p-5 shadow-[0_0_25px_4px_rgba(186,104,200,0.3)]"
                        >
                            <h2 className="text-xl font-semibold text-yellow-300 mb-1">
                                {index + 1}. {game.name}
                            </h2>
                            <p className="text-sm text-white/60">
                                {game.rounds.length} round | {game.finalRounds.length} final round
                            </p>
                        </motion.div>
                    ))}
				</div>
			</div>

			{/* --- MODAL --- */}
            {selectedGame && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                    onClick={() => setSelectedGame(null)}
                >
                    <div
                        className="bg-[#1f0036] rounded-2xl border border-purple-400/30 max-w-4xl w-full p-6 relative shadow-[0_0_50px_10px_rgba(186,104,200,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedGame(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-yellow-300 mb-6 text-center">
                            Game: {selectedGame.name}
                        </h2>

                        <div className="my-8 flex flex-row justify-center items-center space-x-2">
                            <button
                                onClick={() => router.push(`/games/remote/${selectedGame.id}`)}
                                className="w-48 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
                            >
                                Remote
                            </button>
                            <button
                                onClick={() => router.push(`/games/display/${selectedGame.id}`)}
                                className="w-48 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
                            >
                                Display
                            </button>
                            <button
                                onClick={() => router.push(`/games/game/edit/${selectedGame.id}`)}
                                className="w-48 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow"
                            >
                                Edit
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {selectedGame.rounds.map((round, index) => (
                                <div key={round.id} className="bg-purple-900/20 p-4 rounded-xl border border-purple-400/10">
                                    <h3 className="text-lg font-semibold text-pink-400 mb-2">
                                        Round #{round.id} — {round.type}
                                    </h3>

                                    <p className="text-white mb-3">{round.question?.question}</p>

                                    <ul className="space-y-2">
                                        {round.question?.answers?.map((ans) => (
                                            <li
                                                key={ans.id}
                                                className="flex justify-between items-center bg-purple-900/40 border border-purple-400/20 rounded-lg px-4 py-2"
                                            >
                                                <span className="text-white">
                                                    {ans.answer}
                                                    {ans.isSurprise && (
                                                        <span className="ml-2 text-pink-400 font-semibold animate-pulse">
                                                            (SURPRISE!)
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-bold text-yellow-400">{ans.poin} poin</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-right text-sm text-white/60 mt-2">
                                        Total poin:{' '}
                                        <span className="text-yellow-300 font-semibold">
                                            {round.question?.answers?.reduce((sum, a) => sum + a.poin, 0) ?? 0}
                                        </span>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => router.push(`/games/questions/edit/${round.question.id}`)}
                                            className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-700 transition text-white font-bold py-2 px-6 rounded-full shadow-lg"
                                        >
                                            Edit Question
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
		</div>
	)
}
