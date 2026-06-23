
"use client";

import type { FC } from 'react';
import React, { useRef, useEffect, useImperativeHandle, useState } from 'react';

export interface CanvasActions {
  clearCanvas: () => void;
  getCanvasDataUrl: () => string;
}

interface DoodleCanvasProps {
  width: number;
  height: number;
  strokeColor: string;
  lineWidth: number;
  tool: 'pencil' | 'eraser';
  canvasBackgroundColor?: string;
}

const DoodleCanvas: FC<React.ForwardRefRenderFunction<CanvasActions, DoodleCanvasProps>> = React.forwardRef<CanvasActions, DoodleCanvasProps>(
  ({ width, height, strokeColor, lineWidth, tool, canvasBackgroundColor = '#FFFFFF' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

    const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      if (!canvasRef.current) return null;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (event instanceof MouseEvent) {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      } else if (event.touches && event.touches.length > 0) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      } else {
        return null;
      }
      return { x, y };
    };
    
    const draw = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !lastPosition) return;

      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === 'eraser' ? canvasBackgroundColor : strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      setLastPosition({ x, y });
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(event.nativeEvent);
      if (!coords) return;
      setIsDrawing(true);
      setLastPosition(coords);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = tool === 'eraser' ? canvasBackgroundColor : strokeColor;
      ctx.fill();
    };

    const handleDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const coords = getCoordinates(event.nativeEvent);
      if (!coords) return;
      draw(coords.x, coords.y);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      setLastPosition(null);
    };
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = canvasBackgroundColor;
      ctx.fillRect(0, 0, width, height);
    }, [width, height, canvasBackgroundColor]);

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = canvasBackgroundColor;
        ctx.fillRect(0, 0, width, height);
      },
      getCanvasDataUrl: () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : '';
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-[1.5rem] shadow-sm cursor-crosshair touch-none bg-white transition-transform active:scale-[1.002]"
        onMouseDown={startDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={handleDrawing}
        onTouchEnd={stopDrawing}
      />
    );
  }
);

DoodleCanvas.displayName = 'DoodleCanvas';
export default DoodleCanvas;
