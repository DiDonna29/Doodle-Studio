
"use client";

import type { FC } from 'react';
import { Pencil, Eraser, RotateCcw, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from 'framer-motion';

interface DoodleToolbarProps {
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  currentTool: 'pencil' | 'eraser';
  onToolChange: (tool: 'pencil' | 'eraser') => void;
  onClearCanvas: () => void;
}

const DoodleToolbar: FC<DoodleToolbarProps> = ({
  strokeColor,
  onStrokeColorChange,
  lineWidth,
  onLineWidthChange,
  currentTool,
  onToolChange,
  onClearCanvas,
}) => {
  const colors = [
    '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
  ];

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-3 p-3 glass-panel rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/20"
    >
      <ToggleGroup 
        type="single" 
        value={currentTool} 
        onValueChange={(value: 'pencil' | 'eraser') => value && onToolChange(value)}
        className="bg-muted p-1 rounded-full gap-1"
      >
        <ToggleGroupItem value="pencil" className="rounded-full w-10 h-10 data-[state=on]:bg-white data-[state=on]:shadow-sm">
          <Pencil className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="eraser" className="rounded-full w-10 h-10 data-[state=on]:bg-white data-[state=on]:shadow-sm">
          <Eraser className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex items-center gap-1.5 px-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onStrokeColorChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${strokeColor === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent opacity-80'}`}
            style={{ backgroundColor: c }}
            disabled={currentTool === 'eraser'}
          />
        ))}
        <input 
          type="color" 
          value={strokeColor}
          onChange={(e) => onStrokeColorChange(e.target.value)}
          className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-none p-0 bg-transparent"
          disabled={currentTool === 'eraser'}
        />
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="rounded-full h-10 px-4 flex items-center gap-2 hover:bg-muted font-bold text-xs uppercase tracking-widest">
            <span className="opacity-40">Size:</span> {lineWidth}px
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-6 rounded-3xl" side="top" sideOffset={20}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center font-bold text-xs uppercase opacity-40">
              <span>Stroke Weight</span>
              <span>{lineWidth}px</span>
            </div>
            <div className="flex items-center gap-4">
              <Minus className="w-4 h-4 opacity-40 shrink-0" />
              <Slider
                min={1}
                max={50}
                step={1}
                value={[lineWidth]}
                onValueChange={(v) => onLineWidthChange(v[0])}
                className="flex-1"
              />
              <Plus className="w-4 h-4 opacity-40 shrink-0" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border mx-1" />

      <Button 
        onClick={onClearCanvas} 
        variant="ghost" 
        size="icon"
        className="rounded-full w-10 h-10 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default DoodleToolbar;
