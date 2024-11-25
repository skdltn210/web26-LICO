import { useState, useCallback } from 'react';
import { DrawingPath, Point } from '@/types/canvas';

export const useDrawing = () => {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  const startDrawing = useCallback((point: Point, color: string, width: number, type: 'draw' | 'erase') => {
    const newPath: DrawingPath = {
      points: [point],
      color,
      width,
      type,
    };
    setCurrentPath(newPath);
    setPaths(prev => [...prev, newPath]);
  }, []);

  const continueDrawing = useCallback(
    (point: Point) => {
      if (currentPath) {
        const updatedPath = {
          ...currentPath,
          points: [...currentPath.points, point],
        };
        setCurrentPath(updatedPath);
        setPaths(prev => [...prev.slice(0, -1), updatedPath]);
      }
    },
    [currentPath],
  );

  const endDrawing = useCallback(() => {
    setCurrentPath(null);
  }, []);

  const clearDrawings = useCallback(() => {
    setPaths([]);
    setCurrentPath(null);
  }, []);

  return {
    paths,
    startDrawing,
    continueDrawing,
    endDrawing,
    clearDrawings,
  };
};
