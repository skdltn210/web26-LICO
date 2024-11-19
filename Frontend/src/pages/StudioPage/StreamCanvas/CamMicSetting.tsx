import { useState, useEffect, useRef } from 'react';

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
  isFlipped?: boolean;
  volume?: number;
}

export default function CamMicSetting({ isOpen, onClose, onConfirm, initialSettings }: CamMicSettingProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [settings, setSettings] = useState<MediaSettings>(() => ({
    videoEnabled: false,
    audioEnabled: false,
    isFlipped: false,
    volume: 75,
    ...initialSettings,
  }));
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(async devices => {
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

          if (settings.audioEnabled) {
            if (!audioContextRef.current) {
              audioContextRef.current = new AudioContext();
              const source = audioContextRef.current.createMediaStreamSource(stream);
              gainNodeRef.current = audioContextRef.current.createGain();
              source.connect(gainNodeRef.current);
              gainNodeRef.current.connect(audioContextRef.current.destination);
            }
            if (gainNodeRef.current && settings.volume !== undefined) {
              gainNodeRef.current.gain.value = settings.volume / 100;
            }
          }

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
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [settings.videoEnabled, settings.audioEnabled, settings.videoDeviceId, settings.audioDeviceId]);

  useEffect(() => {
    if (gainNodeRef.current && settings.volume !== undefined) {
      gainNodeRef.current.gain.value = settings.volume / 100;
    }
  }, [settings.volume]);

  const handleConfirm = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    onConfirm(settings);
    onClose();
  };

  const handleCancel = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    onClose();
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
                className={`h-full w-full object-cover ${settings.isFlipped ? 'scale-x-[-1]' : ''}`}
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
                    className="w-full rounded border border-lico-gray-3 bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1"
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
                      className="w-full accent-lico-orange-2"
                      onChange={e => setSettings(prev => ({ ...prev, volume: Number(e.target.value) }))}
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
                    className="w-full rounded border border-lico-gray-3 bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1"
                  >
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `카메라 ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-lico-gray-1">좌우반전</span>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, isFlipped: !prev.isFlipped }))}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.isFlipped ? 'bg-lico-orange-2' : 'bg-lico-gray-5'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.isFlipped ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </section>

            {settings.videoEnabled && (
              <section>
                <h3 className="font-bold text-sm text-lico-gray-1">AR</h3>
              </section>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg bg-lico-gray-2 px-4 py-2 font-bold text-sm text-lico-gray-5 transition-colors hover:bg-lico-gray-1"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-lico-orange-2 px-4 py-2 font-bold text-sm text-white transition-colors hover:bg-lico-orange-1"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
