import { useState } from 'react';
import { LuMonitor, LuSettings, LuImage, LuType, LuPencil, LuEraser, LuPlay } from 'react-icons/lu';
import { FaSquare } from 'react-icons/fa';
import ControlButton from './ControlButton';
import CamMicSetting from './Modals/CamMicSetting';
import { MediaSettings, WebStreamControlsProps } from '@/types/canvas';

export default function WebStreamControls({
  screenStream,
  mediaStream,
  isStreaming,
  onScreenStreamChange,
  onMediaStreamChange,
  onStreamingChange,
}: WebStreamControlsProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<MediaSettings | null>(() => ({
    videoEnabled: false,
    audioEnabled: false,
  }));

  const handleScreenShare = async () => {
    try {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        onScreenStreamChange(null);
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      onScreenStreamChange(stream);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleMediaSetting = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      onMediaStreamChange(null);
      setMediaSettings(null);
    } else {
      setIsSettingsModalOpen(true);
    }
  };

  const handleSettingsConfirm = async (settings: MediaSettings) => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      if (!settings.videoEnabled && !settings.audioEnabled) {
        onMediaStreamChange(null);
        setMediaSettings(settings);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
        audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      (stream as any).isCamFlipped = settings.isCamFlipped;

      onMediaStreamChange(stream);
      setMediaSettings(settings);
    } catch (error) {
      console.error('Error setting up media devices:', error);
    }
  };

  const handleStreaming = () => {
    onStreamingChange(!isStreaming);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <ControlButton icon={LuMonitor} label="화면 공유" isEnabled={!!screenStream} onClick={handleScreenShare} />
          <ControlButton
            icon={LuSettings}
            label="카메라 / 마이크 설정"
            isEnabled={!!mediaStream}
            onClick={handleMediaSetting}
          />
          <ControlButton icon={LuImage} label="이미지" isEnabled={false} onClick={() => console.log()} />
          <ControlButton icon={LuType} label="텍스트" isEnabled={false} onClick={() => console.log()} />
          <ControlButton icon={LuPencil} label="그리기" isEnabled={false} onClick={() => console.log()} />
          <ControlButton icon={LuEraser} label="지우개" isEnabled={false} onClick={() => console.log()} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleStreaming}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 font-bold transition-colors ${
          isStreaming
            ? 'bg-lico-gray-3 text-lico-gray-1 hover:bg-lico-gray-2'
            : 'bg-lico-orange-2 text-lico-gray-5 hover:bg-lico-orange-1'
        }`}
        aria-label={isStreaming ? '방송 중지하기' : '방송 시작하기'}
      >
        {isStreaming ? (
          <FaSquare className="h-4 w-4 text-red-600" aria-hidden="true" />
        ) : (
          <LuPlay className="h-5 w-5" aria-hidden="true" />
        )}
        {isStreaming ? '방송 종료하기' : '방송 시작하기'}
      </button>

      <CamMicSetting
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onConfirm={handleSettingsConfirm}
        initialSettings={mediaSettings}
      />
    </>
  );
}
