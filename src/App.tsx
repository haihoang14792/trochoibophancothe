import React, { useState, useCallback } from 'react';
import { CharacterType, GameLevel } from './types';
import { HeaderBar } from './components/HeaderBar';
import { GameBoard } from './components/GameBoard';
import { StartModal } from './components/StartModal';
import { CelebrationModal } from './components/CelebrationModal';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { soundEngine } from './utils/audio';
import { useFirebase } from './context/FirebaseContext';

export default function App() {
  const { saveGameSession } = useFirebase();
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Random starting character (boy or girl)
  const [character, setCharacter] = useState<CharacterType>(() =>
    Math.random() > 0.5 ? 'boy' : 'girl'
  );

  // Default Level 1: Mức dễ (4 bộ phận: cặp mắt, mũi, miệng, cặp tai)
  const [level, setLevel] = useState<GameLevel>(1);

  // Game flow states
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(true);
  const [resetCounter, setResetCounter] = useState<number>(0);

  // Start game handler
  const handleStartGame = () => {
    setIsGameStarted(true);
    setStartTime(Date.now());
    soundEngine.playTouchPop();
  };

  // Toggle character (Boy <-> Girl)
  const handleToggleCharacter = (target?: CharacterType) => {
    const nextChar = target || (character === 'boy' ? 'girl' : 'boy');
    setCharacter(nextChar);
    setIsGameCompleted(false);
    setResetCounter((c) => c + 1);
    soundEngine.playTouchPop();
  };

  // Level selector (1: Dễ, 2: Khó)
  const handleSelectLevel = (newLevel: GameLevel) => {
    setLevel(newLevel);
    setIsGameCompleted(false);
    setResetCounter((c) => c + 1);
    soundEngine.playTouchPop();
  };

  // Restart / Play Again
  const handleRestart = useCallback(() => {
    setIsGameCompleted(false);
    // Switch to the other character for fresh excitement
    setCharacter((prev) => (prev === 'boy' ? 'girl' : 'boy'));
    setResetCounter((c) => c + 1);
    setStartTime(Date.now());
    soundEngine.playTouchPop();
  }, []);

  // Sound effects toggle
  const handleToggleSfx = () => {
    const nextVal = !isSfxEnabled;
    setIsSfxEnabled(nextVal);
    soundEngine.setSfxEnabled(nextVal);
  };

  // Complete game trigger
  const handleGameComplete = useCallback(() => {
    setIsGameCompleted(true);
    const duration = (Date.now() - startTime) / 1000;
    saveGameSession({
      level,
      character,
      durationSeconds: Math.max(1, duration),
    }).catch((err) => {
      console.warn('Save game session to Firebase warning:', err);
    });

    // Play joyful celebration fanfare melody
    soundEngine.playVictoryMusic();
  }, [startTime, level, character, saveGameSession]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 overflow-hidden font-['Nunito',sans-serif] select-none no-select">
      {/* Decorative Pastel Background Clouds & Sun */}
      <div className="absolute top-4 left-6 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-300 rounded-full blur-md opacity-40 pointer-events-none" />
      <div className="absolute top-20 right-8 w-24 h-12 bg-white rounded-full blur-sm opacity-60 pointer-events-none" />
      <div className="absolute top-36 left-12 w-28 h-12 bg-white rounded-full blur-sm opacity-50 pointer-events-none" />
      <div className="absolute bottom-28 right-16 w-32 h-14 bg-white rounded-full blur-sm opacity-50 pointer-events-none" />

      {/* Top Controls Header */}
      <div className="relative z-10 w-full p-2 sm:p-3">
        <HeaderBar
          character={character}
          onToggleCharacter={() => handleToggleCharacter()}
          level={level}
          onSelectLevel={handleSelectLevel}
          onRestart={handleRestart}
          isMuted={!isSfxEnabled}
          onToggleMute={handleToggleSfx}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Interactive Game Board */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-2">
        <GameBoard
          key={`${character}-${level}-${resetCounter}`}
          character={character}
          level={level}
          onGameComplete={handleGameComplete}
          isGameCompleted={isGameCompleted}
          onReset={handleRestart}
        />
      </main>

      {/* Bottom Educational Footnote */}
      <footer className="relative z-10 py-1.5 px-4 text-center text-amber-800/80 text-xs font-semibold">
        Bé Ghép Khuôn Mặt · Trò chơi nhận biết mắt, mũi, miệng, tai cho trẻ 24–36 tháng tuổi · TinyLearn
      </footer>

      {/* Welcome / Start Modal */}
      <StartModal
        isOpen={!isGameStarted}
        onStart={handleStartGame}
        character={character}
        onSelectCharacter={(c) => setCharacter(c)}
      />

      {/* Victory Celebration Modal */}
      <CelebrationModal
        isOpen={isGameCompleted}
        onPlayAgain={handleRestart}
        characterName={character === 'boy' ? 'Bé Trai' : 'Bé Gái'}
      />

      {/* Teacher Settings Modal */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        character={character}
        onChangeCharacter={(char: CharacterType) => handleToggleCharacter(char)}
        level={level}
        onChangeLevel={handleSelectLevel}
        isSfxEnabled={isSfxEnabled}
        onToggleSfx={handleToggleSfx}
        onRestart={handleRestart}
      />
    </div>
  );
}
