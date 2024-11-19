import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useLayoutStore from '@store/useLayoutStore';
import VideoPlayer from '@components/VideoPlayer';
import StreamSettings from '@pages/StudioPage/StreamSettings';
import WebStreamControls from '@pages/StudioPage/WebStreamControls';
import StreamInfo from '@pages/StudioPage/StreamInfo';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import { useLiveDetail } from '@hooks/useLive.ts';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/error/NotFound';
import { config } from '@config/env';
import { useStreamingKey } from '@hooks/useLive';
import StreamContainer from '@pages/StudioPage/StreamContainer';

interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
}

type TabType = 'External' | 'WebStudio' | 'Info';
type VideoMode = 'player' | 'container';

export default function StudioPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('External');
  const [videoMode, setVideoMode] = useState<VideoMode>('player');
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const [mediaSettings, setMediaSettings] = useState<MediaSettings | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: liveDetail, isLoading, error } = useLiveDetail(channelId!);
  const { data: streamKey } = useStreamingKey();
  const { chatState, toggleChat } = useLayoutStore();

  const STREAM_URL = `${config.storageUrl}/${channelId}/index.m3u8`;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'External') {
      setVideoMode('player');
    } else if (tab === 'WebStudio') {
      setVideoMode('container');
    }
  };

  const renderVideoContent = () => {
    if (videoMode === 'player') {
      return <VideoPlayer streamUrl={STREAM_URL} onAir={liveDetail?.onAir ?? false} />;
    }
    return (
      <StreamContainer
        screenStream={screenStream}
        setScreenStream={setScreenStream}
        mediaSettings={mediaSettings}
        isStreaming={isStreaming}
      />
    );
  };

  if (isLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (error) {
    if (error.status === 404) return <NotFound />;
    return <div>에러가 발생했습니다.</div>;
  }
  if (!channelId || !liveDetail) return <NotFound />;

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide" role="main">
        <h1 className="mb-4 font-bold text-2xl text-lico-gray-1">스튜디오</h1>
        <div className="mt-4 h-3/5">{renderVideoContent()}</div>

        <div className="mt-4">
          <div className="flex justify-end">
            <div className="inline-flex rounded-lg bg-lico-gray-4 p-1" role="tablist">
              <button
                type="button"
                onClick={() => handleTabChange('External')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  activeTab === 'External'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
                role="tab"
                aria-selected={activeTab === 'External'}
                aria-controls="External-panel"
              >
                외부 스트림
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('WebStudio')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  activeTab === 'WebStudio'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
                role="tab"
                aria-selected={activeTab === 'WebStudio'}
                aria-controls="WebStudio-panel"
              >
                웹 스튜디오
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('Info')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  activeTab === 'Info'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
                role="tab"
                aria-selected={activeTab === 'Info'}
                aria-controls="info-panel"
              >
                방송 정보
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-lico-gray-4 p-6">
            {activeTab === 'External' && (
              <div id="External-panel" role="tabpanel">
                <StreamSettings streamKey={streamKey?.toString() || ''} />
              </div>
            )}
            {activeTab === 'WebStudio' && (
              <div id="WebStudio-panel" role="tabpanel">
                <WebStreamControls
                  screenStream={screenStream}
                  setScreenStream={setScreenStream}
                  isStreaming={isStreaming}
                  setIsStreaming={setIsStreaming}
                  onMediaSettingsChange={setMediaSettings}
                  mediaSettings={mediaSettings}
                />
              </div>
            )}
            {activeTab === 'Info' && (
              <div id="info-panel" role="tabpanel">
                <StreamInfo channelId={channelId} />
              </div>
            )}
          </div>
        </div>
      </main>

      {chatState === 'expanded' && (
        <aside className="min-w-[360px] overflow-hidden border-x border-lico-gray-3 bg-lico-gray-4" aria-label="채팅">
          <ChatWindow id={channelId} onAir={liveDetail.onAir} />
        </aside>
      )}
      {chatState === 'hidden' && <ChatOpenButton className="text-lico-gray-2" onClick={toggleChat} />}
    </div>
  );
}
