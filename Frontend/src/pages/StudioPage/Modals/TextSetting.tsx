import { ChangeEvent } from 'react';
import { ToolState } from '@/types/canvas';

interface ToolSettingProps {
  toolState: ToolState;
  onStateChange: (state: Partial<ToolState>) => void;
}

export default function TextSetting({ toolState, onStateChange }: ToolSettingProps) {
  const presetColors = [
    { color: '#FFFFFF', label: '흰색' },
    { color: '#000000', label: '검정' },
    { color: '#F75354', label: '빨강' },
    { color: '#FF6B34', label: '주황' },
    { color: '#027354', label: '초록' },
    { color: '#04458F', label: '파랑' },
  ];

  const handleColorClick = (color: string) => {
    onStateChange({ color });
  };

  const handleCustomColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    onStateChange({ color: e.target.value });
  };

  const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onStateChange({ width: 0 });
      return;
    }

    const size = parseInt(value);
    if (!isNaN(size)) {
      const clampedSize = Math.min(Math.max(0, size), 100);
      onStateChange({ width: clampedSize });
    }
  };

  const handleFontSizeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || parseInt(value) < 1) {
      onStateChange({ width: 1 });
      return;
    }

    const size = parseInt(value);
    const clampedSize = Math.min(Math.max(1, size), 100);
    onStateChange({ width: clampedSize });
  };

  return (
    <div className="absolute left-0 top-full z-50 mt-1 space-y-4 rounded-lg bg-lico-gray-3 p-3 shadow-lg">
      <div className="space-y-2">
        <span className="block text-sm text-lico-gray-1">색상</span>
        <div className="flex items-center gap-2">
          {presetColors.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              className={`h-6 w-6 rounded-full border ${
                toolState.color === color ? 'ring-2 ring-lico-orange-2 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color }}
              title={label}
            />
          ))}
          <input
            type="color"
            value={toolState.color}
            onChange={handleCustomColorChange}
            className="h-6 w-6 cursor-pointer rounded-full"
            title="커스텀 색상"
          />
        </div>
      </div>
      <div className="space-y-2">
        <span className="block text-sm text-lico-gray-1">글자 크기</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="100"
            value={toolState.width || ''}
            onChange={handleFontSizeChange}
            onBlur={handleFontSizeBlur}
            className="w-20 rounded-lg bg-lico-gray-4 px-3 py-2 text-sm text-lico-gray-1"
          />
          <span className="text-sm text-lico-gray-1">px</span>
        </div>
      </div>
    </div>
  );
}
