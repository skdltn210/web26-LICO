import { useState } from 'react';
import { LuMonitor, LuSettings, LuImage, LuType, LuPencil, LuEraser, LuPlay } from 'react-icons/lu';
import { FaSquare } from 'react-icons/fa';
import ControlButton from './ControlButton';
import CamMicSetting from './StreamCanvas/CamMicSetting';

interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isCamFlipped?: boolean;
  volume?: number;
}

interface WebStreamControlsProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  isCamFlipped: boolean;
  onScreenStreamChange: (stream: MediaStream | null) => void;
  onMediaStreamChange: (stream: MediaStream | null) => void;
  onStreamingChange: (streaming: boolean) => void;
  onCamFlipChange: (isCamFlipped: boolean) => void;
}

export default function WebStreamControls({
  screenStream,
  mediaStream,
  isStreaming,
  isCamFlipped,
  onScreenStreamChange,
  onMediaStreamChange,
  onStreamingChange,
  onCamFlipChange,
}: WebStreamControlsProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<MediaSettings | null>(() => ({
    videoEnabled: false,
    audioEnabled: false,
    isCamFlipped: isCamFlipped,
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
      onCamFlipChange(false);
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
        onCamFlipChange(false);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
        audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (mediaStream) {
        const videoTracks = mediaStream.getVideoTracks();
        const audioTracks = mediaStream.getAudioTracks();

        if (!settings.videoEnabled && videoTracks.length > 0) {
          videoTracks.forEach(track => track.stop());
        }
        if (!settings.audioEnabled && audioTracks.length > 0) {
          audioTracks.forEach(track => track.stop());
        }
      }

      onMediaStreamChange(stream);
      setMediaSettings(settings);
      onCamFlipChange(settings.isCamFlipped || false);
    } catch (error) {
      console.error('Error setting up media devices:', error);
    }
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
        onClick={() => onStreamingChange(!isStreaming)}
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
