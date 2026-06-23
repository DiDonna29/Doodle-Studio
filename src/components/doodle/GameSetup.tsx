"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Users, Play, Sparkles, Moon, Sun } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 studio-grid fixed inset-0 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl glass-panel p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] relative z-10 flex flex-col gap-8 max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Theme Toggle Button */}
        <div className="absolute top-6 right-6 z-20">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full bg-background/50 backdrop-blur-md hover:scale-110 transition-transform">
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
          </Button>
        </div>

        {/* Title Section */}
        <div className="flex flex-col items-center text-center shrink-0">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="mb-2"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase leading-tight">Doodle Studio</h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Creative Workspace v2.0</p>
        </div>

        {/* Setup Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 overflow-hidden min-h-0">
          {/* Settings Section */}
          <div className="space-y-8 flex flex-col justify-center min-h-0">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Jugadores
                </Label>
                <span className="text-xl font-mono font-black tabular-nums">{numPlayers}</span>
              </div>
              <Slider 
                min={2} 
                max={5} 
                step={1} 
                value={[numPlayers]} 
                onValueChange={(v) => setNumPlayers(v[0])}
                className="py-2"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Rondas
                </Label>
                <span className="text-xl font-mono font-black tabular-nums">{rounds}</span>
              </div>
              <Slider 
                min={3} 
                max={10} 
                step={1} 
                value={[rounds]} 
                onValueChange={(v) => setRounds(v[0])}
                className="py-2"
              />
            </div>

            <Button 
              onClick={() => onStart({ players: activePlayers, rounds })}
              className="w-full h-16 sm:h-20 rounded-3xl text-lg sm:text-xl font-black uppercase tracking-tighter shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
            >
              <Play className="w-5 h-5 mr-3 fill-current" /> Entrar al Estudio
            </Button>
          </div>

          {/* Player List Section */}
          <div className="bg-muted/20 rounded-[2rem] sm:rounded-[3rem] p-6 flex flex-col overflow-hidden min-h-[250px] lg:min-h-0 border border-border/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2 mb-4 shrink-0">Configuración de Artistas</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4 pb-2">
                {activePlayers.map((player, idx) => (
                  <motion.div 
                    key={player.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 bg-background/60 p-3 rounded-2xl border border-border/50 group hover:border-primary/30 transition-colors"
                  >
                    <Avatar className="w-10 h-10 shrink-0 ring-2 ring-primary/20">
                      <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/100/100`} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Input 
                        value={player.name}
                        onChange={(e) => handleUpdateName(idx, e.target.value)}
                        placeholder="Escribe tu nombre..."
                        className="h-8 border-none bg-transparent font-bold text-xs focus-visible:ring-0 px-0 truncate"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRandomizeName(idx)}
                      className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-muted"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </motion.div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

export default GameSetup;
