import { create } from 'zustand';

type NavbarState = 'expanded' | 'collapsed' | 'hidden';
type ChatState = 'expanded' | 'vertical' | 'hidden';
type VideoPlayerState = 'default' | 'theater';
type BreakpointType = 'CHAT_HIDDEN' | 'NAV_COLLAPSED' | 'FULL';

interface LayoutState {
  navbarState: NavbarState;
  chatState: ChatState;
  isChatLocked: boolean;
  videoPlayerState: VideoPlayerState;

  toggleNavbar: () => void;
  toggleChat: () => void;
  toggleVideoPlayer: () => void;
  handleBreakpoint: (breakpoint: BreakpointType) => void;
}

const BREAKPOINT_STATES: Record<BreakpointType, (isChatLocked: boolean) => Partial<LayoutState>> = {
  CHAT_HIDDEN: () => ({
    navbarState: 'collapsed',
    chatState: 'hidden',
  }),
  NAV_COLLAPSED: isChatLocked => ({
    navbarState: 'collapsed',
    chatState: isChatLocked ? 'hidden' : 'expanded',
  }),
  FULL: isChatLocked => ({
    navbarState: 'expanded',
    chatState: isChatLocked ? 'hidden' : 'expanded',
  }),
};

const useLayoutState = create<LayoutState>()((set, get) => ({
  navbarState: 'expanded',
  chatState: 'expanded',
  videoPlayerState: 'default',
  isChatLocked: false,

  toggleNavbar: () => {
    const { navbarState } = get();
    set({
      navbarState: navbarState === 'expanded' ? 'collapsed' : 'expanded',
    });
  },

  toggleChat: () => {
    const { chatState, isChatLocked } = get();
    set({
      chatState: chatState === 'expanded' ? 'hidden' : 'expanded',
      isChatLocked: !isChatLocked,
    });
  },

  toggleVideoPlayer: () => {
    const { videoPlayerState } = get();
    set({
      videoPlayerState: videoPlayerState === 'default' ? 'theater' : 'default',
      navbarState: videoPlayerState === 'default' ? 'hidden' : 'expanded',
    });
  },

  handleBreakpoint: (breakpoint: BreakpointType) => {
    const { videoPlayerState, isChatLocked } = get();

    if (videoPlayerState === 'default') {
      const stateUpdater = BREAKPOINT_STATES[breakpoint];
      if (stateUpdater) {
        set(stateUpdater(isChatLocked));
      }
    }
  },
}));

export default useLayoutState;
