'use client';

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
}

function AnswerRow({ answer, index, multiplier = 1, onScoreChange }: AnswerRowProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
        if (!event.altKey) return; // Hanya lanjut jika tombol Ctrl ditekan

        if (event.key === String(index + 1)) {
            handleClick();
        }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
        window.removeEventListener("keydown", handleKeyPress);
    };
  }, [index]); // Dependency memastikan event listener hanya berjalan sesuai `index`

  const handleClick = () => {
    socket.emit("set-reveal-answer", index);

    setRevealed((prevRevealed) => {
        if (!prevRevealed) {
            const audioFile = answer.isSurprise ? "/sounds/siren.mp3" : index === 0 ? "/sounds/top-survey.mp3" : "/sounds/correct.mp3";
            const audio = new Audio(audioFile);
            audio.currentTime = 0;
            audio.play();
            if(answer.isSurprise) {
              const audio = new Audio("/sounds/cashier.mp3");
              audio.currentTime = 0.2;
              audio.play();
            }
            onScoreChange(answer.poin * multiplier);
        }
        return true; // Pastikan revealed diubah ke true
    });
};

  return (
      <div
          className="bg-gray-700 flex items-center justify-between px-4 py-3 rounded-lg shadow cursor-pointer"
          onClick={handleClick}
      >
          <span className="text-xl font-bold">{index + 1}</span>
          <span className={`text-3xl font-semibold ${!revealed ? 'text-gray-900' : ''}`}>
              {answer.answer}
          </span>
          <span className={`text-xl font-bold flex items-center justify-center w-10 h-10 bg-gray-400 ${!revealed ? 'text-gray-900' : 'text-blue-900'} rounded-full`}>
              {answer.poin}
          </span>
      </div>
  );
}

