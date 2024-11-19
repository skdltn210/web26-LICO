import { useState, useEffect } from 'react';

interface CamMicSettingProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: MediaSettings) => void;
  initialSettings: MediaSettings | null;
}

interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
}

export default function CamMicSetting({ isOpen, onClose, onConfirm, initialSettings }: CamMicSettingProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [settings, setSettings] = useState<MediaSettings>(
    () =>
      initialSettings || {
        videoEnabled: false,
        audioEnabled: false,
      },
  );
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          setVideoDevices(devices.filter(device => device.kind === 'videoinput'));
          setAudioDevices(devices.filter(device => device.kind === 'audioinput'));
        })
        .catch(err => console.error('Error getting devices:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialSettings) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  useEffect(() => {
    const getPreviewStream = async () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      if (settings.videoEnabled || settings.audioEnabled) {
        try {
          const constraints = {
            video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
            audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setPreviewStream(stream);
        } catch (err) {
          console.error('Error getting media stream:', err);
        }
      }
    };

    getPreviewStream();

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings]);

  const handleConfirm = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    onConfirm(settings);
    onClose();
  };

  const handleCancel = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-6">
          <h2 className="font-bold text-xl text-lico-gray-1">카메라/마이크 설정</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="font-medium text-lico-gray-1">
              카메라 사용
              <input
                type="checkbox"
                className="ml-2 h-4 w-4"
                checked={settings.videoEnabled}
                onChange={e => setSettings(prev => ({ ...prev, videoEnabled: e.target.checked }))}
              />
            </label>
          </div>

          {settings.videoEnabled && videoDevices.length > 0 && (
            <div>
              <label className="mb-2 block font-medium text-lico-gray-1">카메라 선택</label>
              <select
                value={settings.videoDeviceId}
                onChange={e => setSettings(prev => ({ ...prev, videoDeviceId: e.target.value }))}
                className="w-full rounded border border-lico-gray-3 px-3 py-2 text-lico-gray-1"
              >
                <option value="">카메라를 선택하세요</option>
                {videoDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `카메라 ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="font-medium text-lico-gray-1">
              마이크 사용
              <input
                type="checkbox"
                className="ml-2 h-4 w-4"
                checked={settings.audioEnabled}
                onChange={e => setSettings(prev => ({ ...prev, audioEnabled: e.target.checked }))}
              />
            </label>
          </div>

          {settings.audioEnabled && audioDevices.length > 0 && (
            <div>
              <label className="mb-2 block font-medium text-lico-gray-1">마이크 선택</label>
              <select
                value={settings.audioDeviceId}
                onChange={e => setSettings(prev => ({ ...prev, audioDeviceId: e.target.value }))}
                className="w-full rounded border border-lico-gray-3 px-3 py-2 text-lico-gray-1"
              >
                <option value="">마이크를 선택하세요</option>
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `마이크 ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {settings.videoEnabled && previewStream && (
            <div className="mt-4 overflow-hidden rounded border border-lico-gray-3">
              <video
                autoPlay
                playsInline
                muted
                className="h-48 w-full object-cover"
                ref={video => {
                  if (video) {
                    video.srcObject = previewStream;
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded border border-lico-gray-3 px-4 py-2 font-medium text-lico-gray-1 hover:bg-lico-gray-4"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded bg-lico-orange-2 px-4 py-2 font-medium text-white hover:bg-lico-orange-1"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
