"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, MessageSquare, Trophy, Send, Pencil, SkipForward, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface Player {
  id: string;
  name: string;
  score: number;
  avatarSeed: string;
  isUser: boolean;
}

interface Message {
  user: string;
  text: string;
  isSystem: boolean;
  isCorrect?: boolean;
}

const WORDS = ["Gato", "Casa", "Avión", "Pizza", "Sol", "Computadora", "Guitarra", "Árbol", "Coche", "Libro", "Elefante", "Castillo", "Hamburguesa", "Tren", "Helado", "Luna", "Mar", "Robot", "Tarta", "Vaca"];

interface DoodleGameProps {
  players: Player[];
  maxRounds: number;
  onBackToMenu: () => void;
}

const DoodleGame: React.FC<DoodleGameProps> = ({ players: initialPlayers, maxRounds, onBackToMenu }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [secretWord, setSecretWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [messages, setMessages] = useState<Message[]>([
    { user: "Sistema", text: "¡Bienvenidos al Estudio! El juego ha comenzado.", isSystem: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);

  const canvasRef = useRef<CanvasActions>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activePlayer = players[activePlayerIndex];
  const isUserTurn = activePlayer?.isUser ?? false;

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const addMessage = useCallback((user: string, text: string, isSystem = false, isCorrect = false) => {
    setMessages(prev => [...prev, { user, text, isSystem, isCorrect }]);
  }, []);

  const handleNextTurn = useCallback(() => {
    if (isGameOver) return;
    
    canvasRef.current?.clearCanvas();
    
    setActivePlayerIndex((prev) => {
      const nextIndex = (prev + 1) % players.length;
      
      if (nextIndex === 0) {
        if (currentRound >= maxRounds) {
          setIsGameOver(true);
          addMessage("Sistema", "¡FIN DE LA PARTIDA!", true);
          return prev;
        }
        setCurrentRound(r => r + 1);
      }

      const nextPlayer = players[nextIndex];
      addMessage("Sistema", `Turno de ${nextPlayer.name}`, true);
      
      setSecretWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
      setTimeLeft(60);

      return nextIndex;
    });
  }, [players, currentRound, maxRounds, isGameOver, addMessage]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextTurn();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, handleNextTurn]);

  // Simulated bot guessing logic
  useEffect(() => {
    if (isGameOver || !isUserTurn) return;

    const botGuessInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomBot = players.filter(p => !p.isUser)[Math.floor(Math.random() * (players.length - 1))];
        if (!randomBot) return;

        const willGuessCorrect = Math.random() > 0.8;
        const text = willGuessCorrect ? secretWord : WORDS[Math.floor(Math.random() * WORDS.length)];
        
        if (willGuessCorrect) {
          addMessage(randomBot.name, "¡LO TENGO!", false, true);
          setPlayers(prev => prev.map(p => p.id === randomBot.id ? { ...p, score: p.score + 100 } : p));
        } else {
          addMessage(randomBot.name, text);
        }
      }
    }, 8000);

    return () => clearInterval(botGuessInterval);
  }, [isGameOver, isUserTurn, secretWord, players, addMessage]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isGameOver) return;

    const text = chatInput.trim();
    const isCorrect = text.toLowerCase() === secretWord.toLowerCase();

    if (isCorrect && !isUserTurn) {
      addMessage("Tú", `¡ACERTASTE! Era ${secretWord}`, false, true);
      setPlayers(prev => prev.map(p => p.isUser ? { ...p, score: p.score + 100 } : p));
      toast({ title: "¡Perfecto!", description: "Has ganado 100 puntos." });
      setTimeout(handleNextTurn, 2000);
    } else {
      addMessage("Tú", text);
    }
    
    setChatInput("");
  };

  return (
    <div className="min-h-screen studio-grid p-6 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1500px] h-[88vh] grid grid-cols-12 gap-6 relative">
        
        {/* Header Overlay (Mobile / Floating) */}
        <div className="col-span-12 flex justify-between items-center mb-2 px-4">
           <Button variant="ghost" onClick={onBackToMenu} className="rounded-2xl gap-2 font-bold uppercase tracking-tighter hover:bg-destructive/10 hover:text-destructive">
            <ArrowLeft className="w-4 h-4" /> Salir al Menú
           </Button>
           <div className="flex gap-4">
              <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ronda</span>
                <span className="font-mono font-black text-xl">{currentRound}/{maxRounds}</span>
              </div>
              <div className="bg-background/50 glass-panel px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tiempo</span>
                <span className={`font-mono font-black text-xl ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                   {timeLeft}s
                </span>
              </div>
           </div>
        </div>

        {/* Players Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-2 glass-panel rounded-[2.5rem] p-6 flex flex-col gap-6"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 opacity-40" />
            <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Estudio</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {sortedPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className={`relative p-4 rounded-3xl transition-all duration-500 ${
                    activePlayer.id === player.id 
                      ? 'bg-primary text-primary-foreground shadow-2xl scale-105 z-10' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border-2 border-background">
                      <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/50/50`} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black tracking-tight truncate uppercase">{player.name}</p>
                      <p className="text-[10px] font-mono opacity-60">{player.score} PTS</p>
                    </div>
                  </div>
                  {activePlayer.id === player.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -right-2 top-1/2 -translate-y-1/2 bg-yellow-400 p-1.5 rounded-full border-4 border-background"
                    >
                      <Pencil className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Canvas Area */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 glass-panel rounded-[3rem] overflow-hidden relative group bg-white/40"
          >
            {/* Word Indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-background/80 backdrop-blur-xl px-8 py-4 rounded-full border shadow-2xl flex flex-col items-center">
                {isUserTurn ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Dibuja</span>
                    <span className="text-2xl font-black tracking-tighter text-primary uppercase">{secretWord}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Adivina</span>
                    <div className="flex gap-2">
                       {secretWord.split('').map((_, i) => (
                         <div key={i} className="w-4 h-1 bg-primary/20 rounded-full" />
                       ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="w-full h-full flex items-center justify-center p-12 touch-none">
              <DoodleCanvas
                ref={canvasRef}
                width={800}
                height={550}
                strokeColor="#000000"
                lineWidth={8}
                tool="pencil"
              />
              
              {!isUserTurn && (
                <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] pointer-events-none" />
              )}
            </div>

            {isUserTurn && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                <DoodleToolbar
                  strokeColor="#000000"
                  onStrokeColorChange={() => {}}
                  lineWidth={8}
                  onLineWidthChange={() => {}}
                  currentTool="pencil"
                  onToolChange={() => {}}
                  onClearCanvas={() => canvasRef.current?.clearCanvas()}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Chat / Feedback */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-3 glass-panel rounded-[2.5rem] p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-4 h-4 opacity-40" />
            <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Feed Directo</span>
          </div>
          
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.isSystem ? 'items-center py-2' : ''}`}
                >
                  {!msg.isSystem && (
                    <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ml-1 ${msg.user === 'Tú' ? 'text-primary' : 'opacity-40'}`}>
                      {msg.user}
                    </span>
                  )}
                  <div className={`px-5 py-3 rounded-2xl text-sm transition-all ${
                    msg.isSystem 
                      ? 'text-[10px] opacity-40 font-bold uppercase tracking-widest' 
                      : msg.isCorrect 
                        ? 'bg-green-500 text-white font-bold shadow-xl shadow-green-500/20 scale-[1.02]' 
                        : 'bg-muted/50 font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="mt-6 pt-6 border-t border-border/50 flex gap-3">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isUserTurn ? "Dibuja algo increíble..." : "Escribe tu respuesta..."} 
              disabled={isUserTurn || isGameOver}
              className="rounded-2xl border-none bg-muted h-14 font-bold text-sm px-6" 
            />
            <Button type="submit" size="icon" className="rounded-2xl shrink-0 h-14 w-14 shadow-xl" disabled={isUserTurn || isGameOver}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[100] bg-background/90 backdrop-blur-2xl flex flex-center flex-col items-center justify-center p-12 text-center"
            >
              <Trophy className="w-24 h-24 text-yellow-500 mb-8" />
              <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">¡Partida Terminada!</h2>
              <div className="max-w-md w-full space-y-4 mb-12">
                {sortedPlayers.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between bg-muted/50 p-6 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xl opacity-40">#{i+1}</span>
                      <span className="font-black uppercase">{p.name}</span>
                    </div>
                    <span className="font-mono font-black">{p.score} PTS</span>
                  </div>
                ))}
              </div>
              <Button onClick={onBackToMenu} size="lg" className="rounded-full px-12 h-16 text-xl font-black uppercase">
                Volver al Inicio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DoodleGame;