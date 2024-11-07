import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FollowState {
  followingChannels: string[];
  followChannel: (channelId: string) => void;
  unfollowChannel: (channelId: string) => void;
}

const useFollowStore = create<FollowState>()(
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
      name: 'follow-storage',
      partialize: state => ({
        followingChannels: state.followingChannels || [],
      }),
    },
  ),
);

export default useFollowStore;
