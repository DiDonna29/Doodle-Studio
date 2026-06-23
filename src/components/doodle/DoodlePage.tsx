"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameSetup from './GameSetup';
import DoodleGame from './DoodleGame';

interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  score: number;
  isUser: boolean;
}

interface GameConfig {
  players: { id: string; name: string; avatarSeed: string }[];
  rounds: number;
}

const DoodlePage: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [config, setConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    // Check local storage or system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleStartGame = (gameConfig: GameConfig) => {
    setConfig(gameConfig);
    setGameState('playing');
  };

  const handleGameOver = () => {
    setGameState('setup');
    setConfig(null);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {gameState === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            <GameSetup 
              onStart={handleStartGame} 
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <DoodleGame 
              players={config?.players.map((p, i) => ({ ...p, score: 0, isUser: i === 0 })) || []}
              maxRounds={config?.rounds || 5}
              onBackToMenu={handleGameOver}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoodlePage;