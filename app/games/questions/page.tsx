'use client'

import { getAllQuestions } from '@/services/gameService'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function QuestionList() {
	const [questions, setQuestions] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedQuestion, setSelectedQuestion] = useState(null)
	const router = useRouter()

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const response = await getAllQuestions()
				setQuestions(response)
			} catch (err) {
				setError('Gagal mengambil data pertanyaan')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetchQuestions()
	}, [])

	if (loading) return <div className="text-white text-center p-8">Loading...</div>
	if (error) return <div className="text-red-400 text-center p-8">{error}</div>

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
						onClick={() => router.push('/games/questions/add')}
						className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
					>
						Add Question
					</button>
				</div>

				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
				>
					List of Question
				</motion.h1>

				<div className="grid gap-4">
					{questions.map((q, index) => (
						<motion.div
							key={q.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							onClick={() => setSelectedQuestion(q)}
							className="cursor-pointer bg-[#1f0036]/60 hover:bg-[#3a1c71]/70 transition-colors duration-300 backdrop-blur-md border border-purple-400/30 rounded-xl p-5 shadow-[0_0_25px_4px_rgba(186,104,200,0.3)]"
						>
							<h2 className="text-xl font-semibold text-yellow-300">
								{index + 1}. {q.question}
							</h2>
						</motion.div>
					))}
				</div>
			</div>

			{/* --- MODAL --- */}
			{selectedQuestion && (
				<div
					className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
					onClick={() => setSelectedQuestion(null)}
				>
					<div
						className="bg-[#1f0036] rounded-2xl border border-purple-400/30 max-w-xl w-full p-6 relative shadow-[0_0_50px_10px_rgba(186,104,200,0.4)]"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setSelectedQuestion(null)}
							className="absolute top-4 right-4 text-white/70 hover:text-white transition"
						>
							<X size={24} />
						</button>

						<h2 className="text-2xl font-bold text-yellow-300 mb-4 text-center">
							{selectedQuestion.question}
						</h2>

						<ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
							{selectedQuestion.answers.map((ans) => (
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

						<div className="text-right text-sm text-white/70 mt-4">
							Total poin:{' '}
							<span className="text-yellow-300 font-semibold">
								{selectedQuestion.answers.reduce((total, a) => total + a.poin, 0)}
							</span>
						</div>

						{/* Tombol Edit */}
						<div className="mt-6 text-center">
							<button
								onClick={() => router.push(`/games/questions/edit/${selectedQuestion.id}`)}
								className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-pink-600 hover:to-purple-700 transition text-white font-bold py-2 px-6 rounded-full shadow-lg"
							>
								Edit Pertanyaan
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
