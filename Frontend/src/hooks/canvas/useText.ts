import { useState } from 'react';
import { Point } from '@/types/canvas';
import { UseTextProps, TextInputState, CanvasText } from '@/types/canvas';
import { useCanvasContext } from '@/contexts/CanvasContext';

export function useText({ color, fontSize }: UseTextProps) {
  const { texts, setTexts } = useCanvasContext();
  const [textInput, setTextInput] = useState<TextInputState>({
    isVisible: false,
    text: '',
    position: { x: 0, y: 0, width: 0, height: 0 },
  });

  const startTextInput = (point: Point) => {
    setTextInput({
      isVisible: true,
      text: '',
      position: {
        x: point.x,
        y: point.y,
        width: 0,
        height: fontSize,
      },
    });
  };

  const updateText = (text: string) => {
    const singleLineText = text.replace(/\n/g, ' ');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${fontSize}px Arial`;
      const metrics = ctx.measureText(singleLineText);

      setTextInput(prev => ({
        ...prev,
        text: singleLineText,
        position: {
          ...prev.position,
          width: metrics.width,
          height: fontSize,
        },
      }));
    }
  };

  const completeText = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx || !textInput.text.trim()) {
      setTextInput({
        isVisible: false,
        text: '',
        position: { x: 0, y: 0, width: 0, height: 0 },
      });
      return;
    }

    ctx.font = `${fontSize}px Arial`;
    const metrics = ctx.measureText(textInput.text);

    const newText: CanvasText = {
      id: crypto.randomUUID(),
      text: textInput.text,
      position: {
        ...textInput.position,
        width: metrics.width,
        height: fontSize,
      },
      color,
      fontSize,
    };
    setTexts([...texts, newText]);

    setTextInput({
      isVisible: false,
      text: '',
      position: { x: 0, y: 0, width: 0, height: 0 },
    });
  };

  const cancelText = () => {
    setTextInput({ isVisible: false, text: '', position: { x: 0, y: 0, width: 0, height: 0 } });
  };

  const drawTexts = (ctx: CanvasRenderingContext2D) => {
    texts.forEach(text => {
      ctx.save();
      ctx.font = `${text.fontSize}px Arial`;
      ctx.fillStyle = text.color;
      ctx.textBaseline = 'top';

      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(text.position.x, text.position.y, text.position.width, text.position.height);

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
