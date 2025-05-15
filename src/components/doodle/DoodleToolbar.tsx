"use client";

import type { FC } from 'react';
import { Pencil, Eraser, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


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
  return (
    <Card className="w-full md:w-64 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tool-select">Tool</Label>
          <ToggleGroup 
            type="single" 
            value={currentTool} 
            onValueChange={(value: 'pencil' | 'eraser') => value && onToolChange(value)}
            aria-label="Select drawing tool"
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem value="pencil" aria-label="Pencil" className="h-12 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
              <Pencil className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="eraser" aria-label="Eraser" className="h-12 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
              <Eraser className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="stroke-color">Color</Label>
          <Input
            id="stroke-color"
            type="color"
            value={strokeColor}
            onChange={(e) => onStrokeColorChange(e.target.value)}
            className="h-12 w-full p-1 rounded-md"
            aria-label="Select stroke color"
            disabled={currentTool === 'eraser'}
          />
        </div>
        
        <Separator />

        <div className="space-y-2">
          <Label htmlFor="line-width">Line Width: {lineWidth}px</Label>
          <Slider
            id="line-width"
            min={1}
            max={50}
            step={1}
            value={[lineWidth]}
            onValueChange={(value) => onLineWidthChange(value[0])}
            aria-label="Adjust line width"
            className="py-2"
          />
        </div>

        <Separator />
        
        <Button onClick={onClearCanvas} variant="outline" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Clear Canvas
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoodleToolbar;
