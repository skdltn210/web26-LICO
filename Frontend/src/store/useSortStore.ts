import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SortType } from '@/types/live';

interface SortState {
  sortType: SortType;
  setSortType: (type: SortType) => void;
}

export const useSortStore = create<SortState>()(
  devtools(
    persist(
      set => ({
        sortType: 'viewers',
        setSortType: type => set({ sortType: type }),
      }),
      {
        name: 'sort-store',
        partialize: state => ({ sortType: state.sortType }),
      },
    ),
  ),
);
