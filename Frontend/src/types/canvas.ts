export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseCanvasElementProps {
  minSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  type: 'draw' | 'erase';
}

export interface DrawingState {
  isDrawing: boolean;
  isErasing: boolean;
  color: string;
  width: number;
}

export interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isCamFlipped?: boolean;
}

export interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
  drawingState: DrawingState;
}

export interface WebStreamControlsProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  onScreenStreamChange: (stream: MediaStream | null) => void;
  onMediaStreamChange: (stream: MediaStream | null) => void;
  onStreamingChange: (streaming: boolean) => void;
  onDrawingStateChange: (state: DrawingState) => void;
  streamingKey: string;
}
