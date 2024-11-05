import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
  followingChannels: string[];
  followChannel: (channelId: string) => void;
  unfollowChannel: (channelId: string) => void;
}

const useStore = create<State>()(
  persist(
    set => ({
      followingChannels: [],
      followChannel: (channelId: string) => {
        set(state => ({
          followingChannels: [...state.followingChannels, channelId],
        }));
      },
      unfollowChannel: (channelId: string) => {
        set(state => ({
          followingChannels: state.followingChannels.filter(id => id !== channelId),
        }));
      },
    }),
    {
      name: 'app-storage',
      partialize: state => ({
        followingChannels: state.followingChannels || [],
      }),
    },
  ),
);

export default useStore;
