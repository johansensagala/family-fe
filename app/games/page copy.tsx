'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function MainMenuPage() {
	const menus = [
		{ title: 'Questions',     href: '/games/questions' },
		{ title: 'Add Questions', href: '/games/questions/add' },
		{ title: 'Game',          href: '/games/game' },
		{ title: 'Add Game',      href: '/games/game/add' }
	]

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [muted, setMuted] = useState(false)

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		audio.muted = muted
	}, [muted])

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center overflow-hidden"
			style={{
				backgroundImage: "url('/background/black.webp')",
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				fontFamily: '"Michroma", sans-serif'
			}}
		>
			{/* --- BGM element --- */}
			<audio
				ref={audioRef}
				src="/sounds/funny-music.mp3"
				preload="auto"
				autoPlay
				loop
			/>

			{/* --- tombol mute --- */}
			<button
				onClick={() => setMuted((m) => !m)}
				className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10"
			>
				{muted ? <VolumeX size={32} /> : <Volume2 size={32} />}
			</button>

			<motion.div
				id="game-container"
				className="relative mx-auto max-w-5xl w-full text-center p-6 rounded-xl"
				initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={{ duration: 1, ease: 'easeOut' }}
			>
				<motion.div
					animate={{
						scale: [1, 1.05, 1],
						rotate: [0, 1, -1, 0]
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				>
					<div className="flex justify-center flex-wrap">
						<h1
							className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-extrabold leading-none
									bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500
									bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
							style={{ fontFamily: '"Michroma", sans-serif' }}
						>
							FAMILY
						</h1>
					</div>
					<div className="flex justify-center flex-wrap mt-[-1rem]">
						<h1
							className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-extrabold leading-none
									bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500
									bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
							style={{ fontFamily: '"Michroma", sans-serif' }}
						>
							FORTUNES
						</h1>
					</div>
				</motion.div>
			</motion.div>

			{/* --- menu grid --- */}
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
				{menus.map((m, i) => (
					<Link key={m.title} href={m.href}>
						<motion.div
							initial={{ opacity: 0, y: 60 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: i * 0.1,
								duration: 0.4,
								type: 'spring',
								stiffness: 300,
								damping: 12
							}}
							whileHover={{
								scale: 1.2,
								rotate: [0, 2, -2, 2, -1, 1, 0],
								transition: {
									duration: 0.6,
									ease: 'easeInOut',
									repeat: Infinity,
									repeatType: 'loop'
								}
							}}
							whileTap={{ scale: 0.9 }}
							className="relative flex items-center justify-center
								w-40 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 lg:w-64 lg:h-44 rounded-3xl cursor-pointer
								bg-gradient-to-br from-[#1f0036] via-[#3a1c71] to-[#5b247a]
								shadow-[0_0_35px_8px_rgba(123,31,162,0.6)]
								border-2 border-[#c084fc]
								text-white transition-all duration-300 ease-in-out hover:shadow-[0_0_60px_12px_rgba(186,104,200,0.8)]"
						>
							<span className="text-xl font-bold tracking-wide drop-shadow-md text-center px-4">
								{m.title}
							</span>

							{/* inner neon glow */}
							<div className="absolute inset-0 rounded-3xl pointer-events-none
								shadow-[inset_0_0_18px_3px_rgba(255,255,255,0.2)]" />
						</motion.div>
					</Link>
				))}
			</div>
		</div>
	)
}
