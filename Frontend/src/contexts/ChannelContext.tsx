import { createContext, useContext, useState, ReactNode } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  title: string;
  streamerName: string;
  channelDescription: string;
  viewers: number;
  followers: number;
  category: Category;
  profileImgUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

interface ChannelContextType {
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: ReactNode }) {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  return <ChannelContext.Provider value={{ currentChannel, setCurrentChannel }}>{children}</ChannelContext.Provider>;
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
}
