import { create } from 'zustand';
import { DrawingPath, CanvasText, CanvasImage } from '@/types/canvas';

interface StudioState {
  paths: DrawingPath[];
  currentPath: DrawingPath | null;
  setPaths: (paths: DrawingPath[]) => void;
  setCurrentPath: (path: DrawingPath | null) => void;

  texts: CanvasText[];
  setTexts: (texts: CanvasText[]) => void;

  images: CanvasImage[];
  setImages: (images: CanvasImage[]) => void;

  clearAll: () => void;
}

export const useStudioStore = create<StudioState>(set => ({
  paths: [],
  currentPath: null,
  texts: [],
  images: [],

  setPaths: paths => set({ paths }),
  setCurrentPath: currentPath => set({ currentPath }),
  setTexts: texts => set({ texts }),
  setImages: images => set({ images }),

  clearAll: () => set({ paths: [], currentPath: null, texts: [], images: [] }),
}));
