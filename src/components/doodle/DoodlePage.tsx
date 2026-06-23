
"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { analyzeDoodle } from '@/ai/flows/analyze-doodle';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, MessageSquare, Trophy, Sparkles, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const DoodlePage: React.FC = () => {
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(8);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser'>('pencil');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiGuess, setAiGuess] = useState<string | null>(null);
  
  const canvasRef = useRef<CanvasActions>(null);
  const { toast } = useToast();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  const handleAnalyzeDoodle = async () => {
    if (!canvasRef.current) return;
    const imageDataUrl = canvasRef.current.getCanvasDataUrl();
    
    setIsLoadingAi(true);
    try {
      const result = await analyzeDoodle({ doodleDataUri: imageDataUrl });
      setAiGuess(result.guess);
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
        
        {/* Left Sidebar: Players (Pinturillo style) */}
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
              {[
                { name: "You", score: 120, active: true },
                { name: "Gemini AI", score: 450, active: false },
                { name: "DoodleBot", score: 80, active: false },
              ].map((player, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${player.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={`https://picsum.photos/seed/${i+10}/40/40`} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{player.name}</span>
                  </div>
                  <span className="text-xs font-mono opacity-80">{player.score}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto p-4 bg-muted/50 rounded-2xl text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-[10px] uppercase font-bold opacity-40">Session Rank</p>
            <p className="text-lg font-black tracking-tighter">#2</p>
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
            <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-8 bg-gradient-to-b from-background/50 to-transparent pointer-events-none z-10">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                  Round 4/10
                </div>
                <h1 className="text-lg font-bold tracking-tight">Drawing Canvas</h1>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                <span>Time Left:</span>
                <span className="font-mono text-primary">00:45</span>
              </div>
            </div>

            <div className="w-full h-full flex items-center justify-center p-8 bg-white/50">
              <DoodleCanvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                strokeColor={strokeColor}
                lineWidth={lineWidth}
                tool={currentTool}
                canvasBackgroundColor="#FFFFFF"
              />
            </div>

            {/* Float Toolbar Integration */}
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
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">AI Guess</p>
                  <p className="text-3xl font-black tracking-tighter">{aiGuess}</p>
                  <Button variant="link" className="text-primary-foreground/60 text-xs h-auto p-0 mt-2" onClick={() => setAiGuess(null)}>Close</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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
              {isLoadingAi ? "Scanning Canvas..." : "Submit to AI"}
            </Button>
          </motion.div>
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
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {[
                { user: "Gemini", text: "Is that a cat?", system: false },
                { user: "System", text: "New round started!", system: true },
                { user: "DoodleBot", text: "Looks like a pizza to me.", system: false },
                { user: "AI Assistant", text: "I'm analyzing the curves...", system: false },
              ].map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.system ? 'items-center opacity-50' : ''}`}>
                  {!msg.system && <span className="text-[10px] font-black uppercase tracking-wider mb-0.5 ml-1">{msg.user}</span>}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.system ? 'text-xs italic' : 'bg-muted/80 font-medium'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Input placeholder="Type your guess..." className="rounded-2xl border-none bg-muted focus-visible:ring-1 focus-visible:ring-primary" />
            <Button size="icon" className="rounded-2xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DoodlePage;
