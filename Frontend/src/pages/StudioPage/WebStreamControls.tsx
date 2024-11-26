import { useState, useRef } from 'react';
import { LuMonitor, LuSettings, LuImage, LuType, LuPencil, LuEraser, LuPlay } from 'react-icons/lu';
import { FaSquare } from 'react-icons/fa';
import ControlButton from './ControlButton';
import CamMicSetting from './Modals/CamMicSetting';
import Palette from './Modals/Palette';
import TextSetting from './Modals/TextSetting';
import { MediaSettings, WebStreamControlsProps } from '@/types/canvas';
import { useFinishLive } from '@hooks/useLive';
import { useImage } from '@hooks/canvas/useImage';

export default function WebStreamControls({
  screenStream,
  mediaStream,
  isStreaming,
  drawingState,
  onScreenStreamChange,
  onMediaStreamChange,
  onStreamingChange,
  onDrawingStateChange,
  streamKey,
}: WebStreamControlsProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<MediaSettings | null>(() => ({
    videoEnabled: false,
    audioEnabled: false,
  }));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImage } = useImage();

  const [activeTool, setActiveTool] = useState<'text' | 'draw' | 'erase' | null>(null);

  const { mutateAsync: finishLive } = useFinishLive();

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

  const handleStreaming = async () => {
    if (isStreaming) {
      try {
        await finishLive(streamKey);
        console.log('Live stream ended successfully.');
      } catch (error) {
        console.error('Error ending the live stream:', error);
      }
    }
    onStreamingChange(!isStreaming);
  };

  const handleToolSelect = (tool: 'text' | 'draw' | 'erase' | null) => {
    if (activeTool === tool) {
      setActiveTool(null);
      onDrawingStateChange({
        ...drawingState,
        isDrawing: false,
        isErasing: false,
        isTexting: false,
      });
      return;
    }

    setActiveTool(tool);
    onDrawingStateChange({
      ...drawingState,
      isDrawing: tool === 'draw',
      isErasing: tool === 'erase',
      isTexting: tool === 'text',
    });
  };

  const handleDrawingStateChange = (
    newState: Partial<typeof drawingState.drawTool>,
    tool: 'text' | 'draw' | 'erase',
  ) => {
    onDrawingStateChange({
      ...drawingState,
      [tool === 'text' ? 'textTool' : tool === 'draw' ? 'drawTool' : 'eraseTool']: {
        ...drawingState[tool === 'text' ? 'textTool' : tool === 'draw' ? 'drawTool' : 'eraseTool'],
        ...newState,
      },
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    try {
      await addImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image. Please try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <ControlButton icon={LuMonitor} label="화면 공유" isEnabled={!!screenStream} onClick={handleScreenShare} />
            <ControlButton
              icon={LuSettings}
              label="카메라 / 마이크 설정"
              isEnabled={!!mediaStream}
              onClick={handleMediaSetting}
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <ControlButton icon={LuImage} label="이미지" isEnabled={false} onClick={handleImageClick} />
            <div className="relative">
              <ControlButton
                icon={LuType}
                label="텍스트"
                isEnabled={activeTool === 'text'}
                onClick={() => handleToolSelect('text')}
              />
              {activeTool === 'text' && (
                <TextSetting
                  toolState={drawingState.textTool}
                  onStateChange={state => handleDrawingStateChange(state, 'text')}
                />
              )}
            </div>
            <div className="relative">
              <ControlButton
                icon={LuPencil}
                label="그리기"
                isEnabled={activeTool === 'draw'}
                onClick={() => handleToolSelect('draw')}
              />
              {activeTool === 'draw' && (
                <Palette
                  toolState={drawingState.drawTool}
                  onStateChange={state => handleDrawingStateChange(state, 'draw')}
                  isErasing={false}
                />
              )}
            </div>
            <div className="relative">
              <ControlButton
                icon={LuEraser}
                label="지우개"
                isEnabled={activeTool === 'erase'}
                onClick={() => handleToolSelect('erase')}
              />
              {activeTool === 'erase' && (
                <Palette
                  toolState={drawingState.eraseTool}
                  onStateChange={state => handleDrawingStateChange(state, 'erase')}
                  isErasing={true}
                />
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStreaming}
          className={`flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 font-bold transition-colors ${
            isStreaming
              ? 'bg-lico-gray-3 text-lico-gray-1 hover:bg-lico-gray-2'
              : 'bg-lico-orange-2 text-lico-gray-5 hover:bg-lico-orange-1'
          }`}
          aria-label={isStreaming ? '방송 종료하기' : '방송 시작하기'}
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
      </div>
    </>
  );
}
