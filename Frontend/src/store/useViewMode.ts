import { create } from 'zustand';

interface LayoutState {
  isTheaterMode: boolean;
  toggleTheaterMode: () => void;
}

const useViewMode = create<LayoutState>(set => ({
  isTheaterMode: false,

  toggleTheaterMode: () =>
    set(state => ({
      isTheaterMode: !state.isTheaterMode,
    })),
}));

export default useViewMode;
