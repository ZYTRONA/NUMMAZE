import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Anime Quiz Database (NO Naruto content)
const ANIME_QUESTIONS = [
  // One Piece
  { question: "Who is the captain of the Straw Hat Pirates?", answer: "LUFFY", anime: "One Piece", hint: "Rubber boy" },
  { question: "What is the name of Luffy's brother who ate the Flame-Flame Fruit?", answer: "ACE", anime: "One Piece", hint: "Fire Fist" },
  { question: "What is the name of Zoro's three-sword style?", answer: "SANTORYU", anime: "One Piece", hint: "Three swords" },
  { question: "Who is the navigator of the Straw Hat crew?", answer: "NAMI", anime: "One Piece", hint: "Cat burglar" },
  { question: "What is the name of the cook who uses only his legs to fight?", answer: "SANJI", anime: "One Piece", hint: "Black leg" },
  
  // Bleach
  { question: "What is the name of Ichigo's Zanpakuto?", answer: "ZANGETSU", anime: "Bleach", hint: "Slaying moon" },
  { question: "Who is the captain of the 13th Division?", answer: "UKITAKE", anime: "Bleach", hint: "White hair" },
  { question: "What is Rukia's last name?", answer: "KUCHIKI", anime: "Bleach", hint: "Noble family" },
  { question: "What are soul reapers called in Japanese?", answer: "SHINIGAMI", anime: "Bleach", hint: "Death gods" },
  
  // Attack on Titan
  { question: "What is the name of the main protagonist?", answer: "EREN", anime: "Attack on Titan", hint: "Titan shifter" },
  { question: "Who is humanity's strongest soldier?", answer: "LEVI", anime: "Attack on Titan", hint: "Captain" },
  { question: "What is Mikasa's signature item?", answer: "SCARF", anime: "Attack on Titan", hint: "Red cloth" },
  { question: "What are the giant humanoids called?", answer: "TITANS", anime: "Attack on Titan", hint: "Wall breakers" },
  
  // Dragon Ball
  { question: "What is Goku's Saiyan name?", answer: "KAKAROT", anime: "Dragon Ball", hint: "Birth name" },
  { question: "Who is Goku's eternal rival?", answer: "VEGETA", anime: "Dragon Ball", hint: "Prince" },
  { question: "What technique can destroy a planet?", answer: "KAMEHAMEHA", anime: "Dragon Ball", hint: "Turtle wave" },
  { question: "What are the seven magical orbs called?", answer: "DRAGONBALLS", anime: "Dragon Ball", hint: "Grant wishes" },
  
  // My Hero Academia
  { question: "What is Izuku Midoriya's hero name?", answer: "DEKU", anime: "My Hero Academia", hint: "Green hair" },
  { question: "Who is the Symbol of Peace?", answer: "ALLMIGHT", anime: "My Hero Academia", hint: "Number one hero" },
  { question: "What is Bakugo's hero name?", answer: "DYNAMIGHT", anime: "My Hero Academia", hint: "Explosion quirk" },
  { question: "What are superpowers called in this world?", answer: "QUIRKS", anime: "My Hero Academia", hint: "Abilities" },
  
  // Demon Slayer
  { question: "What is Tanjiro's sister's name?", answer: "NEZUKO", anime: "Demon Slayer", hint: "Bamboo mouth" },
  { question: "What breathing style does Tanjiro use?", answer: "WATER", anime: "Demon Slayer", hint: "Fluid movements" },
  { question: "Who is the Thunder Breathing user?", answer: "ZENITSU", anime: "Demon Slayer", hint: "Yellow hair" },
  { question: "What is the demon king's name?", answer: "MUZAN", anime: "Demon Slayer", hint: "First demon" },
  
  // Fullmetal Alchemist
  { question: "What is Edward's brother's name?", answer: "ALPHONSE", anime: "Fullmetal Alchemist", hint: "Armor body" },
  { question: "What is the forbidden transmutation?", answer: "HUMAN", anime: "Fullmetal Alchemist", hint: "Taboo" },
  { question: "What is Roy Mustang's title?", answer: "FLAME", anime: "Fullmetal Alchemist", hint: "Fire alchemy" },
  
  // Death Note
  { question: "What is Light's Shinigami name?", answer: "RYUK", anime: "Death Note", hint: "Loves apples" },
  { question: "Who is the world's greatest detective?", answer: "L", anime: "Death Note", hint: "One letter" },
  { question: "What color is the Death Note?", answer: "BLACK", anime: "Death Note", hint: "Dark book" },
  
  // Sword Art Online
  { question: "What is Kirito's real name?", answer: "KAZUTO", anime: "Sword Art Online", hint: "IRL name" },
  { question: "What is Asuna's nickname?", answer: "FLASH", anime: "Sword Art Online", hint: "Lightning fast" },
  { question: "What weapon does Kirito use?", answer: "SWORD", anime: "Sword Art Online", hint: "Blade" },
  
  // Hunter x Hunter
  { question: "What is Gon's father's name?", answer: "GING", anime: "Hunter x Hunter", hint: "Missing dad" },
  { question: "What is Killua's special ability?", answer: "LIGHTNING", anime: "Hunter x Hunter", hint: "Electric" },
  { question: "What is Kurapika hunting?", answer: "SPIDERS", anime: "Hunter x Hunter", hint: "Phantom Troupe" },
  
  // Tokyo Ghoul
  { question: "What is Kaneki's hair color after torture?", answer: "WHITE", anime: "Tokyo Ghoul", hint: "Changed color" },
  { question: "What do ghouls eat?", answer: "HUMANS", anime: "Tokyo Ghoul", hint: "Flesh" },
  
  // Jujutsu Kaisen
  { question: "What is Yuji's cursed energy source?", answer: "SUKUNA", anime: "Jujutsu Kaisen", hint: "King of Curses" },
  { question: "What is Gojo's eye power called?", answer: "SIXEYES", anime: "Jujutsu Kaisen", hint: "Blue eyes" },
  { question: "What is Megumi's technique?", answer: "SHADOWS", anime: "Jujutsu Kaisen", hint: "Ten shadows" }
];

const GameWordle = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0, maxStreak: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pointMultiplier, setPointMultiplier] = useState(1.0);
  const [skippedQuestions, setSkippedQuestions] = useState(0);

  const startNewGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch AI-generated question
      const response = await axios.get('/api/quiz/generate');
      const question = response.data;
      
      setCurrentQuestion(question);
      setGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      setWon(false);
      setShowHint(false);
      setLoading(false);
    } catch (err) {
      console.error('Failed to generate question:', err);
      
      // Fallback to static questions if AI fails
      const fallbackQuestions = ANIME_QUESTIONS;
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      
      setCurrentQuestion(randomQuestion);
      setGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      setWon(false);
      setShowHint(false);
      setLoading(false);
      
      // Show error notification
      setError('Using offline questions (AI service unavailable)');
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  const handleSkip = () => {
    setSkippedQuestions(prev => prev + 1);
    setPointMultiplier(prev => Math.max(0.5, prev - 0.1)); // Reduce multiplier by 10%, min 50%
    setGameOver(false);
    setWon(false);
    startNewGame();
  };

  useEffect(() => {
    const saved = localStorage.getItem('animeQuizStats');
    if (saved) setStats(JSON.parse(saved));
    startNewGame();
  }, [startNewGame]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-quantum-primary mx-auto mb-4"></div>
          <p className="text-quantum-primary text-lg">AI is generating a new question...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleSubmit = () => {
    if (!currentQuestion) return;
    if (currentGuess.length !== currentQuestion.answer.length) return;
    
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    if (currentGuess === currentQuestion.answer) {
      setWon(true);
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won + 1,
        streak: stats.streak + 1,
        maxStreak: Math.max(stats.streak + 1, stats.maxStreak)
      };
      setStats(newStats);
      localStorage.setItem('animeQuizStats', JSON.stringify(newStats));
      
      // Reset multiplier on win
      setPointMultiplier(1.0);
      setSkippedQuestions(0);
    } else if (newGuesses.length >= 6) {
      setGameOver(true);
      const newStats = {
        played: stats.played + 1,
        won: stats.won,
        streak: 0,
        maxStreak: stats.maxStreak
      };
      setStats(newStats);
      localStorage.setItem('animeQuizStats', JSON.stringify(newStats));
      
      // Reset multiplier on loss
      setPointMultiplier(1.0);
      setSkippedQuestions(0);
    }
    
    setCurrentGuess('');
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg text-yellow-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-quantum-primary">ANIME QUIZ</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowTutorial(!showTutorial)} className="btn-secondary text-sm py-2 px-3">
              ?
            </button>
            <Link to="/games" className="btn-secondary text-sm py-2 px-4">
              Back to Games
            </Link>
          </div>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="card mb-6 bg-quantum-primary bg-opacity-10 border border-quantum-primary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-quantum-primary">How to Play</h3>
              <button onClick={() => setShowTutorial(false)} className="text-quantum-ghost hover:text-quantum-primary text-2xl">×</button>
            </div>
            <div className="space-y-3 text-sm text-quantum-ghost">
              <p><strong>🎯 Goal:</strong> Answer anime trivia questions correctly!</p>
              <p><strong>📺 Anime:</strong> One Piece, Bleach, Attack on Titan, Dragon Ball, and more!</p>
              <div>
                <strong>🎨 Color Clues:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-green-600 rounded flex items-center justify-center font-bold">L</span>
                    <span>Green = Correct letter, correct position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-yellow-600 rounded flex items-center justify-center font-bold">U</span>
                    <span>Yellow = Correct letter, wrong position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center font-bold">X</span>
                    <span>Gray = Letter not in answer</span>
                  </div>
                </div>
              </div>
              <p><strong>TIP:</strong> Click the hint button if you're stuck!</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-black text-quantum-primary">{stats.played}</div>
            <div className="text-xs text-quantum-ghost">Played</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black text-quantum-secondary">{stats.won}</div>
            <div className="text-xs text-quantum-ghost">Won</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black text-quantum-accent">{stats.streak}</div>
            <div className="text-xs text-quantum-ghost">Streak</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-black text-yellow-500">{stats.maxStreak}</div>
            <div className="text-xs text-quantum-ghost">Max</div>
          </div>
        </div>

        {/* Point Multiplier Warning */}
        {pointMultiplier < 1.0 && (
          <div className="card mb-4 bg-orange-600 bg-opacity-20 border border-orange-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="text-sm font-bold text-orange-400">Point Multiplier: {Math.round(pointMultiplier * 100)}%</div>
                <div className="text-xs text-orange-300">Skipped {skippedQuestions} question(s). Next correct answer gives fewer points.</div>
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="card mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-quantum-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="text-sm text-quantum-accent mb-2">ANIME: {currentQuestion.anime}</div>
              <h2 className="text-xl font-bold text-white">{currentQuestion.question}</h2>
            </div>
            <div className="flex gap-2 ml-4">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="btn-secondary text-xs py-1 px-3"
              >
                HINT
              </button>
              {!gameOver && (
                <button 
                  onClick={handleSkip}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-3 rounded transition-all"
                  title="Skip this question (reduces next question points)"
                >
                  ⏭️ Skip
                </button>
              )}
            </div>
          </div>
          {showHint && (
            <div className="mt-4 p-3 bg-black bg-opacity-30 rounded border border-quantum-accent">
              <span className="text-quantum-accent text-sm">HINT: {currentQuestion.hint}</span>
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div className="card mb-6">
          {!gameOver ? (
            <div>
              <label className="block text-sm font-semibold text-quantum-ghost mb-3">
                Your Answer ({currentQuestion.answer.length} letters)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  maxLength={currentQuestion.answer.length}
                  className="input-field flex-1 text-2xl font-bold text-center uppercase tracking-wider"
                  placeholder="Type your answer..."
                  autoFocus
                />
                <button 
                  onClick={handleSubmit}
                  disabled={currentGuess.length !== currentQuestion.answer.length}
                  className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
              
              {/* Previous Guesses */}
              {guesses.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-sm font-semibold text-quantum-ghost mb-3">
                    Previous Attempts ({guesses.length}/6):
                  </div>
                  <div className="space-y-2">
                    {guesses.map((guess, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                        <span className="text-lg font-bold text-white flex-1">{guess}</span>
                        <div className="flex gap-1">
                          {guess.split('').map((letter, i) => {
                            const isCorrectPos = currentQuestion.answer[i] === letter;
                            const isInWord = currentQuestion.answer.includes(letter);
                            return (
                              <div
                                key={i}
                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                                  isCorrectPos ? 'bg-green-600' : isInWord ? 'bg-yellow-600' : 'bg-gray-700'
                                }`}
                              >
                                {letter}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              {won ? (
                <div>
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-3xl font-black text-green-500 mb-3">Correct!</div>
                  <div className="text-xl text-quantum-ghost mb-2">
                    You got it in <span className="text-quantum-primary font-bold">{guesses.length}</span> {guesses.length === 1 ? 'try' : 'tries'}!
                  </div>
                  <div className="text-2xl font-black text-quantum-accent my-4">{currentQuestion.answer}</div>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">💀</div>
                  <div className="text-3xl font-black text-red-500 mb-3">Game Over</div>
                  <div className="text-quantum-ghost mb-3">The correct answer was:</div>
                  <div className="text-3xl font-black text-quantum-primary mb-2">{currentQuestion.answer}</div>
                  <div className="text-sm text-quantum-accent">From {currentQuestion.anime}</div>
                </div>
              )}
              <button onClick={startNewGame} className="btn-primary mt-6 px-8">
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameWordle;
