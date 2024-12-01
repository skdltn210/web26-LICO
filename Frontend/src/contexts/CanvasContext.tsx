import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasImage, CanvasText, DrawingPath } from '@/types/canvas';

interface CanvasContextType {
  images: CanvasImage[];
  texts: CanvasText[];
  paths: DrawingPath[];
  currentPath: DrawingPath | null;
  setImages: (updater: CanvasImage[] | ((prevImages: CanvasImage[]) => CanvasImage[])) => void;
  setTexts: (updater: CanvasText[] | ((prevTexts: CanvasText[]) => CanvasText[])) => void;
  setPaths: (updater: DrawingPath[] | ((prevPaths: DrawingPath[]) => DrawingPath[])) => void;
  setCurrentPath: (path: DrawingPath | null) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  return (
    <CanvasContext.Provider
      value={{
        images,
        texts,
        paths,
        currentPath,
        setImages,
        setTexts,
        setPaths,
        setCurrentPath,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}
