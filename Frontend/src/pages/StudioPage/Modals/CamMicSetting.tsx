import { useState, useEffect, useRef } from 'react';
import { MediaSettings, initialMediaSettings } from '@/types/canvas';
import { useStudioStore } from '@store/useStudioStore';

interface CamMicSettingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CamMicSetting({ isOpen, onClose }: CamMicSettingProps) {
  const { mediaStream, mediaSettings: storeSettings, setMediaStream, setMediaSettings } = useStudioStore();

  const [settings, setSettings] = useState<MediaSettings>(initialMediaSettings);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          const audioDevs = devices.filter(device => device.kind === 'audioinput');
          const videoDevs = devices.filter(device => device.kind === 'videoinput');

          setVideoDevices(videoDevs);
          setAudioDevices(audioDevs);

          if (!settings.videoDeviceId && videoDevs.length > 0) {
            setSettings(prev => ({ ...prev, videoDeviceId: videoDevs[0].deviceId }));
          }
          if (!settings.audioDeviceId && audioDevs.length > 0) {
            setSettings(prev => ({ ...prev, audioDeviceId: audioDevs[0].deviceId }));
          }
        })
        .catch(err => console.error('Error getting devices:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && storeSettings) {
      setSettings(storeSettings);
    }
  }, [isOpen, storeSettings]);

  useEffect(() => {
    const setupPreview = async () => {
      try {
        if (settings.videoEnabled || settings.audioEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
            audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
          });

          if (settings.audioEnabled && audioContext && gainNodeRef.current) {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContext.destination);
          }

          setPreviewStream(stream);
        }
      } catch (error) {
        console.error('Error setting up preview:', error);
      }
    };

    if (isOpen) {
      setupPreview();
    }

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
        setPreviewStream(null);
      }
    };
  }, [isOpen, settings, audioContext]);

  useEffect(() => {
    if (isOpen && settings.audioEnabled) {
      const context = new AudioContext();
      const gainNode = context.createGain();
      gainNode.gain.value = settings.volume / 100;
      gainNodeRef.current = gainNode;
      setAudioContext(context);

      return () => {
        context.close();
        gainNodeRef.current = null;
        setAudioContext(null);
      };
    }
  }, [isOpen, settings.audioEnabled]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(event.target.value, 10);
    setSettings(prev => ({ ...prev, volume }));
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  };

  const handleConfirm = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      if (!settings.videoEnabled && !settings.audioEnabled) {
        setMediaStream(null);
        setMediaSettings(settings);
        onClose();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.videoEnabled ? { deviceId: settings.videoDeviceId } : false,
        audio: settings.audioEnabled ? { deviceId: settings.audioDeviceId } : false,
      });

      (stream as any).isCamFlipped = settings.isCamFlipped;
      setMediaStream(stream);
      setMediaSettings(settings);
      onClose();
    } catch (error) {
      console.error('Error setting up media devices:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50">
      <div className="flex min-h-fit justify-center px-4 pt-12">
        <div className="w-[496px] rounded-lg bg-lico-gray-3 p-6">
          <h1 className="mb-2 font-bold text-xl text-lico-gray-1">카메라/마이크 설정</h1>
          <div className="h-64 w-full overflow-hidden rounded-lg bg-black">
            {settings.videoEnabled && previewStream && (
              <video
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${settings.isCamFlipped ? 'scale-x-[-1]' : ''}`}
                ref={video => {
                  if (video) {
                    video.srcObject = previewStream;
                  }
                }}
              />
            )}
          </div>

          <div className="mt-6 space-y-4">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lico-gray-1">마이크 설정</h3>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.audioEnabled ? 'bg-lico-orange-2' : 'bg-lico-gray-5'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.audioEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.audioEnabled && (
                <>
                  <select
                    value={settings.audioDeviceId}
                    onChange={e => setSettings(prev => ({ ...prev, audioDeviceId: e.target.value }))}
                    className="w-full rounded border border-lico-gray-5 bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1"
                  >
                    {audioDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `마이크 ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>

                  <div className="space-y-2">
                    <span className="font-bold text-sm text-lico-gray-1">볼륨</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-lico-orange-2"
                    />
                  </div>
                </>
              )}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lico-gray-1">카메라 설정</h3>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.videoEnabled ? 'bg-lico-orange-2' : 'bg-lico-gray-5'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.videoEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.videoEnabled && (
                <>
                  <select
                    value={settings.videoDeviceId}
                    onChange={e => setSettings(prev => ({ ...prev, videoDeviceId: e.target.value }))}
                    className="w-full rounded border border-lico-gray-5 bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1"
                  >
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `카메라 ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-lico-gray-1">화면 좌우 반전</span>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, isCamFlipped: !prev.isCamFlipped }))}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.isCamFlipped ? 'bg-lico-orange-2' : 'bg-lico-gray-5'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.isCamFlipped ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>

          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              className="rounded bg-lico-gray-2 px-4 py-2 font-medium text-sm text-lico-gray-4 hover:bg-lico-gray-1 hover:text-lico-orange-2"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded bg-lico-orange-2 px-4 py-2 font-bold text-sm text-white hover:bg-lico-orange-1"
              onClick={handleConfirm}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
