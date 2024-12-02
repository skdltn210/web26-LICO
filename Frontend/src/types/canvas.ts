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

export interface EraserToolState {
  width: number;
}

export interface DrawingState {
  isDrawing: boolean;
  isErasing: boolean;
  isTexting: boolean;
  drawTool: ToolState;
  eraseTool: EraserToolState;
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
  webrtcUrl: string;
  streamKey: string;
  onStreamError?: (error: Error) => void;
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
  position: Position;
  aspectRatio: number;
  originalWidth: number;
  originalHeight: number;
}

export interface TextInputState {
  isVisible: boolean;
  text: string;
  position: Position;
}

export interface CanvasText {
  id: string;
  text: string;
  position: Position;
  color: string;
  fontSize: number;
  originalFontSize: number;
}

export interface UseTextProps {
  color: string;
  fontSize: number;
}

export interface DeleteModalState {
  show: boolean;
  x: number;
  y: number;
  type: 'text' | 'image';
  targetId: string;
}

export interface MediaSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  isCamFlipped?: boolean;
  volume?: number;
}

export const initialMediaSettings: MediaSettings = {
  videoEnabled: false,
  audioEnabled: false,
  isCamFlipped: false,
  volume: 75,
};
