import { LuCamera, LuMonitor, LuImage, LuType, LuPencil, LuSparkles, LuPlay } from 'react-icons/lu';
import ControlButton from './ControlButton';

interface WebStreamControlsProps {
  screenEnabled: boolean;
  setScreenEnabled: (enabled: boolean) => void;
  webcamEnabled: boolean;
  setWebcamEnabled: (enabled: boolean) => void;
  imageEnabled: boolean;
  setImageEnabled: (enabled: boolean) => void;
  textEnabled: boolean;
  setTextEnabled: (enabled: boolean) => void;
  drawEnabled: boolean;
  setDrawEnabled: (enabled: boolean) => void;
  arEnabled: boolean;
  setArEnabled: (enabled: boolean) => void;
  channelId: string;
}

export default function WebStreamControls({
  screenEnabled,
  setScreenEnabled,
  webcamEnabled,
  setWebcamEnabled,
  imageEnabled,
  setImageEnabled,
  textEnabled,
  setTextEnabled,
  drawEnabled,
  setDrawEnabled,
  arEnabled,
  setArEnabled,
  channelId,
}: WebStreamControlsProps) {
  return (
    <>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <ControlButton
            icon={LuMonitor}
            label="화면 공유"
            isEnabled={screenEnabled}
            onClick={() => setScreenEnabled(!screenEnabled)}
          />

          <ControlButton
            icon={LuCamera}
            label="웹캠"
            isEnabled={webcamEnabled}
            onClick={() => setWebcamEnabled(!webcamEnabled)}
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

          <ControlButton icon={LuSparkles} label="AR" isEnabled={arEnabled} onClick={() => setArEnabled(!arEnabled)} />
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-lico-orange-2 px-4 py-2.5 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
        aria-label="방송 시작하기"
      >
        <LuPlay className="-mt-0.5 h-5 w-5" aria-hidden="true" />
        방송 시작하기
      </button>
    </>
  );
}
