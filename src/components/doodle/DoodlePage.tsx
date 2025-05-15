"use client";

import type { FC } from 'react';
import React, { useState, useRef } from 'react';
import DoodleCanvas, { type CanvasActions } from './DoodleCanvas';
import DoodleToolbar from './DoodleToolbar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { analyzeDoodle } from '@/ai/flows/analyze-doodle';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DoodlePage: FC = () => {
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser'>('pencil');
  
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiGuess, setAiGuess] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const canvasRef = useRef<CanvasActions>(null);
  const { toast } = useToast();

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 450;
  const CANVAS_BACKGROUND_COLOR = '#FFFFFF';


  const handleAnalyzeDoodle = async () => {
    if (!canvasRef.current) return;

    const imageDataUrl = canvasRef.current.getCanvasDataUrl();
    if (!imageDataUrl || imageDataUrl === `data:,`) { // Check for empty canvas
      toast({
        title: "Empty Canvas",
        description: "Please draw something before analyzing!",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAi(true);
    try {
      const result = await analyzeDoodle({ doodleDataUri: imageDataUrl });
      setAiGuess(result.guess);
      setIsAlertOpen(true);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the doodle. Please try again.",
        variant: "destructive",
      });
      setAiGuess(null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-4xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold tracking-tight">Doodle AI</CardTitle>
          <CardDescription className="text-lg">Draw something and let our AI guess what it is!</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
            <div className="flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-border">
              <DoodleCanvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                strokeColor={strokeColor}
                lineWidth={lineWidth}
                tool={currentTool}
                canvasBackgroundColor={CANVAS_BACKGROUND_COLOR}
              />
            </div>
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
        </CardContent>
        <CardFooter className="flex justify-center p-6 border-t">
          <Button
            onClick={handleAnalyzeDoodle}
            disabled={isLoadingAi}
            size="lg"
            className="px-8 py-6 text-lg transition-transform duration-150 ease-in-out active:scale-95"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Doodle'
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">AI Doodle Guess</AlertDialogTitle>
            <AlertDialogDescription className="text-lg py-4">
              Our AI thinks your doodle is: <strong className="text-primary">{aiGuess || "Hmm, I'm not sure..."}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)} className="px-6">Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoodlePage;