export default function Family100Game({ params }: { params: { game_id: string } }) {
  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<number | string>(1);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [wrong, setWrong] = useState(0);

  const [activePlayer, setActivePlayer] = useState("L");
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

  // Timer states
  const initialTime1 = 25;
  const initialTime2 = 30;

  const initialTime = 100;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [teamReminder, setTeamReminder] = useState(false);

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
  const isBlank = activeTab === 'blank';
  const isMain = activeTab === 'main';

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

  useEffect(() => {
    socket = io(undefined, {
      path: "/api/socket",
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
    bgAudioRef1.current = new Audio('/sounds/timer-background.mp3');
    bgAudioRef1.current.loop = true;
    bgAudioRef1.current.volume = 0.2; // set volume ke 50%

    bgAudioRef2.current = new Audio('/sounds/timer-music.mp3');
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

    handleStartSO();
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

    handleStopSO();
  };
  
  const handleScoreClick = (id: string) => {
    setClickedScores((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    const audio = new Audio('/sounds/top-survey.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const getScoreClass = (id: string) =>
    `text-xl font-bold flex items-center justify-center w-10 h-10 ${
      clickedScores[id] ? 'bg-gray-400' : 'bg-white'
    } text-blue-900 rounded-full`;

  const handleIncorrectSO = () => {
    const audio = new Audio('/sounds/wrong.mp3');
    audio.currentTime = 0;
    audio.play(); 
    setShowIncorrect(true);
    setTimeout(() => setShowIncorrect(false), 3000);

    console.log(isVisible);
    if (isVisible) {
      setWrong(wrong + 1);
    }

    // console.log(wrong)

    socket.emit("handle-incorrect", null);
  };

  const handleMinusWrongSO = () => {
    setWrong(wrong - 1);

    socket.emit("set-minus-wrong", null);
  }

  const handlePlusWrongSO = () => {
    setWrong(wrong + 1);

    socket.emit("set-plus-wrong", null);
  }

  const setActivePlayerWithRemote = (activePlayer) => {
    setActivePlayer(activePlayer);

    socket.emit("set-active-player", activePlayer);
  }

  const setQuestionVisibleSO = () => {
    socket.emit("set-question-visible", null);
  }

  const setActiveTabBlankSO = () => {
    socket.emit("set-active-tab-blank", null);
  }

  const setActiveTabSO = (index) => {
    socket.emit("set-active-tab-main-round", index);
  }

  const setActiveTabFinalSO = () => {
    socket.emit("set-active-tab-final", null);
  }

  const setActiveTabSingleSO = () => {
    socket.emit("set-active-tab-single", null);
  }

  const setActiveTabDoubleSO = () => {
    socket.emit("set-active-tab-double", null);
  }

  const setActiveTabBonusSO = () => {
    socket.emit("set-active-tab-bonus", null);
  }

  const setActiveTabMainSO = () => {
    socket.emit("set-active-tab-main", null);
  }

  const setActiveTabTimer1SO = () => {
    socket.emit("set-active-tab-timer1", null);
  }

  const setActiveTabTimer2SO = () => {
    socket.emit("set-active-tab-timer2", null);
  }

  const handleStartSO = () => {
    socket.emit("set-start-timer", null);
  }
  
  const handleStopSO = () => {
    socket.emit("set-stop-timer", null);
  }
  
  const handleSameAnswerSO = () => {
    socket.emit("set-same-answer", null);
  }
  
  const setScoreSO = (team1TempScoreSO, team2TempScoreSO) => {
    socket.emit("set-score", { team1TempScoreSO, team2TempScoreSO });
  }
  
  const setFinalAnswerSO = (answerIndex) => {
    socket.emit("set-final-answer", { answerIndex, tempFinalAnswer });
  }

  const setFinalScoreSO = (scoreIndex) => {
    socket.emit("set-final-score", { scoreIndex, tempFinalScore });
  }

  const setFinalTopAnswerSO = (finalTopAnswerIndexSO) => {
    socket.emit("set-final-top-answer", { finalTopAnswerIndexSO });
  }
  
  const setSpecialAnswerSO = () => {
    socket.emit("set-sound-special-answer", null);
  }

  const handleSameAnswer = () => {
    handleSameAnswerSO();

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

    setScoreSO(team1TempScore, team2TempScore);
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
    const audio = tempFinalScore != "0" ? new Audio('/sounds/correct.mp3') : new Audio('/sounds/wrong-2.mp3')
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

    const audio = tempFinalScore != "0" ? new Audio('/sounds/correct.mp3') : new Audio('/sounds/wrong.mp3')
    audio.currentTime = 0;
    audio.play();

    // Reset tempFinalScore after updating finalScores
    setTimeout(() => setTempFinalScore(""), 0);
  };

  const onScoreChange = (score: number): void => {
    console.log(wrong);
    if (wrong < 3) {
      if (team1TempScore) {
        setTeam1TotalScore((prevScore: number) => prevScore + score);
      } else {
        setTeam2TotalScore((prevScore: number) => prevScore + score);
      }
    }
  };

  const handleSound = (music: string) => {
    socket.emit("set-sound-effect", { music });

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

    setSpecialAnswerSO();
  }

  if (!game) return <div>Loading...</div>;

  const currentRound = !isFinalRound && !isTimer25 && !isTimer30 && game.rounds[Number(activeTab) - 1];

  let content;

  if (isFinalRound) {
    content = (
      <div
        id="game-container"
        className="text-3xl mx-auto max-w-3xl w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-4 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {showIncorrect && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-red-500 font-bold animate-pulse">
            ❌
          </div>
        )}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Bonus Round</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.2 }}
              >
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-between px-4 py-3 rounded-lg shadow cursor-pointer">
                  <span
                    id={`finalAnswer-${i + 1}`}
                    className={`text-3xl font-semibold transition-opacity duration-500 ${finalAnswers[i] ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {finalAnswers[i]}
                  </span>
                  <span
                    id={`finalScore-${i + 1}`}
                    className={getScoreClass(`finalScore-${i + 1}`)}
                    onClick={() => {
                      handleScoreClick(`finalScore-${i + 1}`);
                      setFinalTopAnswerSO(`finalScore-${i + 1}`);
                    }}
                  >
                    {finalScores[i] || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-1/2 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i + 5}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i + 5) * 0.2 }}
              >
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-between px-4 py-3 rounded-lg shadow cursor-pointer">
                  <span
                    id={`finalScore-${i + 6}`}
                    className={getScoreClass(`finalScore-${i + 6}`)}
                    onClick={() => {
                      handleScoreClick(`finalScore-${i + 6}`);
                      setFinalTopAnswerSO(`finalScore-${i + 6}`);
                    }}
                  >
                    {finalScores[i + 5] || ''}
                  </span>
                  <span
                    id={`finalAnswer-${i + 6}`}
                    className={`text-3xl font-semibold transition-opacity duration-500 ${finalAnswers[i + 5] ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {finalAnswers[i + 5]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mb-6">
          <span className="inline-block text-xl text-gray-900 font-semibold bg-white rounded-full px-4 py-2 mt-8">
            {totalFinalScore}
          </span>
        </div>
      </div>
    );
  } else if (isTimer25 || isTimer30) {
    content = (
      <div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center p-4 rounded-xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="m-0 text-[25rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          {timeLeft}
        </h1>
      </div>
    );
  } else if (singlePoin) {
    content = (
      <div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center p-4 rounded-xl"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="shine-text m-0 text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          SINGLE POIN
        </h1>
      </div>
);
  } else if (doublePoin) {
    content = (
      <div
        id="game-container"
        className="relative mx-auto max-w-3xl w-full text-center p-4 rounded-xl"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="shine-text m-0 text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-300 to-white">
          DOUBLE POIN
        </h1>
      </div>
    );
  } else if (isBlank) {
    content = (
      <div>

      </div>
    );
  } else if (currentRound) {
    content = (
      // <div
        // initial={{ opacity: 0, y: 30, scale: 0.95 }}
        // animate={{ opacity: 1, y: 0, scale: 1 }}
        // transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        // className="bg-gradient-to-br from-white via-gray-100 to-blue-50 text-gray-900 p-5 rounded-2xl shadow-2xl border border-blue-200 transform hover:scale-[1.02] transition-transform duration-300"
      // >
<div
  id="text-3xl game-container"
  className="max-w-3xl w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white p-4 rounded-lg shadow-lg"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
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
    {wrong > 0 && (
      <div className="absolute top-40 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 1 && (
      <div className="absolute top-60 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
    {wrong > 2 && (
      <div className="absolute top-80 right-2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-red-500 font-bold">
        ❌
      </div>
    )}
  </div>
  {showIncorrect && (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl text-red-500 font-bold animate-pulse">
      ❌
    </div>
  )}
  <div className="w-full flex justify-center">
    <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-400 to-gray-300 text-blue-900 inline-block px-4 py-4 mb-4 rounded-lg">
      {team1TotalScore + team2TotalScore}
    </h1>
  </div>
  <div className="text-center mb-6">
    {/* {isVisible && ( */}
      <h2 className="text-3xl font-semibold mt-2">
        {currentRound.question.question}
      </h2>
    {/* )} */}
  </div>
  <div className="space-y-2">
    {currentRound.question.answers.map((answer, index) => (
      <div
        key={answer.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.2 }}
      >
        <AnswerRow
          answer={answer}
          index={index}
          multiplier={currentRound.type === 'DOUBLE' ? 2 : 1}
          onScoreChange={onScoreChange}
        />
      </div>
    ))}
  </div>
</div>

    );
  } else {
    content = (
      <div id="game-container" className="relative mx-auto max-w-3xl w-full bg-blue-800 text-white p-4 rounded-xl shadow-lg">
        <div className="flex justify-center my-48">
          <div className="flex items-center justify-center bg-gray-400 rounded-full w-48 h-48">
            <h1 className="m-0 text-9xl font-bold text-blue-800">20</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-cover bg-center bg-gray-600 min-h-screen flex items-center justify-center"
      style={{
        // backgroundImage: "url('/background/background-1.gif')",
        // backgroundImage: "url('/background/black.webp')",
        // backgroundSize: "800px 600px",
        // backgroundRepeat: "no-repeat",
        // backgroundPosition: "center"
        fontFamily: '"Michroma", sans-serif'

      }}
    >
      {content}

      <div id="panel" className="w-full controller top-0 left-0 h-full w-200 bg-blue-700 text-white p-4 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-center mb-6">Tabs</h2>
        
        <div className='my-4'>
          <button 
            className="w-full mt-6 py-2 bg-red-500 text-white font-bold rounded-lg"
            onClick={handleIncorrectSO}
            >
            Incorrect ❌
          </button>
          <button 
            className="w-full py-2 bg-red-400 text-white font-bold rounded-lg mt-2"
            onClick={ () => { 
                setIsVisible(true);
                setQuestionVisibleSO();
              }
            }
            >
            Question V
          </button>
          <button
            className={`w-full py-2 text-white font-bold rounded-lg mt-2 ${
              activePlayer === "L" ? "bg-red-500" : "bg-blue-500"
            } ${teamReminder ? "animate-blink" : ""}`}
            onClick={() => {
              setActivePlayerWithRemote(activePlayer === "L" ? "R" : "L");
              setTeamReminder(false);
            }}
          >
            {activePlayer === "L" ? "LEFT" : "RIGHT"}
          </button>

          <div className="mt-2 flex gap-2">
            <button
              className="flex-1 py-2 bg-yellow-500 text-white font-bold rounded-lg"
              onClick={handleMinusWrongSO}
            >
              – Wrong
            </button>

            <button
              className="flex-1 py-2 bg-yellow-600 text-white font-bold rounded-lg"
              onClick={handlePlusWrongSO}
            >
              + Wrong
            </button>
          </div>

        </div>

        <ul className="space-y-4">
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${isBlank ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                setActiveTab('blank');
                setActiveTabBlankSO();
              }}
            >
              Blank
            </button>
          </li>
          {game.rounds.map((round, index) => (
            <li key={round.id}>
              <button
                className={`w-full py-2 text-3xl ${activeTab === index + 1 ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
                onClick={() => {
                  setActiveTab(index + 1);
                  setWrong(0);
                  setTeam1TotalScore(0);
                  setTeam2TotalScore(0);
                  setIsVisible(false);
                  setIsAnswered(false);
                  setTeamReminder(true);

                  const playWithDelay = (audioPath, delay) => {
                    const audio = new Audio(audioPath);
                    audio.currentTime = 0;
                    setTimeout(() => {
                      audio.play();
                    }, delay);
                  };
                  
                  playWithDelay('/sounds/start.mp3', 0);
                  
                  const flipCount = round.question.answers.length;
                  for (let i = 0; i < flipCount; i++) {
                    playWithDelay('/sounds/flip.mp3', (i + 1) * 180);
                  }
                
                  setActiveTabSO(index + 1);
                }}
              >
                <span className='font-semibold'>{`Round ${index + 1}`}</span> ({round.question.answers.length} answers)
              </button>
            </li>
          ))}
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${isFinalRound ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() =>
                {
                  setActiveTabFinalSO();
                  setActiveTab('final');
                  handleSound('show-final-answer');
                }
              } 
            >
              Bonus Round
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${singlePoin ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                setActiveTabSingleSO();
                setActiveTab('single');
                handleSound('preparation-2')
              }}
            >
              SINGLE POINT
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${doublePoin ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                setActiveTabDoubleSO();
                setActiveTab('double');
                handleSound('preparation-2')
              }}
            >
              DOUBLE POINT
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${bonusRound ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                setActiveTabBonusSO();
                setActiveTab('bonus');
                handleSound('preparation-2')
              }}
            >
              BONUS ROUND
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${isTimer25 ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                handleSound("timer")
                setActiveTab('timer1');
                setActiveTabTimer1SO();
                setTimeLeft(initialTime1);
                setIsRunning(false);
              }}
            >
              Timer {initialTime1}
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${isTimer30 ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                handleSound("timer")
                setActiveTab('timer2');
                setActiveTabTimer2SO();
                setTimeLeft(initialTime2);
                setIsRunning(false);
              }}
            >
              Timer {initialTime2}
            </button>
          </li>
          <li>
            <button
              className={`w-full py-2 text-3xl font-semibold ${isMain ? 'bg-gray-400' : 'bg-blue-800'} rounded-lg`}
              onClick={() => {
                setActiveTabMainSO();
                setActiveTab('main');
              }}
            >
              MAIN
            </button>
          </li>
        </ul>

        <label className="block text-3xl mt-6">Timer</label>
        <button 
          className="w-full py-2 bg-green-600 text-white font-bold rounded-lg mt-2"
          onClick={handleStart}
        >
          Start Timer
        </button>
        <button 
          className="w-full py-2 bg-red-600 text-white font-bold rounded-lg mt-2"
          onClick={handleReset}
        >
          Stop Timer
        </button>

        <button 
          className="w-full mt-6 py-2 bg-red-500 text-white font-bold rounded-lg"
          onClick={handleSameAnswer}
        >
          Same Answer
        </button>

        <div className="mt-6">
          <div className="mb-4">
            <label className="block text-3xl">Team 1 Score</label>
            <input
              type="number"
              className="w-full p-2 mt-2 rounded-lg bg-blue-800 text-white"
              value={team1TempScore}
              onChange={(e) => setTeam1TempScore(parseInt(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <label className="block text-3xl">Team 2 Score</label>
            <input
              type="number"
              className="w-full p-2 mt-2 rounded-lg bg-blue-800 text-white"
              value={team2TempScore}
              onChange={(e) => setTeam2TempScore(parseInt(e.target.value))}
            />
          </div>
        </div>
        <button 
          className="w-full py-2 bg-yellow-600 text-white font-bold rounded-lg"
          onClick={applyScore}
        >
          Apply Score
        </button>
        <div className="flex justify-between mt-4 gap-4">
          <button
            className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg"
            onClick={() => {
              setTeam1TempScore(team1Score + team1TotalScore + team2TotalScore)
            }}
          >
            ← POIN
          </button>
          <button
            className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg"
            onClick={() => {
              setTeam2TempScore(team2Score + team1TotalScore + team2TotalScore)
            }}
          >
            POIN →
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <label className="block text-3xl">Final Answer</label>
            <input
              type="text"
              className="w-full p-2 mt-2 rounded-lg bg-blue-800 text-white"
              value={tempFinalAnswer}
              onChange={(e) => setTempFinalAnswer(e.target.value)}
            />
          </div>
        </div>
        {/* <button 
          className="w-full py-2 bg-yellow-600 text-white font-bold rounded-lg"
          onClick={applyFinalAnswer}
        >
          Apply
        </button> */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[...Array(10)].map((_, index) => {
            const number = index + 1;
            return (
              <button
                key={number}
                className="py-2 bg-yellow-600 text-white font-bold rounded-lg"
                onClick={() => {
                  setFinalAnswerSO(number);
                  applyFinalAnswerIndex(number - 1);
                }}
              >
                {number}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <label className="block text-3xl">Final Score</label>
            <input
              type="text"
              className="w-full p-2 mt-2 rounded-lg bg-blue-800 text-white"
              value={tempFinalScore}
              onChange={(e) => setTempFinalScore(e.target.value)}
            />
          </div>
        </div>
        {/* <button 
          className="w-full py-2 bg-yellow-600 text-white font-bold rounded-lg"
          onClick={applyFinalScore}
        >
          Apply
        </button> */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[...Array(10)].map((_, index) => {
            const number = index + 1;
            return (
              <button
                key={number}
                className="py-2 bg-yellow-600 text-white font-bold rounded-lg"
                onClick={() => {
                  setFinalScoreSO(number);
                  applyFinalScoreIndex(number - 1);
                }}
              >
                {number}
              </button>
            );
          })}
        </div>

        <label className="block text-3xl mt-6">Sound Effect</label>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("preparation")}
        >
          Preparation
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("preparation-2")}
        >
          Preparation 2
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("preparation-3")}
        >
          Preparation 3
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("victory")}
          >
          Victory
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("victory-2")}
          >
          Victory 2
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("end")}
        >
          End
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("applause")}
        >
          Applause
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("heartbeat")}
        >
          Heart Beat
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={handleSpecialAnswer}
        >
          Special Answer
        </button>
        <button 
          className="w-full py-2 bg-blue-400 text-white font-bold rounded-lg mt-2"
          onClick={() => handleSound("riser")}
        >
          Risen
        </button>

      </div>
    </div>
  );
}