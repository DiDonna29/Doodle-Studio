"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Users, Play, Sparkles, Moon, Sun } from 'lucide-react';

const RANDOM_NAMES = ["Picasso", "VanGogh", "Dali", "Banksy", "Rembrandt", "Kahlo", "Monet", "Warhol", "Michelangelo", "DaVinci"];

interface PlayerConfig {
  id: string;
  name: string;
  avatarSeed: string;
}

interface GameSetupProps {
  onStart: (config: { players: PlayerConfig[]; rounds: number }) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStart, isDarkMode, toggleTheme }) => {
  const [numPlayers, setNumPlayers] = useState(3);
  const [rounds, setRounds] = useState(5);
  const [players, setPlayers] = useState<PlayerConfig[]>(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: `p-${i}`,
      name: i === 0 ? "Tú" : RANDOM_NAMES[i % RANDOM_NAMES.length],
      avatarSeed: Math.random().toString(36).substring(7),
    }))
  );

  const handleRandomizeName = (index: number) => {
    const newPlayers = [...players];
    newPlayers[index].name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    newPlayers[index].avatarSeed = Math.random().toString(36).substring(7);
    setPlayers(newPlayers);
  };

  const handleUpdateName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const activePlayers = players.slice(0, numPlayers);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 studio-grid overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl glass-panel p-10 rounded-[3rem] relative z-10"
      >
        <div className="absolute top-8 right-8 flex gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-12 h-12 bg-background/50 backdrop-blur-md">
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
          </Button>
        </div>

        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
            className="mb-4"
          >
            <Sparkles className="w-16 h-16 text-primary" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Doodle Studio</h1>
          <p className="text-muted-foreground font-medium tracking-wide">EL ESTUDIO DE DIBUJO DEFINITIVO</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Global Config */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Jugadores
                </Label>
                <span className="text-2xl font-mono font-black">{numPlayers}</span>
              </div>
              <Slider 
                min={2} 
                max={5} 
                step={1} 
                value={[numPlayers]} 
                onValueChange={(v) => setNumPlayers(v[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <Label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Rondas
                </Label>
                <span className="text-2xl font-mono font-black">{rounds}</span>
              </div>
              <Slider 
                min={3} 
                max={10} 
                step={1} 
                value={[rounds]} 
                onValueChange={(v) => setRounds(v[0])}
                className="py-4"
              />
            </div>

            <Button 
              onClick={() => onStart({ players: activePlayers, rounds })}
              className="w-full h-20 rounded-[2rem] text-xl font-black uppercase tracking-tighter shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-6 h-6 mr-3 fill-current" /> Comenzar Partida
            </Button>
          </div>

          {/* Right: Players List */}
          <div className="bg-muted/30 rounded-[2.5rem] p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 px-2">Configurar Jugadores</h3>
            <div className="space-y-3">
              {activePlayers.map((player, idx) => (
                <motion.div 
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 bg-background/60 p-3 rounded-2xl border border-border/50 group"
                >
                  <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                    <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/100/100`} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input 
                      value={player.name}
                      onChange={(e) => handleUpdateName(idx, e.target.value)}
                      placeholder="Nombre..."
                      className="h-10 border-none bg-transparent font-bold text-sm focus-visible:ring-0"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRandomizeName(idx)}
                    className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] -z-10" />
    </div>
  );
};

export default GameSetup;