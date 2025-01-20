import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, Trophy, RefreshCw } from 'lucide-react';

const HebrewWordGame = () => {
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, sharing, won
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  
  const encodeWord = (word) => {
    return btoa(word).replace(/=/g, '').split('').reverse().join('');
  };
  
  const decodeWord = (encoded) => {
    try {
      return atob(encoded.split('').reverse().join('') + '==');
    } catch {
      return null;
    }
  };

  const generateGameLink = () => {
    return `${window.location.origin}/hebrew-word-game?game=${encodeWord(secretWord)}`;
  };

  const copyGameLink = async () => {
    await navigator.clipboard.writeText(generateGameLink());
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const checkGuess = (guess) => {
    if (guess.length !== secretWord.length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setMessage('המילה חייבת להיות באותו אורך');
      return null;
    }

    const result = [];
    const secretArr = [...secretWord];
    const guessArr = [...guess];

    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === secretArr[i]) {
        result.push('bull');
        secretArr[i] = null;
        guessArr[i] = null;
      }
    }

    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] !== null) {
        const hitIndex = secretArr.indexOf(guessArr[i]);
        if (hitIndex !== -1) {
          result.push('hit');
          secretArr[hitIndex] = null;
        }
      }
    }

    return result;
  };

  const handleSetWord = () => {
    if (secretWord.length < 3 || secretWord.length > 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setMessage('המילה חייבת להיות באורך 3-5 אותיות');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setGamePhase('sharing');
      setMessage('המילה נשמרה! שתף את המשחק');
      setIsLoading(false);
    }, 500);
  };

  const handleGuess = () => {
    if (!currentGuess) return;
    
    const result = checkGuess(currentGuess);
    if (!result) return;

    setIsLoading(true);
    setTimeout(() => {
      setGuesses([...guesses, { word: currentGuess, result }]);
      setCurrentGuess('');
      setAttempts(attempts + 1);
      setIsLoading(false);

      if (currentGuess === secretWord) {
        setGamePhase('won');
      }
    }, 300);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setSecretWord('');
    setGuesses([]);
    setCurrentGuess('');
    setMessage('');
    setAttempts(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    if (gameParam) {
      const decodedWord = decodeWord(gameParam);
      if (decodedWord) {
        setSecretWord(decodedWord);
        setGamePhase('playing');
      } else {
        setMessage('קישור לא תקין');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className={`w-full max-w-xl mx-auto shadow-lg transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
        <CardContent className="p-6">
          {gamePhase === 'setup' && (
            <div className="space-y-6 transition-opacity duration-300">
              <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">משחק חדש</h2>
              <div className="space-y-3">
                <label className="block text-lg">בחר מילה ({secretWord.length} אותיות):</label>
                <input
                  type="text"
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  className="w-full p-3 border-2 border-indigo-200 rounded-lg text-right focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  dir="rtl"
                />
              </div>
              <button
                onClick={handleSetWord}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : 'התחל משחק'}
              </button>
            </div>
          )}

          {gamePhase === 'sharing' && (
            <div className="space-y-6 transition-opacity duration-300">
              <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">שתף את המשחק</h2>
              <div className="flex flex-col items-center gap-4 p-4 bg-indigo-50 rounded-lg">
                <button
                  onClick={copyGameLink}
                  className="flex items-center gap-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
                >
                  <Copy size={20} />
                  העתק קישור למשחק
                </button>
                {showCopiedMessage && (
                  <div className="text-green-600 animate-fade-in">
                    הקישור הועתק!
                  </div>
                )}
              </div>
            </div>
          )}

          {gamePhase === 'playing' && (
            <div className="space-y-6 transition-opacity duration-300">
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium text-indigo-600">ניסיון {attempts + 1}</div>
                <h2 className="text-2xl font-bold text-indigo-800">נחש את המילה!</h2>
              </div>
              <div className="space-y-4">
                {guesses.map((guess, index) => (
                  <div key={index} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                    <div className="flex gap-2">
                      {guess.result.map((r, i) => (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-full transform transition-all duration-300 ${
                            r === 'bull' 
                              ? 'bg-black animate-scale-in' 
                              : 'bg-white border-2 border-gray-400 animate-scale-in'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="font-bold text-lg">{guess.word}</div>
                  </div>
                ))}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    className="w-full p-3 border-2 border-indigo-200 rounded-lg text-right focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    dir="rtl"
                    maxLength={secretWord.length}
                  />
                  <button
                    onClick={handleGuess}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="animate-spin" /> : 'נחש'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'won' && (
            <div className="space-y-6 text-center animate-fade-in">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
              <h2 className="text-3xl font-bold text-indigo-800">
                כל הכבוד! ניצחת!
              </h2>
              <p className="text-xl text-indigo-600">
                מספר ניסיונות: {attempts}
              </p>
              <button
                onClick={resetGame}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
              >
                משחק חדש
              </button>
            </div>
          )}

          {message && (
            <div className="mt-6 p-3 bg-indigo-100 text-indigo-800 rounded-lg animate-fade-in">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HebrewWordGame;