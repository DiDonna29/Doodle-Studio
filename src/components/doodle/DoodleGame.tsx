"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Trophy, Send, Pencil, ArrowLeft, Menu, Hash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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

  // Simulate bots
  useEffect(() => {
    if (isGameOver || isUserTurn) return;
    
    const botTimer = setTimeout(() => {
      if (Math.random() > 0.4) {
        handleNextTurn();
      }
    }, 15000 + Math.random() * 10000);

    const botGuessInterval = setInterval(() => {
      const bots = players.filter(p => !p.isUser);
      if (bots.length === 0) return;
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      if (Math.random() > 0.85) {
        const willGuessCorrect = Math.random() > 0.9;
        if (willGuessCorrect) {
          addMessage(randomBot.name, "¡LO TENGO!", false, true);
          setPlayers(prev => prev.map(p => p.id === randomBot.id ? { ...p, score: p.score + 100 } : p));
        } else {
          addMessage(randomBot.name, WORDS[Math.floor(Math.random() * WORDS.length)]);
        }
      }
    }, 6000);

    return () => {
      clearTimeout(botTimer);
      clearInterval(botGuessInterval);
    };
  }, [isGameOver, isUserTurn, handleNextTurn, players, addMessage]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isGameOver) return;

    const text = chatInput.trim();
    const isCorrect = text.toLowerCase() === secretWord.toLowerCase();

    if (isCorrect && !isUserTurn) {
      addMessage("Tú", `¡ACERTASTE! Era ${secretWord}`, false, true);
      setPlayers(prev => prev.map(p => p.isUser ? { ...p, score: p.score + 100 } : p));
      toast({ title: "¡Perfecto!", description: "Has ganado 100 puntos." });
      setTimeout(handleNextTurn, 1000);
    } else {
      addMessage("Tú", text);
    }
    
    setChatInput("");
  };

  const PlayersList = () => (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 opacity-40" />
          <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Artistas</span>
        </div>
        <span className="font-mono text-[10px] opacity-40 tabular-nums">{players.length} EN LINEA</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {sortedPlayers.map((player) => (
            <div 
              key={player.id} 
              className={cn(
                "relative p-3 rounded-2xl transition-all duration-300 min-w-0 overflow-hidden group",
                activePlayer.id === player.id 
                  ? 'bg-primary text-primary-foreground shadow-xl scale-[1.02] z-10' 
                  : 'bg-muted/30 hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 shrink-0 border-2 border-background shadow-sm">
                  <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/50/50`} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black tracking-tight truncate uppercase leading-none mb-1">
                    {player.name} {player.isUser && "(Tú)"}
                  </p>
                  <p className="text-[10px] font-mono opacity-70 tabular-nums leading-none">{player.score} PTS</p>
                </div>
              </div>
              {activePlayer.id === player.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 p-1.5 rounded-full border-2 border-background shadow-sm"
                >
                  <Pencil className="w-2.5 h-2.5 text-black" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen w-full studio-grid flex flex-col items-center justify-start overflow-hidden fixed inset-0 bg-background">
      
      {/* Header section with fixed height */}
      <header className="w-full max-w-[1600px] h-20 shrink-0 px-6 flex justify-between items-center z-50 border-b border-border/10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBackToMenu} className="rounded-2xl px-4 hover:bg-destructive/10 hover:text-destructive group hidden sm:flex">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> 
            <span className="font-black text-xs uppercase tracking-tighter">Menú</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden rounded-2xl bg-background shadow-sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6 glass-panel border-none">
              <PlayersList />
            </SheetContent>
          </Sheet>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase tracking-tighter leading-none">Doodle Studio</h1>
            <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Workspace v2.0</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
           <div className="bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-2xl flex items-center gap-4 premium-shadow">
             <Hash className="w-3 h-3 text-primary/40 hidden xs:block" />
             <div className="flex flex-col items-start min-w-[50px]">
               <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Ronda</span>
               <span className="font-mono font-black text-sm sm:text-lg tabular-nums leading-none">{currentRound}/{maxRounds}</span>
             </div>
           </div>
           <div className="bg-background/80 border border-border/50 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-sm">
             <div className="flex flex-col items-end min-w-[50px]">
               <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Tiempo</span>
               <span className={cn(
                  "font-mono font-black text-sm sm:text-lg tabular-nums leading-none transition-colors",
                  timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'
               )}>
                  {timeLeft}s
               </span>
             </div>
           </div>
        </div>
      </header>

      {/* Main Container constrained to remaining height */}
      <main className="flex-1 w-full max-w-[1600px] min-h-0 grid grid-cols-12 gap-6 p-6 pt-6 overflow-hidden relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:flex lg:col-span-2 glass-panel rounded-[2.5rem] p-6 overflow-hidden min-w-0 premium-shadow">
          <PlayersList />
        </aside>

        {/* Canvas Area (Center) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6 relative overflow-hidden min-h-0">
          <div className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden relative group bg-white/5 flex flex-col min-h-0 border-white/20">
            
            {/* Word Indicator Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-auto px-4">
              <motion.div 
                layout
                className="bg-background/90 backdrop-blur-2xl px-8 py-4 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col items-center min-w-[200px] max-w-full overflow-hidden"
              >
                {isUserTurn ? (
                  <>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 shrink-0 mb-1">Tu Palabra</span>
                    <span className="text-base sm:text-xl font-black tracking-tighter text-primary uppercase truncate w-full text-center">{secretWord}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 shrink-0 mb-2">Observando a {activePlayer.name}</span>
                    <div className="flex gap-1.5 justify-center flex-wrap max-w-full">
                       {secretWord.split('').map((_, i) => (
                         <div key={i} className="w-3 sm:w-4 h-1 bg-primary/20 rounded-full" />
                       ))}
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Actual Canvas Container */}
            <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-12 relative overflow-hidden min-h-0">
              <div className="w-full max-w-4xl h-full max-h-[85%] aspect-[4/3] flex items-center justify-center relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-border/20">
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
                <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] pointer-events-none z-10 flex items-center justify-center">
                   <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-background/40 px-6 py-3 rounded-full border border-white/20 backdrop-blur-xl flex items-center gap-3"
                   >
                     <Pencil className="w-4 h-4 text-primary animate-bounce" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">El artista está creando...</span>
                   </motion.div>
                </div>
              )}
            </div>

            {/* Toolbar Overlay */}
            <AnimatePresence>
              {isUserTurn && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-[95%] sm:w-auto px-4"
                >
                  <DoodleToolbar
                    strokeColor="#000000"
                    onStrokeColorChange={() => {}}
                    lineWidth={6}
                    onLineWidthChange={() => {}}
                    currentTool="pencil"
                    onToolChange={() => {}}
                    onClearCanvas={() => canvasRef.current?.clearCanvas()}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Sidebar (Chat) */}
        <aside className="col-span-12 lg:col-span-3 glass-panel rounded-[2.5rem] p-6 flex flex-col overflow-hidden h-[35vh] lg:h-auto min-w-0 premium-shadow">
          <div className="flex items-center justify-between mb-4 shrink-0 px-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 opacity-40" />
              <span className="font-black text-[10px] uppercase tracking-widest opacity-40">Feed del Estudio</span>
            </div>
            {isUserTurn && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextTurn}
                className="h-6 px-3 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary/5 hover:bg-primary/10 text-primary"
              >
                Saltar Turno
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-3 pb-4">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn("flex flex-col min-w-0", msg.isSystem ? 'items-center py-2' : '')}
                >
                  {!msg.isSystem && (
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-wider mb-1 ml-1 truncate",
                      msg.user === 'Tú' ? 'text-primary' : 'opacity-40'
                    )}>
                      {msg.user}
                    </span>
                  )}
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-xs transition-all break-words max-w-full shadow-sm",
                    msg.isSystem 
                      ? 'text-[8px] opacity-30 font-bold uppercase tracking-[0.2em] text-center bg-transparent border-t border-b border-border/10 w-full py-1' 
                      : msg.isCorrect 
                        ? 'bg-green-500 text-white font-black shadow-lg shadow-green-500/30 animate-pulse' 
                        : 'bg-muted/40 font-medium border border-border/20'
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-border/20 flex gap-2 shrink-0">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isUserTurn ? "No puedes hablar..." : "Escribe tu respuesta..."} 
              disabled={isUserTurn || isGameOver}
              className="rounded-2xl border-none bg-muted h-12 font-bold text-xs px-5 flex-1 min-w-0 focus-visible:ring-primary/20" 
            />
            <Button type="submit" size="icon" className="rounded-2xl shrink-0 h-12 w-12 shadow-xl hover:scale-105 active:scale-95 transition-all" disabled={isUserTurn || isGameOver}>
              <Send className="w-5 h-5" />
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
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl flex flex-col items-center min-w-0"
            >
              <div className="relative mb-8">
                <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-2xl" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-yellow-500/20 rounded-full scale-150"
                />
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-2 text-center">¡Exposición Finalizada!</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-12">Cuadro de Honor de Artistas</p>
              
              <div className="w-full space-y-3 mb-10 max-h-[45vh] overflow-y-auto pr-3 custom-scrollbar">
                {sortedPlayers.map((p, i) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={p.id} 
                    className={cn(
                      "flex items-center justify-between p-5 rounded-3xl min-w-0 gap-4 border transition-all",
                      i === 0 ? 'bg-primary/10 border-primary/20 shadow-xl' : 'bg-muted/40 border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-xl font-black opacity-20 shrink-0 w-8">#{i+1}</span>
                      <Avatar className="w-10 h-10 shrink-0 ring-4 ring-background">
                        <AvatarImage src={`https://picsum.photos/seed/${p.avatarSeed}/50/50`} />
                      </Avatar>
                      <span className="font-black text-sm uppercase truncate tracking-tight">{p.name}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[8px] font-black uppercase opacity-40">Puntos</span>
                      <span className="font-mono font-black text-xl tabular-nums leading-none">{p.score}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <Button onClick={onBackToMenu} size="lg" className="rounded-full px-16 h-16 text-lg font-black uppercase tracking-tighter w-full shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Volver al Menú Principal
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoodleGame;