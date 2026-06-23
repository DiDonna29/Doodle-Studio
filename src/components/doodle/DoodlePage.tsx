
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { analyzeDoodle } from '@/ai/flows/analyze-doodle';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, MessageSquare, Trophy, Sparkles, Send, Pencil } from 'lucide-react';
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

const WORDS = ["Gato", "Casa", "Avión", "Pizza", "Sol", "Computadora", "Guitarra", "Árbol", "Coche", "Libro"];

const DoodlePage: React.FC = () => {
  // Game State
  const [players, setPlayers] = useState<Player[]>([
    { id: 'user', name: "Tú", score: 0, avatarSeed: 'user123', isUser: true },
    { id: 'ai', name: "Gemini AI", score: 150, avatarSeed: 'ai456', isUser: false },
    { id: 'bot', name: "DoodleBot", score: 80, avatarSeed: 'bot789', isUser: false },
  ]);
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [secretWord, setSecretWord] = useState(WORDS[0]);
  const [messages, setMessages] = useState<Message[]>([
    { user: "Sistema", text: "¡Bienvenidos a Doodle AI! El juego comienza pronto.", isSystem: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isGameRunning, setIsGameRunning] = useState(true);

  // Canvas UI State
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(8);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser'>('pencil');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiGuess, setAiGuess] = useState<string | null>(null);
  
  const canvasRef = useRef<CanvasActions>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  const activePlayer = players[activePlayerIndex];
  const isUserTurn = activePlayer.isUser;

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Timer logic
  useEffect(() => {
    if (!isGameRunning) return;

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
  }, [isGameRunning, activePlayerIndex]);

  const handleNextTurn = useCallback(() => {
    canvasRef.current?.clearCanvas();
    setAiGuess(null);
    
    const nextIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextIndex);
    setTimeLeft(60);
    
    const nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setSecretWord(nextWord);

    if (nextIndex === 0) {
      setCurrentRound(prev => prev + 1);
    }

    setMessages(prev => [...prev, {
      user: "Sistema",
      text: `¡Turno de ${players[nextIndex].name}!`,
      isSystem: true
    }]);

    // Bot logic: if it's bot turn, simulate some drawing activity messages
    if (!players[nextIndex].isUser) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          user: players[nextIndex].name,
          text: "Estoy empezando a dibujar algo muy difícil...",
          isSystem: false
        }]);
      }, 2000);
    }
  }, [activePlayerIndex, players]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    const isCorrect = text.toLowerCase() === secretWord.toLowerCase();

    const newMessage: Message = {
      user: "Tú",
      text: isCorrect ? "¡HA ACERTADO LA PALABRA!" : text,
      isSystem: false,
      isCorrect: isCorrect
    };

    setMessages(prev => [...prev, newMessage]);
    setChatInput("");

    if (isCorrect && !isUserTurn) {
      // Award points
      setPlayers(prev => prev.map(p => 
        p.isUser ? { ...p, score: p.score + 50 } : p
      ));
      
      toast({
        title: "¡Excelente!",
        description: `Has acertado: ${secretWord}`,
      });
    }
  };

  const handleAnalyzeDoodle = async () => {
    if (!canvasRef.current) return;
    const imageDataUrl = canvasRef.current.getCanvasDataUrl();
    
    setIsLoadingAi(true);
    try {
      const result = await analyzeDoodle({ doodleDataUri: imageDataUrl });
      setAiGuess(result.guess);
      
      // If AI guesses correctly or close, simulate a message
      setTimeout(() => {
        setMessages(prev => [...prev, {
          user: "Gemini AI",
          text: `¿Es un ${result.guess}?`,
          isSystem: false
        }]);
      }, 500);

    } catch (error) {
      toast({
        title: "System Error",
        description: "AI processing interrupted.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen studio-grid p-6 flex items-center justify-center">
      <div className="w-full max-w-[1400px] h-[85vh] grid grid-cols-12 gap-6">
        
        {/* Left Sidebar: Players */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-2 glass-panel rounded-3xl p-4 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 px-2 py-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm tracking-tight uppercase opacity-60">Players</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${activePlayer.id === player.id ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'hover:bg-muted'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={`https://picsum.photos/seed/${player.avatarSeed}/40/40`} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      {activePlayer.id === player.id && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-primary">
                          <Pencil className="w-2 h-2 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-sm truncate max-w-[80px]">{player.name}</span>
                  </div>
                  <span className="text-xs font-mono opacity-80">{player.score}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto p-4 bg-muted/50 rounded-2xl text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-[10px] uppercase font-bold opacity-40">Leaderboard Position</p>
            <p className="text-lg font-black tracking-tighter">
              #{players.sort((a, b) => b.score - a.score).findIndex(p => p.isUser) + 1}
            </p>
          </div>
        </motion.div>

        {/* Center: Canvas Area */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 glass-panel rounded-[2rem] overflow-hidden relative group"
          >
            {/* Header Info */}
            <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-8 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-10">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md">
                  Ronda {currentRound}/10
                </div>
                {isUserTurn ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-60">Dibuja:</span>
                    <span className="text-lg font-black text-primary tracking-tight uppercase">{secretWord}</span>
                  </div>
                ) : (
                  <h1 className="text-lg font-bold tracking-tight">{activePlayer.name} está dibujando...</h1>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                <span>Tiempo:</span>
                <span className={`font-mono text-xl ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
              </div>
            </div>

            <div className={`w-full h-full flex items-center justify-center p-8 bg-white/50 transition-opacity ${!isUserTurn ? 'opacity-90 pointer-events-none' : ''}`}>
              <DoodleCanvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                strokeColor={strokeColor}
                lineWidth={lineWidth}
                tool={currentTool}
                canvasBackgroundColor="#FFFFFF"
              />
              {!isUserTurn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-background/80 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-2xl flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-bold text-sm">Observando el dibujo de {activePlayer.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Float Toolbar Integration */}
            {isUserTurn && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <DoodleToolbar
                  strokeColor={strokeColor}
                  onStrokeColorChange={setStrokeColor}
                  lineWidth={lineWidth}
                  onLineWidthChange={setLineWidth}
                  currentTool={currentTool}
                  onToolChange={setCurrentTool}
                  onClearCanvas={() => canvasRef.current?.clearCanvas()}
                />
              </div>
            )}

            {/* AI Result Overlay */}
            <AnimatePresence>
              {aiGuess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-foreground px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center gap-1 border-4 border-white"
                >
                  <Sparkles className="w-6 h-6 mb-2" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">IA Dice</p>
                  <p className="text-3xl font-black tracking-tighter capitalize">{aiGuess}</p>
                  <Button variant="link" className="text-primary-foreground/60 text-xs h-auto p-0 mt-2" onClick={() => setAiGuess(null)}>Cerrar</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {isUserTurn && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-4"
            >
              <Button
                onClick={handleAnalyzeDoodle}
                disabled={isLoadingAi}
                size="lg"
                className="rounded-2xl h-14 px-12 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                {isLoadingAi ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 w-5 h-5" />}
                {isLoadingAi ? "La IA está pensando..." : "Enviar a la IA"}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar: Chat / Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-3 glass-panel rounded-3xl p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 px-2 py-1 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm tracking-tight uppercase opacity-60">Game Chat</span>
          </div>
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.isSystem ? 'items-center opacity-50' : ''}`}>
                  {!msg.isSystem && (
                    <span className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ml-1 ${msg.user === 'Tú' ? 'text-primary' : ''}`}>
                      {msg.user}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isSystem 
                      ? 'text-xs italic' 
                      : msg.isCorrect 
                        ? 'bg-green-500 text-white font-bold animate-bounce' 
                        : 'bg-muted/80 font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t flex gap-2">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isUserTurn ? "Tú estás dibujando..." : "Escribe tu respuesta..."} 
              disabled={isUserTurn}
              className="rounded-2xl border-none bg-muted focus-visible:ring-1 focus-visible:ring-primary h-12" 
            />
            <Button type="submit" size="icon" className="rounded-2xl shrink-0 h-12 w-12" disabled={isUserTurn}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default DoodlePage;
