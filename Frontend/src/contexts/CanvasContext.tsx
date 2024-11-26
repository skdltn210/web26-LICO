import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasImage, CanvasText } from '@/types/canvas';

interface CanvasContextType {
  images: CanvasImage[];
  texts: CanvasText[];
  setImages: (images: CanvasImage[]) => void;
  setTexts: (texts: CanvasText[]) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);

  return <CanvasContext.Provider value={{ images, texts, setImages, setTexts }}>{children}</CanvasContext.Provider>;
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}
