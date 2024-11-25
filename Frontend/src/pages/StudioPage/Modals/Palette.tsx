import { ChangeEvent } from 'react';
import { DrawingState } from '@/types/canvas';

interface PaletteProps {
  drawingState: DrawingState;
  onStateChange: (state: DrawingState) => void;
}

export default function Palette({ drawingState, onStateChange }: PaletteProps) {
  const presetColors = [
    { color: '#FFFFFF', label: '흰색' },
    { color: '#000000', label: '검정' },
    { color: '#F75354', label: '빨강' },
    { color: '#FF6B34', label: '주황' },
    { color: '#027354', label: '초록' },
    { color: '#04458F', label: '파랑' },
  ];

  const presetSizes = [
    { size: 2, dimension: 4 },
    { size: 5, dimension: 8 },
    { size: 10, dimension: 12 },
    { size: 20, dimension: 16 },
    { size: 50, dimension: 28 },
  ];

  const handleColorClick = (color: string) => {
    onStateChange({
      ...drawingState,
      color,
    });
  };

  const handleSizeClick = (width: number) => {
    onStateChange({
      ...drawingState,
      width,
    });
  };

  const handleCustomColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    onStateChange({
      ...drawingState,
      color: e.target.value,
    });
  };

  return (
    <div className="absolute left-0 top-full z-50 mt-1 space-y-4 rounded-lg bg-lico-gray-3 p-3 shadow-lg">
      {!drawingState.isErasing && (
        <div className="space-y-2">
          <span className="block text-sm text-lico-gray-1">색상</span>
          <div className="flex items-center gap-2">
            {presetColors.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorClick(color)}
                className={`h-6 w-6 rounded-full border ${
                  drawingState.color === color ? 'ring-2 ring-lico-orange-2 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
            <input
              type="color"
              value={drawingState.color}
              onChange={handleCustomColorChange}
              className="h-6 w-6 cursor-pointer rounded-full"
              title="커스텀 색상"
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <span className="block text-sm text-lico-gray-1">두께</span>
        <div className="flex items-center gap-3">
          {presetSizes.map(({ size, dimension }) => (
            <button
              key={size}
              type="button"
              onClick={() => handleSizeClick(size)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${
                drawingState.width === size ? 'bg-lico-orange-2' : 'bg-lico-gray-4 hover:bg-lico-gray-2'
              } `}
              title={`${size}px`}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${dimension}px`,
                  height: `${dimension}px`,
                  backgroundColor: drawingState.isErasing ? 'white' : drawingState.color,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
