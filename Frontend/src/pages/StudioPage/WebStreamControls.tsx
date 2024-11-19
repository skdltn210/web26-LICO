import { LuMonitor, LuSettings, LuImage, LuType, LuPencil, LuEraser, LuPlay } from 'react-icons/lu';
import { FaSquare } from 'react-icons/fa';

import ControlButton from './ControlButton';

interface WebStreamControlsProps {
  screenEnabled: boolean;
  setScreenEnabled: (enabled: boolean) => void;
  settingEnabled: boolean;
  setSettingEnabled: (enabled: boolean) => void;
  imageEnabled: boolean;
  setImageEnabled: (enabled: boolean) => void;
  textEnabled: boolean;
  setTextEnabled: (enabled: boolean) => void;
  drawEnabled: boolean;
  setDrawEnabled: (enabled: boolean) => void;
  eraserEnabled: boolean;
  setEraserEnabled: (enabled: boolean) => void;
  isStreaming: boolean;
  setIsStreaming: (enabled: boolean) => void;
}

export default function WebStreamControls({
  screenEnabled,
  setScreenEnabled,
  settingEnabled,
  setSettingEnabled,
  imageEnabled,
  setImageEnabled,
  textEnabled,
  setTextEnabled,
  drawEnabled,
  setDrawEnabled,
  eraserEnabled,
  setEraserEnabled,
  isStreaming,
  setIsStreaming,
}: WebStreamControlsProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <ControlButton
            icon={LuMonitor}
            label="화면 공유"
            isEnabled={screenEnabled}
            onClick={() => setScreenEnabled(!screenEnabled)}
          />
          <ControlButton
            icon={LuSettings}
            label="카메라 / 마이크 설정"
            isEnabled={settingEnabled}
            onClick={() => setSettingEnabled(!settingEnabled)}
          />
          <ControlButton
            icon={LuImage}
            label="이미지"
            isEnabled={imageEnabled}
            onClick={() => setImageEnabled(!imageEnabled)}
          />
          <ControlButton
            icon={LuType}
            label="텍스트"
            isEnabled={textEnabled}
            onClick={() => setTextEnabled(!textEnabled)}
          />
          <ControlButton
            icon={LuPencil}
            label="그리기"
            isEnabled={drawEnabled}
            onClick={() => setDrawEnabled(!drawEnabled)}
          />
          <ControlButton
            icon={LuEraser}
            label="지우개"
            isEnabled={eraserEnabled}
            onClick={() => setEraserEnabled(!eraserEnabled)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsStreaming(!isStreaming)}
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
    </>
  );
}
