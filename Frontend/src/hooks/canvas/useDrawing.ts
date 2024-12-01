import { useCallback } from 'react';
import { DrawingPath, Point } from '@/types/canvas';
import { useStudioStore } from '@store/useStudioStore';

export function useDrawing() {
  const paths = useStudioStore(state => state.paths);
  const setPaths = useStudioStore(state => state.setPaths);
  const currentPath = useStudioStore(state => state.currentPath);
  const setCurrentPath = useStudioStore(state => state.setCurrentPath);

  const startDrawing = useCallback(
    (point: Point, color: string, width: number, type: 'draw' | 'erase') => {
      const newPath: DrawingPath = {
        points: [point],
        color,
        width,
        type,
      };

      setCurrentPath(newPath);
      setPaths([...paths, newPath]);
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
        setPaths([...paths.slice(0, -1), updatedPath]);
      }
    },
    [currentPath, paths, setPaths, setCurrentPath],
  );

  const endDrawing = useCallback(() => {
    setCurrentPath(null);
  }, [setCurrentPath]);

  const clearDrawings = useCallback(() => {
    setPaths([]);
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
