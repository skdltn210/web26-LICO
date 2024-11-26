import { useState } from 'react';
import { Point } from '@/types/canvas';

interface TextInputState {
  isVisible: boolean;
  text: string;
  position: Point;
}

interface CanvasText {
  text: string;
  position: Point;
  color: string;
  fontSize: number;
}

interface UseTextProps {
  color: string;
  fontSize: number;
}

export function useText({ color, fontSize }: UseTextProps) {
  const [textInput, setTextInput] = useState<TextInputState>({
    isVisible: false,
    text: '',
    position: { x: 0, y: 0 },
  });

  const [texts, setTexts] = useState<CanvasText[]>([]);

  const startTextInput = (position: Point) => {
    setTextInput({
      isVisible: true,
      text: '',
      position,
    });
  };

  const updateText = (text: string) => {
    const singleLineText = text.replace(/\n/g, ' ');
    setTextInput(prev => ({
      ...prev,
      text: singleLineText,
    }));
  };

  const completeText = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx || !textInput.text.trim()) {
      setTextInput({ isVisible: false, text: '', position: { x: 0, y: 0 } });
      return;
    }

    const newText: CanvasText = {
      text: textInput.text,
      position: textInput.position,
      color,
      fontSize,
    };
    setTexts(prev => [...prev, newText]);

    setTextInput({ isVisible: false, text: '', position: { x: 0, y: 0 } });
  };

  const cancelText = () => {
    setTextInput({ isVisible: false, text: '', position: { x: 0, y: 0 } });
  };

  const drawTexts = (ctx: CanvasRenderingContext2D) => {
    texts.forEach(text => {
      ctx.save();
      ctx.font = `${text.fontSize}px Arial`;
      ctx.fillStyle = text.color;
      ctx.textBaseline = 'top';
      ctx.fillText(text.text, text.position.x, text.position.y);
      ctx.restore();
    });
  };
  return {
    textInput,
    texts,
    startTextInput,
    updateText,
    completeText,
    cancelText,
    drawTexts,
  };
}
