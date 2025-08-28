'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

let socket: any;

type Copper = {
  id: number;
  type: string;
  description: string;
};

type Game = {
  id: number;
  name: string;
  description: string;
  coppers: Copper[];
};

type Quiz = {
  id: number;
  question: string;
  answer: string;
  type: string;
  level: string;
};

export default function Game40Koper({ params }: { readonly params: { readonly gameId: string } }) {
  const { gameId } = params;

  const [game, setGame] = useState<Game | null>(null);
  const [selectedCopper, setSelectedCopper] = useState<Copper | null>(null);
  const [isOpening, setIsOpening] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [opened, setOpened] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCoppers, setShowCoppers] = useState(false);
  const [randomQuiz, setRandomQuiz] = useState<Quiz | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [shownQuizIds, setShownQuizIds] = useState<Set<number>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // FUNCTION FOR SOCKET

  const handleShowAllCoppers = () => {
    setShowIntro(false);

    setShowCoppers(true);
  }
  
  const handlePauseOrPlayMusic = () => {
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }

  const handleOpenModalQuiz = async () => {
    try {
      setShowAnswer(false);

      const audio = new Audio("/sounds/start.mp3");
      audio.volume = 0.6;
      audio.play();

      let quiz: Quiz | null = null;
      let attempts = 0;

      // coba fetch sampai dapat quiz baru atau max 10x
      while (!quiz && attempts < 10) {
        const res = await fetch(`${API_BASE_URL}/api/quizzes/random`);
        if (!res.ok) throw new Error("Failed to fetch random quiz");
        const data: Quiz = await res.json();

        if (!shownQuizIds.has(data.id)) {
          quiz = data;
          setShownQuizIds((prev) => new Set(prev).add(data.id));
        } else {
          attempts++;
        }
      }

      if (quiz) {
        setRandomQuiz(quiz);

        // play reveal saat quiz muncul
        const reveal = new Audio("/sounds/reveal.mp3");
        reveal.volume = 0.7;
        reveal.play();
      } else {
        console.log("Semua quiz sudah pernah ditampilkan 🎉");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleCloseModalQuiz = () => {
    setShowAnswer(false);
    setRandomQuiz(null);
  };

  const handleFeedbackWrong = () => {
    setFeedback("wrong");
  }

  const handleFeedbackCorrect = () => {
    setFeedback("correct");
  }

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  }

  const handleOpenModalCopper = (copper: Copper) => {
    if (opened.includes(copper.id)) return;

    setIsOpening(copper.id);
    setShowFlash(true);

    setTimeout(() => {
      setSelectedCopper(copper);
      setShowFlash(false);
      setIsOpening(null);
      setOpened((prev) => [...prev, copper.id]);
    }, 3000);
  };

  const handleCloseModalCopper = () => {
    setSelectedCopper(null)
  }




  //=======================================================/

  useEffect(() => {
    socket = io(undefined, { path: "/api/socket" });

    // daftar listener socket
    socket.on("handle-show-all-coppers", handleShowAllCoppers);
    socket.on("handle-pause-or-play-music", handlePauseOrPlayMusic);
    socket.on("handle-open-modal-quiz", handleOpenModalQuiz);
    socket.on("handle-close-modal-quiz", handleCloseModalQuiz);
    socket.on("handle-feedback-wrong", handleFeedbackWrong);
    socket.on("handle-feedback-correct", handleFeedbackCorrect);
    socket.on("handle-reveal-answer", handleRevealAnswer);
    socket.on("handle-open-modal-copper", handleOpenModalCopper);
    socket.on("handle-close-modal-copper", handleCloseModalCopper);

    // cleanup biar gak leak listener
    return () => {
        socket.off("handle-show-all-coppers", handleShowAllCoppers);
        socket.off("handle-pause-or-play-music", handlePauseOrPlayMusic);
        socket.off("handle-open-modal-quiz", handleOpenModalQuiz);
        socket.off("handle-close-modal-quiz", handleCloseModalQuiz);
        socket.off("handle-feedback-wrong", handleFeedbackWrong);
        socket.off("handle-feedback-correct", handleFeedbackCorrect);
        socket.off("handle-reveal-answer", handleRevealAnswer);
        socket.off("handle-open-modal-copper", handleOpenModalCopper);
        socket.off("handle-close-modal-copper", handleCloseModalCopper);
    };
  }, []);
  
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/games/${gameId}`);
        if (!res.ok) throw new Error("Failed to fetch game");
        const data: Game = await res.json();
        setGame(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s") {
        handleShowAllCoppers();
      }

      if (e.key.toLowerCase() === "q") {
        await handleOpenModalQuiz();
      }

      // ✅❌ tombol X & O hanya berlaku kalau modal quiz terbuka
      if (randomQuiz) {
        if (e.key.toLowerCase() === "x") {
          handleFeedbackWrong();
        }
        if (e.key.toLowerCase() === "o") {
          handleFeedbackCorrect();
        }

        // ✅ Tombol R untuk reveal jawaban
        if (e.key.toLowerCase() === "r") {
          handleRevealAnswer();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [randomQuiz]);

  // --- EFFECT: suara flash putih (flip) ---
  useEffect(() => {
    if (showFlash) {
      const audio = new Audio("/sounds/whoosh.mp3");
      audio.volume = 0.6;
      audio.play();
    }
  }, [showFlash]);

  // --- EFFECT: suara modal (punishment / prize) ---
  useEffect(() => {
    if (selectedCopper) {
      let audioPath = "";
      if (selectedCopper.type === "PUNISHMENT") {
        audioPath = "/sounds/punishment.mp3";
      } else {
        audioPath = "/sounds/prize.mp3";
      }

      const audio = new Audio(audioPath);
      audio.volume = 0.7;
      audio.play();
    }
  }, [selectedCopper]);

  useEffect(() => {
    if (!bgmRef.current) {
      // kalau belum ada audio, bikin sekali aja
      bgmRef.current = new Audio("/sounds/deal.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.5;

      const startMusic = () => {
        bgmRef.current?.play().catch((err) => console.warn("Autoplay blocked:", err));
        window.removeEventListener("click", startMusic);
        window.removeEventListener("keydown", startMusic);
      };
      window.addEventListener("click", startMusic);
      window.addEventListener("keydown", startMusic);
    }

    // setiap kali showIntro berubah → cukup ganti src
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current.src = showIntro ? "/sounds/deal.mp3" : "/sounds/music.mp3";
      bgmRef.current.load();
      bgmRef.current.play().catch(() => {});
    }

    return () => {
      bgmRef.current?.pause();
    };
  }, [showIntro]);

  // 🔊 pause/resume music saat modal muncul/hilang
  useEffect(() => {
    if (!bgmRef.current) return;
    if (selectedCopper || showFlash) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch(() => {});
    }
  }, [selectedCopper, showFlash]);

  // 🔊 Toggle musik dengan tombol P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p" && bgmRef.current) {
        handlePauseOrPlayMusic();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    let audioPath = feedback === "correct" ? "/sounds/correct.mp3" : "/sounds/wrong.mp3";
    const audio = new Audio(audioPath);
    audio.volume = 0.7;
    audio.play();

    // hilang otomatis setelah 2 detik
    const timer = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (game?.coppers && game.coppers.length > 0) {
      // kasih delay 3 detik sebelum intro hilang
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 90000);

      return () => clearTimeout(timer);
    }
  }, [game]);

  const variants = {
    hidden: { opacity: 0, scale: 0 },
    show: (idx: number) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: idx * 0.15 },
    }),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading game...
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        Gagal memuat game.
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        backgroundImage: "url('/background/future.gif')",
        backgroundSize: "100%",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        imageRendering: "auto",
        fontFamily: '"Michroma", sans-serif'
      }}
    >
      {/* Background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" /> */}

      {/* <h1 className="text-4xl font-extrabold mb-10 text-yellow-400 drop-shadow-lg z-10">
        🎲 {game.name} ({game.coppers.length} Koper)
      </h1> */}

      {/* Grid 8 x 5 (untuk 40 koper) */}
      {/* Intro / Grid Koper */}
      <AnimatePresence mode="wait">
        {showIntro ? (
          // Tampilkan intro dulu
          <motion.h1
            className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text 
                      bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 drop-shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0],
              textShadow: [
                "0px 0px 20px rgba(255,0,0,0.9)",
                "0px 0px 40px rgba(255,255,0,1)",
                "0px 0px 20px rgba(255,0,0,0.9)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            DEAL OR NO DEAL
          </motion.h1>
        ) : (
          // Grid koper
          <motion.div
            key="grid"
            className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 sm:gap-6 md:gap-10 lg:gap-14 z-10"
            initial="hidden"
            animate={showCoppers ? "show" : "hidden"}
          >
            {game.coppers.map((copper, idx) => {
              const alreadyOpened = opened.includes(copper.id);

              return (
                <motion.div
                  key={copper.id}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 cursor-pointer perspective-1000"
                  onClick={() => handleOpenModalCopper(copper)}
                  custom={idx}
                  variants={variants}
                  initial="hidden"
                  animate={showCoppers ? "show" : "hidden"}
                  onAnimationComplete={() => {
                    if (showCoppers) {
                      const audio = new Audio("/sounds/flip.mp3");
                      audio.volume = 0.5;
                      audio.play();
                    }
                  }}
                >
                  {/* Handle koper */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-800 rounded-t-full shadow-lg z-30" />

                  {/* Tutup koper */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-gray-400 via-gray-300 to-gray-600 border-2 border-gray-700 rounded-t-lg shadow-inner z-20"
                    animate={
                      isOpening === copper.id
                        ? { rotateX: -120, y: -4, opacity: 0 }
                        : { rotateX: 0, y: 0, opacity: alreadyOpened ? 0 : 1 }
                    }
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{
                      transformOrigin: "bottom center",
                      transformStyle: "preserve-3d",
                    }}
                  />

                  {/* Body koper */}
                  <div
                    className={`absolute top-0 left-0 w-full h-full rounded-xl border-4 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] 
                      ${alreadyOpened
                        ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 border-gray-700 opacity-80"
                        : "bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 border-gray-900"}`}
                  >
                    {alreadyOpened ? (
                      <span className="text-red-600 font-extrabold text-3xl">✖</span>
                    ) : (
                      <span className="font-extrabold text-white text-2xl drop-shadow-lg tracking-wider">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.0, ease: "easeOut" }}
          >
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,1),rgba(255,255,255,0.3))]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Box */}
      <AnimatePresence>
        {selectedCopper && (
          <motion.div
            className={`fixed inset-0 flex items-center justify-center z-50 
              ${selectedCopper.type === "PUNISHMENT" 
                ? "bg-red-950 bg-opacity-70" 
                : "bg-blue-950 bg-opacity-70"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModalCopper}
          >
            {/* Background glow */}
            <motion.div
              className={`absolute w-[900px] h-[900px] rounded-full blur-3xl opacity-40 
                ${selectedCopper.type === "PUNISHMENT" ? "bg-red-600" : "bg-blue-600"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1.8, opacity: 0.5 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 3.0, ease: "easeOut" }}
            />  

            <motion.div
              className={`relative px-8 py-14 rounded-3xl text-center max-w-4xl w-full border-8 
                shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_80px_rgba(0,0,0,0.6)] 
                ${selectedCopper.type === "PUNISHMENT"
                  ? "bg-gradient-to-br from-red-800 via-red-600 to-red-400 border-red-900"
                  : "bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 border-blue-900"}`}
              initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.2, rotate: 45, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <motion.h2
                className={`text-5xl font-extrabold mb-8 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] 
                  ${selectedCopper.type === "PUNISHMENT" ? "text-red-100" : "text-blue-100"}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.6 } }}
              >
                {selectedCopper.type === "PUNISHMENT" ? "😈" : "🎉"}
              </motion.h2>

              {/* Description */}
              <p className="text-8xl text-gray-100 font-semibold px-6 drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
                {selectedCopper.description}
              </p>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Quiz Random */}
      <AnimatePresence>
        {randomQuiz && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRandomQuiz(null)}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute w-[900px] h-[900px] rounded-full blur-3xl opacity-40 bg-yellow-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0.4 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 2.0, ease: "easeOut" }}
            />

            {/* Modal Box */}
            <motion.div
              className="relative w-[1000px] max-w-6xl rounded-3xl border-8 p-20 text-center
                        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700
                        border-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.6)]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pertanyaan */}
              <motion.h2
                className="mb-12 text-6xl font-extrabold leading-snug text-yellow-400 
                          drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                initial={{ scale: 0.8 }}
                animate={{
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }}
              >
                {randomQuiz.question} ❓
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Benar / Salah */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Glow */}
            <motion.div
              className={`absolute w-[1200px] h-[1200px] rounded-full blur-3xl opacity-40 
                ${feedback === "correct" ? "bg-green-500" : "bg-red-600"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0.4 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Overlay Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br 
                ${feedback === "correct" 
                  ? "from-green-900/40 via-green-700/30 to-transparent" 
                  : "from-red-900/40 via-red-700/30 to-transparent"}`}
            />

            {/* Symbol ✔ / ✖ */}
            <motion.span
              className={`relative text-[220px] font-extrabold drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] 
                ${feedback === "correct" ? "text-green-400" : "text-red-500"}`}
              animate={
                feedback === "correct"
                  ? { scale: [1, 1.3, 1], textShadow: "0 0 60px rgba(34,197,94,0.9)" }
                  : { x: [0, -20, 20, -20, 20, 0], textShadow: "0 0 60px rgba(220,38,38,0.9)" }
              }
              transition={
                feedback === "correct"
                  ? { repeat: Infinity, duration: 1.5 }
                  : { duration: 0.6 }
              }
            >
              {feedback === "correct" ? "✔" : "✖"}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Quiz Random */} 
      <AnimatePresence>
        {randomQuiz && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModalQuiz}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute w-[900px] h-[900px] rounded-full blur-3xl opacity-40 bg-yellow-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0.4 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 2.0, ease: "easeOut" }}
            />

            {/* Modal Box */}
            <motion.div
              className="relative w-[1000px] max-w-6xl rounded-3xl border-8 p-20 text-center
                        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700
                        border-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.6)]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pertanyaan */}
              <motion.h2
                className="mb-12 text-6xl font-extrabold leading-snug text-yellow-400 
                          drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                initial={{ scale: 0.8 }}
                animate={{
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }}
              >
                {randomQuiz.question} ❓
              </motion.h2>

              {/* Jawaban (muncul hanya kalau tekan R) */}
              {showAnswer && (
                <motion.p
                  className="mt-8 text-6xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(0,255,0,0.7)]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {randomQuiz.answer}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
