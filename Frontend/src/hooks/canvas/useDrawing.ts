import { useCallback } from 'react';
import { DrawingPath, Point } from '@/types/canvas';
import { useCanvasContext } from '@contexts/CanvasContext';

export function useDrawing() {
  const { paths, setPaths, currentPath, setCurrentPath } = useCanvasContext();

  const startDrawing = useCallback(
    (point: Point, color: string, width: number, type: 'draw' | 'erase') => {
      const newPath: DrawingPath = {
        points: [point],
        color,
        width,
        type,
      };

      setCurrentPath(newPath);
      setPaths(prevPaths => [...prevPaths, newPath]);
    },
    [paths, setPaths, setCurrentPath],
  );

  const continueDrawing = useCallback(
    (point: Point) => {
      if (currentPath) {
        const updatedPath: DrawingPath = {
          ...currentPath,
          points: [...currentPath.points, point],
        };

        setCurrentPath(updatedPath);
        setPaths(prevPaths => [...prevPaths.slice(0, -1), updatedPath]);
      }
    },
    [paths, currentPath, setPaths, setCurrentPath],
  );

  const endDrawing = useCallback(() => {
    setCurrentPath(null);
  }, [setCurrentPath]);

  const clearDrawings = useCallback(() => {
    setPaths(() => []);
    setCurrentPath(null);
  }, [setPaths, setCurrentPath]);

  return {
    paths,
    startDrawing,
    continueDrawing,
    endDrawing,
    clearDrawings,
  };
}
