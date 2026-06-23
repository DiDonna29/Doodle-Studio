
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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 glass-panel rounded-full shadow-2xl border-white/20 backdrop-blur-2xl"
    >
      <ToggleGroup 
        type="single" 
        value={currentTool} 
        onValueChange={(value: 'pencil' | 'eraser') => value && onToolChange(value)}
        className="bg-muted/50 p-1 rounded-full gap-0.5"
      >
        <ToggleGroupItem value="pencil" className="rounded-full w-8 h-8 sm:w-10 sm:h-10 data-[state=on]:bg-white data-[state=on]:shadow-sm">
          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="eraser" className="rounded-full w-8 h-8 sm:w-10 sm:h-10 data-[state=on]:bg-white data-[state=on]:shadow-sm">
          <Eraser className="h-3 w-3 sm:h-4 sm:w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="w-px h-5 sm:h-6 bg-border mx-0.5" />

      {/* Responsive Colors: Hidden on very small screens, shown as popover maybe? For now just a compact flex */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2 overflow-x-auto max-w-[120px] sm:max-w-none no-scrollbar">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onStrokeColorChange(c)}
            className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex-shrink-0 ${strokeColor === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent opacity-80'}`}
            style={{ backgroundColor: c }}
            disabled={currentTool === 'eraser'}
          />
        ))}
      </div>

      <div className="w-px h-5 sm:h-6 bg-border mx-0.5" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="rounded-full h-8 sm:h-10 px-2 sm:px-4 flex items-center gap-1 sm:gap-2 hover:bg-muted font-black text-[8px] sm:text-[10px] uppercase tracking-widest">
            <span className="opacity-40 hidden xs:inline">Peso:</span> {lineWidth}px
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 sm:w-64 p-4 sm:p-6 rounded-3xl" side="top" sideOffset={15}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center font-black text-[8px] sm:text-[10px] uppercase opacity-40">
              <span>Grosor del Trazo</span>
              <span>{lineWidth}px</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Minus className="w-3 h-3 sm:w-4 sm:h-4 opacity-40 shrink-0" />
              <Slider
                min={1}
                max={40}
                step={1}
                value={[lineWidth]}
                onValueChange={(v) => onLineWidthChange(v[0])}
                className="flex-1"
              />
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 opacity-40 shrink-0" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-5 sm:h-6 bg-border mx-0.5" />

      <Button 
        onClick={onClearCanvas} 
        variant="ghost" 
        size="icon"
        className="rounded-full w-8 h-8 sm:w-10 sm:h-10 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </motion.div>
  );
};

export default DoodleToolbar;
