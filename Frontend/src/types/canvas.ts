export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseCanvasElementProps {
  minSize?: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
}

export interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isCamFlipped?: boolean;
  volume?: number;
}

export interface WebStreamControlsProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  onScreenStreamChange: (stream: MediaStream | null) => void;
  onMediaStreamChange: (stream: MediaStream | null) => void;
  onStreamingChange: (streaming: boolean) => void;
}
