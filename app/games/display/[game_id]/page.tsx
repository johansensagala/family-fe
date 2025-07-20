'use client';

import { motion } from "framer-motion";
import { use, useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import '../../../../app/globals.css';
import { getGamesById } from '../../../../services/gameService';
import "../../ShineEffect.css";

let socket: any;

interface Answer {
  id?: string;
  answer: string;
  poin: number;
  isSurprise: boolean
}

interface Game {
  rounds: {
    id: string;
    question: {
      question: string;
      answers: Answer[];
    };
    type: string;
  }[];
}

interface AnswerRowProps {
  answer: Answer;
  index: number;
  multiplier?: number;
  onScoreChange: (score: number) => void;
  onIncorrectReveal?: () => void; // ✅ Tambahkan ini untuk menangani klik salah
  onIncorrectRevealWithoutIcon?: () => void; // ✅ Tambahkan ini untuk menangani klik salah
}

function AnswerRow({ answer, index, multiplier = 1, onScoreChange, onIncorrectReveal, onIncorrectRevealWithoutIcon }: AnswerRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [playFirstSurpriseEffect, setPlayFirstSurpriseEffect] = useState(false);
  const [showRevealEffect, setShowRevealEffect] = useState(false);
  const [scaledDown, setScaledDown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const fitText = () => {
    if (!revealed) return;
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const scale = Math.min(1, container.clientWidth / text.scrollWidth);
    text.style.transform = `scaleX(${scale})`;

    // < 0.999 untuk toleransi floating-point
    setScaledDown(scale < 0.999);
  };

  useEffect(() => {
    fitText();
    window.addEventListener("resize", fitText);
    return () => {
      window.removeEventListener("resize", fitText);
    };
  }, [revealed, answer.answer]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!event.altKey) return;

      if (event.key === String(index + 1)) {
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [index]);

  useEffect(() => {
    const socket = io(undefined, {
      path: "/api/socket",
    });

    socket.on("set-reveal-answer", (indexSO: number) => {
      if (index === indexSO) {
        handleClick();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [index]);

  const handleClick = () => {
    setRevealed((prevRevealed) => {
      if (!prevRevealed) {
        const audioFile = answer.isSurprise
          ? "/sounds/siren.mp3"
          : index === 0
          ? "/sounds/top-survey-2.mp3"
          : "/sounds/correct-2.mp3";
        const audio = new Audio(audioFile);
        audio.currentTime = 0;
        audio.play();

        if (answer.isSurprise) {
          const audio2 = new Audio("/sounds/cashier.mp3");
          audio2.currentTime = 0.2;
          audio2.play();

          // Trigger efek khusus pertama kali
          setPlayFirstSurpriseEffect(true);
          setTimeout(() => {
            setPlayFirstSurpriseEffect(false);
          }, 800); // Durasi animasi efek pertama
        } else {
          // ✨ Tambah efek reveal biasa
          setShowRevealEffect(true);
          setTimeout(() => setShowRevealEffect(false), 400);
        }

        onScoreChange(answer.poin * multiplier);
      } else {
        // Sudah terbuka, artinya salah tekan
        const audio = new Audio("/sounds/wrong.mp3");
        audio.currentTime = 0;
        audio.play();

        // Trigger efek visual
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 500);

        if (onIncorrectRevealWithoutIcon) {
          onIncorrectRevealWithoutIcon();
        }
      }

      return true;
    });
  };

  // Tentukan kelas CSS berdasarkan kondisi
  let classNames = "bg-gray-700 flex items-center justify-between px-4 py-2 rounded-lg shadow cursor-pointer transition-transform duration-300";

  if (showWarning) {
    classNames += " warning-effect";
  } else if (playFirstSurpriseEffect) {
    classNames += " first-surprise-effect";
  } else if (revealed && answer.isSurprise) {
    classNames += " surprise-effect";
  }

  return (
    <div className={classNames} onClick={handleClick}>
      <span className="text-3xl font-bold">{index + 1}</span>

      <div ref={containerRef} className="flex-1 flex justify-center px-4 overflow-hidden">
        <span
          ref={textRef}
          className={`inline-block px-20 text-3xl font-semibold transition-all duration-300 whitespace-nowrap origin-center ${
            revealed && showRevealEffect && !scaledDown ? "reveal-effect" : ""
          }`}
        >
          {revealed ? answer.answer : ""}
        </span>
      </div>

      <span className="text-3xl font-bold flex items-center justify-center w-12 h-12 bg-gray-400 text-blue-900 rounded-md">
        {revealed ? answer.poin || "-" : ""}
      </span>
    </div>
  );
}

export default function Family100Game({ params }: { params: { game_id: string } }) {
  const [game, setGame] = useState<Game | null>(null);
  const gameRef = useRef<Game | null>(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  
  const [activeTab, setActiveTab] = useState<number | string>(1);
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  const [showIncorrect, setShowIncorrect] = useState(false);

  const [wrong, setWrong] = useState(0);
  const wrongRef = useRef(wrong);
  useEffect(() => {
    wrongRef.current = wrong;
  }, [wrong]);

  const [activePlayer, setActivePlayer] = useState("L");
  const activePlayerRef = useRef(activePlayer);
  useEffect(() => {
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);

  const [team1TempScore, setTeam1TempScore] = useState(0);
  const [team2TempScore, setTeam2TempScore] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1TotalScore, setTeam1TotalScore] = useState(0);
  const [team2TotalScore, setTeam2TotalScore] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState<string[]>([]);
  const [finalScores, setFinalScores] = useState<string[]>([]);
  const [tempFinalAnswer, setTempFinalAnswer] = useState("");
  const [tempFinalScore, setTempFinalScore] = useState("");

  const [clickedScores, setClickedScores] = useState<Record<string, boolean>>({});
  const clickedScoresRef = useRef(clickedScores);
  useEffect(() => {
    clickedScoresRef.current = clickedScores;
  }, [clickedScores]);

  // Timer states
  const initialTime1 = 25;
  const initialTime2 = 30;

  const initialTime = 100;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(isVisible);
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);
  
  const [isAnswered, setIsAnswered] = useState(false);

  // Ref untuk audio background
  const bgAudioRef1 = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef2 = useRef<HTMLAudioElement | null>(null);
  
  const { game_id } = use(params);
  
  const totalFinalScore = finalScores.reduce((acc, curr) => acc + Number(curr || 0), 0);

  const isFinalRound = activeTab === 'final';
  const isTimer25 = activeTab === 'timer1';
  const isTimer30 = activeTab === 'timer2';
  const singlePoin = activeTab === 'single';
  const doublePoin = activeTab === 'double';
  const bonusRound = activeTab === 'bonus';
  const isMain = activeTab === 'main';
  const isBlank = activeTab === 'blank';

  const fetchGame = async () => {
    if (game_id) {
      const data = await getGamesById(game_id);
      setGame(data);
    }
  };
  
  const handleKeyPress = (event) => {
    const key = parseInt(event.key, 10);
    if (!isNaN(key)) {
        setCurrentRound(key);
    }
  };

    const gradients = [
    ["from-red-500", "to-yellow-500"],
    ["from-yellow-500", "to-green-500"],
    ["from-green-500", "to-blue-500"],
    ["from-blue-500", "to-purple-500"],
    ["from-purple-500", "to-pink-500"],
    ["from-pink-500", "to-indigo-500"],
    ["from-orange-500", "to-teal-500"],
    ["from-teal-500", "to-rose-500"],
    ["from-rose-500", "to-lime-500"],
    ["from-lime-500", "to-cyan-500"],
    ["from-cyan-500", "to-amber-500"],
    ["from-amber-500", "to-red-500"],
  ];

  const audioRef = useRef(null); // Deklarasi hooks di luar kondisional

  const renderWord = (word, offset = 0) =>
    word.split("").map((letter, index) => {
      const [from, to] = gradients[(index + offset) % gradients.length];
      return (
        <motion.span
          key={index + offset}
          className={`inline-block bg-clip-text text-transparent animate-flicker bg-gradient-to-r ${from} ${to}`}
          initial={{ y: 0, rotate: 0, scale: 1 }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: (index + offset) * 0.1,
          }}
        >
          {letter}
        </motion.span>
      );
    });

  // Gunakan useEffect untuk memutar audio setelah user interaksi
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const playAudio = () => {
        audio.play().catch((e) => {
          console.log("Autoplay blocked:", e);
        });
      };
      window.addEventListener("click", playAudio, { once: true });

      return () => {
        window.removeEventListener("click", playAudio);
      };
    }
  }, []);

  useEffect(() => {
    socket = io(undefined, {
      path: "/api/socket",
    });

    socket.on("handle-incorrect", (data: any) => {
      // const audio = new Audio('/sounds/wrong.mp3');
      // audio.currentTime = 0;
      // audio.play();
      // setShowIncorrect(true);
      // setTimeout(() => setShowIncorrect(false), 3000);
  
      // if (isVisibleRef.current) {
      //   setWrong(wrongRef.current + 1);
      // }

      handleIncorrectReveal();
    });

    socket.on("set-minus-wrong", (data: any) => {
      setWrong(wrongRef.current - 1);
    });

    socket.on("set-plus-wrong", (data: any) => {
      setWrong(wrongRef.current + 1);
    });

    socket.on("set-question-visible", (data: any) => {
      setIsVisible(!isVisibleRef.current);
    });

    socket.on("set-active-player", (activePlayer) => {
      setActivePlayer(activePlayer);
    });

    socket.on("set-active-tab-blank", (data: any) => {
      setActiveTab('blank');
    });

    socket.on("set-active-tab-main-round", (index) => {
      setActiveTab(index);
      setWrong(0);
      setTeam1TotalScore(0);
      setTeam2TotalScore(0);
      setIsVisible(false);
      setIsAnswered(false);

      const playWithDelay = (audioPath, delay) => {
        const audio = new Audio(audioPath);
        audio.currentTime = 0;
        setTimeout(() => {
          audio.play();
        }, delay);
      };

      // Delay kemunculan container (harus sama seperti BASE_DELAY di visual)
      const BASE_DELAY = 1000;         // 0.8 detik
      const STAGGER_TIME = 100;        // 0.08 detik antar AnswerRow

      playWithDelay('/sounds/start.mp3', 0);

      const flipCount = gameRef.current?.rounds[index - 1]?.question?.answers?.length;

      if (flipCount) {
        for (let i = 0; i < flipCount; i++) {
          const delay = BASE_DELAY + i * STAGGER_TIME;
          playWithDelay('/sounds/flip.mp3', delay);
        }
      }
    });

    socket.on("set-active-tab-final", (data: any) => {
      activeTabRef.current = 'final';
      setActiveTab('final');
      handleSound('show-final-answer');
    });

    socket.on("set-active-tab-single", (data: any) => {
      setActiveTab('single');
      handleSound('preparation-2');
    });

    socket.on("set-active-tab-double", (data: any) => {
      setActiveTab('double');
      handleSound('preparation-2');
    });

    socket.on("set-active-tab-bonus", (data: any) => {
      setActiveTab('bonus');
      handleSound('preparation-2');
    });

    socket.on("set-active-tab-main", (data: any) => {
      setActiveTab('main');
    });

    socket.on("set-active-tab-timer1", (data: any) => {
      handleSound("timer")
      setActiveTab('timer1');
      setTimeLeft(initialTime1);
      setIsRunning(false);
    });

    socket.on("set-active-tab-timer2", (data: any) => {
      handleSound("timer")
      setActiveTab('timer2');
      setTimeLeft(initialTime2);
      setIsRunning(false);
    });

    socket.on("set-start-timer", (data: any) => {
      if (bgAudioRef1.current) {
        bgAudioRef1.current.currentTime = 0;
        bgAudioRef1.current.play();
      }
      if (bgAudioRef2.current) {
        bgAudioRef2.current.currentTime = 0;
        bgAudioRef2.current.play();
      }
      setIsRunning(true);  
    });

    socket.on("set-stop-timer", (data: any) => {
      setIsRunning(false);
      setTimeLeft(initialTime);
      if (bgAudioRef1.current) {
        bgAudioRef1.current.pause();
        bgAudioRef1.current.currentTime = 0;
      }
      if (bgAudioRef2.current) {
        bgAudioRef2.current.pause();
        bgAudioRef2.current.currentTime = 0;
      }  
    });
    
    socket.on("set-same-answer", (data: any) => {
      const audio = new Audio('/sounds/buzzer.mp3');
      audio.currentTime = 0;
      audio.play();
    });

    socket.on("set-score", (data: any) => {
      const { team1TempScoreSO, team2TempScoreSO } = data;

      const audio = new Audio('/sounds/correct.mp3');
      audio.currentTime = 0;
      audio.play();
  
      setTeam1Score(team1TempScoreSO);
      setTeam2Score(team2TempScoreSO);
    });

    socket.on("set-final-answer", (data: any) => {
      const finalAnswerIndexSO = data.answerIndex - 1;
      const tempFinalAnswerSO = data.tempFinalAnswer;

      if (activeTabRef.current === 'final') {
        setFinalAnswers((prev) => {
            console.log("Current tempFinalAnswerSO:", tempFinalAnswerSO);
            const updatedAnswers = [...prev];
            updatedAnswers[finalAnswerIndexSO] = tempFinalAnswerSO;
            console.log(data);
            console.log(finalAnswerIndexSO);
            console.log(tempFinalAnswerSO);
            return updatedAnswers;

        });

        setTimeout(() => setTempFinalAnswer(""), 0);
      }

      const audio = new Audio('/sounds/magic.mp3');
      audio.currentTime = 0;
      audio.play();
    });
    
    socket.on("set-final-score", (data: any) => {
      const finalScoreIndexSO = data.scoreIndex - 1;
      const tempFinalScoreSO = data.tempFinalScore;

      if (activeTabRef.current === 'final') {
        setFinalScores((prevScores) => {
            console.log("Current tempFinalScoreSO:", tempFinalScoreSO);
            const updatedScores = [...prevScores];
            updatedScores[finalScoreIndexSO] = tempFinalScoreSO;
            return updatedScores;
        });
      }

      const audio = tempFinalScoreSO != "0" ? new Audio('/sounds/correct.mp3') : new Audio('/sounds/wrong-2.mp3')
      audio.currentTime = 0;
      audio.play();

      setTimeout(() => setTempFinalScore(""), 0);
    });

    socket.on("set-final-top-answer", (data: any) => {
      const { finalTopAnswerIndexSO } = data;

      setClickedScores((prev) => ({
        ...prev,
        [finalTopAnswerIndexSO]: !prev[finalTopAnswerIndexSO],
      }));
  
      const audio = new Audio('/sounds/top-survey.mp3');
      audio.currentTime = 0;
      audio.play();
    });

    socket.on("set-sound-effect", (data: any) => {
      const { music } = data;

      const audio = new Audio(`/sounds/${music}.mp3`);
      audio.currentTime = 0;
      audio.play();
    });

    socket.on("set-sound-special-answer", (data: any) => {
      const audioSiren = new Audio("/sounds/siren.mp3");
      audioSiren.currentTime = 0;
      audioSiren.play();
      
      const audioCashier = new Audio("/sounds/cashier.mp3"); 
      audioCashier.currentTime = 0.2;
      audioCashier.play();
    });

  }, []);

  useEffect(() => {
    fetchGame();
  }, [game_id]);

  useEffect(() => {
    setTempFinalAnswer(tempFinalAnswer);
  }, [tempFinalAnswer]);

  // Setup background audio (hanya sekali)
  useEffect(() => {
    bgAudioRef1.current = new Audio('/sounds/timer-music-2.mp3');
    bgAudioRef1.current.loop = true;
    bgAudioRef1.current.volume = 0.2; // set volume ke 50%

    bgAudioRef2.current = new Audio('/sounds/timer-music-2.mp3');
    bgAudioRef2.current.loop = true;
    bgAudioRef2.current.volume = 0.2; // set volume ke 50%
  }, []);

  // Timer countdown dan kontrol background music
  useEffect(() => {
    if ((activeTab !== 'timer1' && activeTab !== 'timer2') || !isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      // Hentikan kedua musik ketika timer 0
      if (bgAudioRef1.current) {
        bgAudioRef1.current.pause();
        bgAudioRef1.current.currentTime = 0;
      }
      if (bgAudioRef2.current) {
        bgAudioRef2.current.pause();
        bgAudioRef2.current.currentTime = 0;
      }

      const audio = new Audio('/sounds/timeup.mp3');
      audio.currentTime = 0;
      audio.play();
  
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, isRunning, timeLeft]);
  
  useEffect(() => {
    if (isFinalRound) {
        fitText();
    }
  }, [isFinalRound]);

  useEffect(() => {
    if (!isFinalRound) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey) {
        console.log("alt")
        let key = event.key;
  
        if (key >= "0" && key <= "9") {
          if (key === "0") {
            key = "10";
          }
  
          const index = Number(key) - 1;
          handleScoreClick(`finalScore-${index + 1}`);
        }
      }
  
      if (event.ctrlKey) {
        console.log("ctrl");
        let key = event.key;

        if (key >= "0" && key <= "9") {
            event.preventDefault();
            
            if (key === "0") key = "10";
            const index = Number(key) - 1;
            applyFinalAnswerIndex(index);
        }
      } 

      if (event.shiftKey) {
        console.log("shift");
        let key = event.key;
    
        // Map keyCode untuk Shift+0-9 ke angka
        const shiftKeyMap = {
            '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0'
        };
    
        // Jika key adalah simbol Shift + 0-9, ubah ke angka yang sesuai
        if (shiftKeyMap[key]) {
            key = shiftKeyMap[key];
        }
    
        // Pastikan key adalah angka antara 0-9
        if (key >= "0" && key <= "9") {
            console.log("rerer");
    
            if (key === "0") {
                key = "10"; // Kalau key adalah "0", set menjadi "10"
            }
    
            const index = Number(key) - 1;
            applyFinalScoreIndex(index);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
        window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFinalRound, tempFinalAnswer, tempFinalScore]);

  // Fungsi untuk start timer dan mainkan musik
  const handleStart = () => {
    if (bgAudioRef1.current) {
      bgAudioRef1.current.currentTime = 0;
      bgAudioRef1.current.play();
    }
    if (bgAudioRef2.current) {
      bgAudioRef2.current.currentTime = 0;
      bgAudioRef2.current.play();
    }
    setIsRunning(true);
  };

  // Fungsi reset timer dan musik
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    if (bgAudioRef1.current) {
      bgAudioRef1.current.pause();
      bgAudioRef1.current.currentTime = 0;
    }
    if (bgAudioRef2.current) {
      bgAudioRef2.current.pause();
      bgAudioRef2.current.currentTime = 0;
    }
  };
  
  const handleScoreClick = (id: string) => {
    setClickedScores((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    const audio = new Audio('/sounds/top-survey-2.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const getScoreClass = (id: string) =>
    `text-3xl font-bold flex items-center justify-center w-12 h-12 ${
      clickedScores[id]
        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 shadow-lg animate-pulse'
        : 'bg-white text-blue-900'
    } rounded-md transition-all duration-300 ease-in-out`;
  
  const handleSameAnswer = () => {
    const audio = new Audio('/sounds/buzzer.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const applyScore = () => {
    const audio = new Audio('/sounds/correct.mp3');
    audio.currentTime = 0;
    audio.play();

    setTeam1Score(team1TempScore);
    setTeam2Score(team2TempScore);
  };

  const applyFinalAnswer = () => {
    if (isFinalRound) {
      setFinalAnswers((prev) => [...prev, tempFinalAnswer]);
      setTempFinalAnswer("");
    }
    const audio = new Audio('/sounds/magic.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const applyFinalScore = () => {
    if (isFinalRound) {
      setFinalScores((prev) => [...prev, tempFinalScore]);
    }
    const audio = tempFinalScore != "0" ? new Audio('/sounds/correct.mp3') : new Audio('/sounds/wrong.mp3')
    audio.currentTime = 0;
    audio.play();

    setTempFinalScore("");
  };

  const applyFinalAnswerIndex = (index: number) => {
    console.log(index);
    console.log("Before updating:", tempFinalAnswer);

    if (isFinalRound) {
        setFinalAnswers((prev) => {
            console.log("Current tempFinalAnswer:", tempFinalAnswer);
            const updatedAnswers = [...prev];
            updatedAnswers[index] = tempFinalAnswer; // Update berdasarkan index
            return updatedAnswers;
        });

        // Tunggu sampai finalAnswers diperbarui, baru reset tempFinalAnswer
        setTimeout(() => setTempFinalAnswer(""), 0);
    }

    const audio = new Audio('/sounds/magic.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const applyFinalScoreIndex = (index: number) => {
    console.log("Before updating scores:", tempFinalScore);

    if (isFinalRound) {
        setFinalScores((prevScores) => {
            console.log("Current tempFinalScore:", tempFinalScore);
            const updatedScores = [...prevScores];
            updatedScores[index] = tempFinalScore; // Update the score based on index
            return updatedScores;
        });
    }

    const audio = tempFinalScore != "0" ? new Audio('/sounds/correct.mp3') : new Audio('/sounds/incorrect.mp3')
    audio.currentTime = 0;
    audio.play();

    // Reset tempFinalScore after updating finalScores
    setTimeout(() => setTempFinalScore(""), 0);
  };

  const onScoreChange = (score: number): void => {
    console.log(wrong);
    if (wrongRef.current < 3) {
      if (team1TempScore) {
        setTeam1TotalScore((prevScore: number) => prevScore + score);
      } else {
        setTeam2TotalScore((prevScore: number) => prevScore + score);
      }
    }
  };

  const handleSound = (music: string) => {
    const audio = new Audio(`/sounds/${music}.mp3`);
    audio.currentTime = 0;
    audio.play();
  }

  const handleSpecialAnswer = () => {
    const audioSiren = new Audio("/sounds/siren.mp3");
    audioSiren.currentTime = 0;
    audioSiren.play();
    
    const audioCashier = new Audio("/sounds/cashier.mp3"); 
    audioCashier.currentTime = 0.2;
    audioCashier.play();
  }

  const handleIncorrectReveal = () => {
    const audio = new Audio('/sounds/wrong.mp3');
    audio.currentTime = 0;
    audio.play();

    setShowIncorrect(true);
    setTimeout(() => setShowIncorrect(false), 3000);

    if (isVisibleRef.current) {
      setWrong(wrongRef.current + 1);
    }
  };
  
  const handleIncorrectRevealWithoutIcon = () => {
    const audio = new Audio('/sounds/wrong.mp3');
    audio.currentTime = 0;
    audio.play();

    // setShowIncorrect(true);
    // setTimeout(() => setShowIncorrect(false), 3000);

    if (isVisibleRef.current) {
      setWrong(wrongRef.current + 1);
    }
  };

  // 1️⃣ Ref untuk container dan teks
  const answerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isScaled, setIsScaled] = useState<boolean[]>(Array(10).fill(false));

  // 2️⃣ Fungsi fit text seperti sebelumnya
  const fitText = () => {
    const newScaled = [...isScaled]; // clone
    for (let i = 0; i < 10; i++) {
      const container = containerRefs.current[i];
      const text = answerRefs.current[i];
      if (!container || !text) continue;

      const scale = Math.min(1, container.clientWidth / text.scrollWidth);
      text.style.transform = `scaleX(${scale})`;
      text.style.transformOrigin = "center";
      newScaled[i] = scale < 0.999;
    }
    setIsScaled(newScaled); // update state
  };

  // 3️⃣ Jalankan saat finalAnswers berubah atau window resize
  useEffect(() => {
    fitText();
    window.addEventListener("resize", fitText);
    return () => window.removeEventListener("resize", fitText);
  }, [finalAnswers]);

  if (!game) return <div>Loading...</div>;

  const currentRound = !isFinalRound && !isTimer25 && !isTimer30 && game.rounds[Number(activeTab) - 1];

  let content;

  if (isFinalRound) {

    content = (
      <motion.div
        id="game-container"
        className="text-3xl relative mx-auto max-w-4xl w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-4 py-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* {showIncorrect && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-red-500 font-bold animate-pulse">
            ❌
          </div>
        )} */}
          <div className="flex gap-4">
            <div className="flex flex-col w-1/2 space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.2 }}
                >
                  <div className="bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-between px-4 py-3 rounded-lg shadow cursor-pointer">
                    {/* Jawaban dengan fitText */}
                    <div
                      ref={(el) => (containerRefs.current[i] = el)}
                      className={`flex-1 flex overflow-hidden ${
                        isScaled[i] ? "justify-center" : "justify-start"
                      }`}
                    >
                      <span
                        ref={(el) => (answerRefs.current[i] = el)}
                        id={`finalAnswer-${i + 1}`}
                        className={`inline-block text-3xl pr-6 font-semibold transition-opacity duration-500 whitespace-nowrap ${
                          finalAnswers[i] ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {finalAnswers[i]}
                      </span>
                    </div>

                    {/* Skor */}
                    <span
                      id={`finalScore-${i + 1}`}
                      className={getScoreClass(`finalScore-${i + 1}`)}
                      onClick={() => handleScoreClick(`finalScore-${i + 1}`)}
                    >
                      {finalScores[i] || ""}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col w-1/2 space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i + 5}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (i + 5) * 0.2 }}
                >
                  <div className="bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-between px-4 py-3 rounded-lg shadow cursor-pointer">
                    {/* Skor */}
                    <span
                      id={`finalScore-${i + 6}`}
                      className={getScoreClass(`finalScore-${i + 6}`)}
                      onClick={() => handleScoreClick(`finalScore-${i + 6}`)}
                    >
                      {finalScores[i + 5] || ""}
                    </span>

                    {/* Jawaban dengan fitText */}
                    <div
                      ref={(el) => (containerRefs.current[i + 5] = el)}
                      className={`flex-1 flex overflow-hidden ${
                        isScaled[i + 5] ? "justify-center" : "justify-end"
                      }`}
                    >
                      <span
                        ref={(el) => (answerRefs.current[i + 5] = el)}
                        id={`finalAnswer-${i + 6}`}
                        className={`inline-block text-3xl pl-6 font-semibold transition-opacity duration-500 whitespace-nowrap ${
                          finalAnswers[i + 5] ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {finalAnswers[i + 5]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        <div className="text-center mb-6">
          <span className="inline-block text-4xl text-gray-900 font-semibold bg-white rounded-md px-4 py-2 mt-8">
            {totalFinalScore}
          </span>
        </div>
      </motion.div>
    );
  } else if (isTimer25 || isTimer30) {
    content = (
      <motion.div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center p-4 rounded-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="m-0 text-[25rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          {timeLeft}
        </h1>
      </motion.div>
    );
  } else if (singlePoin) {
    content = (
      <motion.div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center
                  rounded-3xl overflow-hidden
                  bg-gray-800"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="shine-text m-0 text-[10rem] font-bold
                      text-transparent bg-clip-text
                      bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          SINGLE POIN
        </h1>
      </motion.div>
);
  } else if (doublePoin) {
    content = (
      <motion.div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center
                  rounded-3xl overflow-hidden
                  bg-gray-800"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="shine-text m-0 text-[10rem] font-bold
                      text-transparent bg-clip-text
                      bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          DOUBLE POIN
        </h1>
      </motion.div>
    );
  } else if (bonusRound) {

    content = (
      <motion.div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center
                  rounded-3xl overflow-hidden
                  bg-gray-800"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="shine-text m-0 text-[10rem] font-bold
                      text-transparent bg-clip-text
                      bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          BONUS ROUND
        </h1>
      </motion.div>
    );
  } else if (isMain) {
    content = (
      <>
        <motion.div
          id="game-container"
          className="relative mx-auto max-w-5xl w-full text-center p-6 rounded-xl"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="flex justify-center flex-wrap">
            <h1 className="text-[10rem] font-extrabold leading-none">
              {renderWord("FAMILY")}
            </h1>
          </div>
          <div className="flex justify-center flex-wrap mt-[-1rem]">
            <h1 className="text-[10rem] font-extrabold leading-none">
              {renderWord("FORTUNES", 6)}
            </h1>
          </div>
        </motion.div>

        <audio ref={audioRef} src="/sounds/funny-music.mp3" preload="auto" autoPlay loop />
      </>
    );
  } else if (isBlank) {
    content = (
      <div>

      </div>
    );
  } else if (currentRound) {
    const BASE_DELAY   = 1;   // jeda 0,8 detik setelah container muncul
    const STAGGER_TIME = 0.1;  // jeda antar-AnswerRow jadi lebih cepat

    content = (
      // <motion.div
        // initial={{ opacity: 0, y: 30, scale: 0.95 }}
        // animate={{ opacity: 1, y: 0, scale: 1 }}
        // transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        // className="bg-gradient-to-br from-white via-gray-100 to-blue-50 text-gray-900 p-5 rounded-2xl shadow-2xl border border-blue-200 transform hover:scale-[1.02] transition-transform duration-300"
      // >
<motion.div
  id="text-3xl game-container"
  className="relative mx-auto max-w-3xl w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-4 rounded-lg shadow-lg"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.0, ease: "easeOut" }}
>
  <div className="absolute left-0 transform -translate-x-[200%]">
    <div className="bg-gradient-to-r from-gray-600 to-gray-500 p-4 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Score Tim 1</h2>
      <p className="text-3xl font-extrabold text-white">{team1Score}</p>
    </div>
  </div>
  <div className="absolute right-0 transform translate-x-[200%]">
    <div className="bg-gradient-to-r from-gray-600 to-gray-500 p-4 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Score Tim 2</h2>
      <p className="text-3xl font-extrabold text-white">{team2Score}</p>
    </div>
  </div>
  <div className="absolute left-0 transform -translate-x-[100%]">
    {((wrong > 0 && activePlayer == "L") || wrong > 3) && (
      <div className="absolute top-40 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 1 && activePlayer == "L" && (
      <div className="absolute top-60 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 2 && activePlayer == "L" && (
      <div className="absolute top-80 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
  </div>
  <div className="absolute right-0 transform translate-x-[100%]">
    {((wrong > 0 && activePlayer != "L") || wrong > 3) && (
      <div className="absolute top-40 left-2 transform translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 1 && activePlayer != "L" && (
      <div className="absolute top-60 left-2 transform translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 2 && activePlayer != "L" && (
      <div className="absolute top-80 left-2 transform translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
  </div>
  {showIncorrect && (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-red-500 font-bold animate-pulse z-50">
      ❌
    </div>
  )}
  <div className="w-full flex justify-center">
    <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-400 to-gray-300 text-blue-900 inline-block px-4 py-4 mb-4 rounded-lg">
      {team1TotalScore + team2TotalScore}
    </h1>
  </div>
  <div className="text-center mb-6">
    {isVisible && (
      <h2 className="text-3xl font-semibold mt-2">
        {currentRound.question.question}
      </h2>
    )}
  </div>
  <div className="space-y-2">
    {currentRound.question.answers.map((answer, index) => (
      <motion.div
        key={answer.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,                     // lebih singkat
          delay: BASE_DELAY + index * STAGGER_TIME
        }}
      >
        <AnswerRow
          answer={answer}
          index={index}
          multiplier={currentRound.type === 'DOUBLE' ? 2 : 1}
          onScoreChange={onScoreChange}
          onIncorrectReveal={handleIncorrectReveal}
          onIncorrectRevealWithoutIcon={handleIncorrectRevealWithoutIcon}
        />
      </motion.div>
    ))}
  </div>
</motion.div>

    );
  } else {
    content = (
      <div id="game-container" className="relative ml-56 max-w-3xl w-full bg-blue-800 text-white p-4 rounded-xl shadow-lg">
        <div className="flex justify-center my-48">
          <div className="flex items-center justify-center bg-gray-400 rounded-full w-48 h-48">
            <h1 className="m-0 text-9xl font-bold text-blue-800">20</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="relative bg-cover bg-center min-h-screen flex items-center justify-center uppercase"
  style={{
    backgroundImage: "url('/background/black.webp')",
    backgroundSize: "100%",
    backgroundRepeat: "repeat",
    backgroundPosition: "center",
    imageRendering: "auto",
    fontFamily: '"Michroma", sans-serif'
  }}
>

  {content}
</div>
  );
}