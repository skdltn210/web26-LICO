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

export interface ToolState {
  color: string;
  width: number;
}

export interface DrawingState {
  isDrawing: boolean;
  isErasing: boolean;
  isTexting: boolean;
  drawTool: ToolState;
  eraseTool: ToolState;
  textTool: ToolState;
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
  drawingState: DrawingState;
  onScreenStreamChange: (stream: MediaStream | null) => void;
  onMediaStreamChange: (stream: MediaStream | null) => void;
  onStreamingChange: (streaming: boolean) => void;
  onDrawingStateChange: (state: DrawingState) => void;
  streamKey: string;
}

export interface CanvasImage {
  id: string;
  element: HTMLImageElement | HTMLCanvasElement;
  position: Point;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface TextInputState {
  isVisible: boolean;
  text: string;
  position: Point;
}

export interface CanvasText {
  id: string;
  text: string;
  position: Point;
  color: string;
  fontSize: number;
}

export interface UseTextProps {
  color: string;
  fontSize: number;
}
