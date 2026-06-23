
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, MessageSquare, Trophy, Send, Pencil, SkipForward, ArrowLeft, Menu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    { user: "Sistema", text: "¡Bienvenidos al Estudio!", isSystem: true }
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

  useEffect(() => {
    if (isGameOver || !isUserTurn) return;
    const botGuessInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        const randomBot = players.filter(p => !p.isUser)[Math.floor(Math.random() * (players.length - 1))];
        if (!randomBot) return;

        const willGuessCorrect = Math.random() > 0.9;
        const text = willGuessCorrect ? secretWord : WORDS[Math.floor(Math.random() * WORDS.length)];
        
        if (willGuessCorrect) {
          addMessage(randomBot.name, "¡LO TENGO!", false, true);
          setPlayers(prev => prev.map(p => p.id === randomBot.id ? { ...p, score: p.score + 100 } : p));
        } else {
          addMessage(randomBot.name, text);
        }
      }
    }, 10000);
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

  const PlayersList = () => (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 opacity-40" />
        <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Estudio</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-2">
          {sortedPlayers.map((player) => (
            <div 
              key={player.id} 
              className={`relative p-3 rounded-2xl transition-all duration-500 ${
                activePlayer.id === player.id 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105 z-10' 
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/50/50`} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black tracking-tight truncate uppercase">{player.name}</p>
                  <p className="text-[10px] font-mono opacity-60">{player.score} PTS</p>
                </div>
              </div>
              {activePlayer.id === player.id && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 bg-yellow-400 p-1 rounded-full border-2 border-background">
                  <Pencil className="w-2 h-2 text-black" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen w-full studio-grid flex flex-col items-center justify-start overflow-hidden fixed inset-0">
      
      {/* Top Navigation / Stats */}
      <header className="w-full max-w-[1600px] p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBackToMenu} className="rounded-xl px-3 hover:bg-destructive/10 hover:text-destructive hidden sm:flex">
            <ArrowLeft className="w-4 h-4 mr-2" /> Menú
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl bg-background/50 backdrop-blur-md">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6 glass-panel border-none">
              <PlayersList />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-2">
           <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 sm:gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ronda</span>
             <span className="font-mono font-black text-sm sm:text-xl">{currentRound}/{maxRounds}</span>
           </div>
           <div className="bg-background/50 glass-panel px-4 py-2 rounded-xl flex items-center gap-2 sm:gap-4">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tiempo</span>
             <span className={`font-mono font-black text-sm sm:text-xl ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                {timeLeft}s
             </span>
           </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1600px] grid grid-cols-12 gap-4 p-4 pt-0 overflow-hidden relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex lg:col-span-2 glass-panel rounded-[2rem] p-6 overflow-hidden">
          <PlayersList />
        </aside>

        {/* Canvas Area (Center) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex-1 glass-panel rounded-[2rem] overflow-hidden relative group bg-white/40 flex flex-col">
            
            {/* Word Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-background/80 backdrop-blur-xl px-6 py-3 rounded-full border shadow-xl flex flex-col items-center min-w-[180px]">
                {isUserTurn ? (
                  <>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Dibuja</span>
                    <span className="text-lg font-black tracking-tighter text-primary uppercase">{secretWord}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Adivina</span>
                    <div className="flex gap-1.5 mt-1">
                       {secretWord.split('').map((_, i) => (
                         <div key={i} className="w-3 h-1 bg-primary/20 rounded-full" />
                       ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actual Canvas */}
            <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-10 relative overflow-hidden">
              <div className="w-full max-w-full h-full max-h-full aspect-[4/3] flex items-center justify-center">
                 <DoodleCanvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  strokeColor="#000000"
                  lineWidth={6}
                  tool="pencil"
                />
              </div>
              
              {!isUserTurn && (
                <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] pointer-events-none z-10" />
              )}
            </div>

            {/* Toolbar Overlay */}
            {isUserTurn && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto">
                <DoodleToolbar
                  strokeColor="#000000"
                  onStrokeColorChange={() => {}}
                  lineWidth={6}
                  onLineWidthChange={() => {}}
                  currentTool="pencil"
                  onToolChange={() => {}}
                  onClearCanvas={() => canvasRef.current?.clearCanvas()}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar (Chat) */}
        <aside className="col-span-12 lg:col-span-3 glass-panel rounded-[2rem] p-6 flex flex-col overflow-hidden max-h-[30vh] lg:max-h-full">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 opacity-40" />
            <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Feed Directo</span>
          </div>
          
          <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
            <div className="space-y-2 pb-2">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.isSystem ? 'items-center py-1' : ''}`}
                >
                  {!msg.isSystem && (
                    <span className={`text-[8px] font-black uppercase tracking-wider mb-0.5 ml-1 ${msg.user === 'Tú' ? 'text-primary' : 'opacity-40'}`}>
                      {msg.user}
                    </span>
                  )}
                  <div className={`px-4 py-2 rounded-xl text-xs transition-all ${
                    msg.isSystem 
                      ? 'text-[8px] opacity-40 font-bold uppercase tracking-widest' 
                      : msg.isCorrect 
                        ? 'bg-green-500 text-white font-bold shadow-md shadow-green-500/20' 
                        : 'bg-muted/40 font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-border/50 flex gap-2">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isUserTurn ? "Dibuja..." : "Adivina..."} 
              disabled={isUserTurn || isGameOver}
              className="rounded-xl border-none bg-muted h-10 font-bold text-xs px-4" 
            />
            <Button type="submit" size="icon" className="rounded-xl shrink-0 h-10 w-10 shadow-lg" disabled={isUserTurn || isGameOver}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </aside>
      </main>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-6 text-center"
          >
            <div className="w-full max-w-lg flex flex-col items-center">
              <Trophy className="w-16 h-16 text-yellow-500 mb-6" />
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">¡Partida Terminada!</h2>
              <div className="w-full space-y-2 mb-8 max-h-[40vh] overflow-auto">
                {sortedPlayers.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between bg-muted/40 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg opacity-40">#{i+1}</span>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://picsum.photos/seed/${p.avatarSeed}/50/50`} />
                      </Avatar>
                      <span className="font-black text-sm uppercase">{p.name}</span>
                    </div>
                    <span className="font-mono font-black">{p.score}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onBackToMenu} size="lg" className="rounded-full px-12 h-14 text-lg font-black uppercase w-full">
                Volver al Inicio
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoodleGame;
