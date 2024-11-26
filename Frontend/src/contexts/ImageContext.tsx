import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasImage } from '@/types/canvas';

interface ImageContextType {
  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<CanvasImage[]>([]);

  return <ImageContext.Provider value={{ images, setImages }}>{children}</ImageContext.Provider>;
}

export function useImageContext() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within a ImageProvider');
  }
  return context;
}
