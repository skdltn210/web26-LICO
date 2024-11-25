import { ChangeEvent } from 'react';
import { DrawingState } from '@/types/canvas';

interface PaletteProps {
  drawingState: DrawingState;
  onStateChange: (state: DrawingState) => void;
}

export default function Palette({ drawingState, onStateChange }: PaletteProps) {
  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    onStateChange({
      ...drawingState,
      color: e.target.value,
    });
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    onStateChange({
      ...drawingState,
      width: parseInt(e.target.value),
    });
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg bg-lico-gray-3 p-3">
      <div className="flex items-center gap-3">
        <label htmlFor="drawing-color" className="min-w-[60px] text-sm text-lico-gray-1">
          색상
        </label>
        <input
          type="color"
          id="drawing-color"
          value={drawingState.color}
          onChange={handleColorChange}
          className="h-8 w-8 cursor-pointer rounded"
        />
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="drawing-width" className="min-w-[60px] text-sm text-lico-gray-1">
          두께 ({drawingState.width}px)
        </label>
        <input
          type="range"
          id="drawing-width"
          min="1"
          max="50"
          value={drawingState.width}
          onChange={handleWidthChange}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-lico-gray-2"
        />
      </div>
    </div>
  );
}
