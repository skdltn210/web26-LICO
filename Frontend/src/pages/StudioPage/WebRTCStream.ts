import { config } from '@config/env';

interface CanvasInputs {
  streamCanvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  interactionCanvas: HTMLCanvasElement;
  containerWidth: number;
  containerHeight: number;
}

export class WebRTCStream {
  private pc: RTCPeerConnection | null;
  private stream: MediaStream | null;
  private webrtcUrl: string;
  private streamKey: string;
  private compositeCanvas: HTMLCanvasElement;
  private animationFrameId: number | null;
  private canvasInputs: CanvasInputs | null;

  constructor(url: string, streamKey: string) {
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.stream = null;
    this.animationFrameId = null;
    this.canvasInputs = null;
    this.compositeCanvas = document.createElement('canvas');
  }

  private updateCompositeCanvas = () => {
    if (!this.canvasInputs) return;

    const { streamCanvas, drawCanvas, interactionCanvas, containerWidth, containerHeight } = this.canvasInputs;
    const ctx = this.compositeCanvas.getContext('2d');
    if (!ctx) return;

    const scale = window.devicePixelRatio;
    this.compositeCanvas.width = containerWidth * scale;
    this.compositeCanvas.height = containerHeight * scale;

    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);

    ctx.drawImage(streamCanvas, 0, 0, containerWidth, containerHeight);
    ctx.drawImage(drawCanvas, 0, 0, containerWidth, containerHeight);
    ctx.drawImage(interactionCanvas, 0, 0, containerWidth, containerHeight);

    this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);
  };

  async start(canvasInputs: CanvasInputs) {
    try {
      this.canvasInputs = canvasInputs;

      this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);

      const videoStream = this.compositeCanvas.captureStream(30);
      this.stream = new MediaStream([...videoStream.getVideoTracks()]);

      await this.connectWHIP();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private async connectWHIP() {
    this.pc = new RTCPeerConnection({
      iceServers: [],
    });

    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => {
        if (this.stream) {
          this.pc?.addTrack(track, this.stream);
        }
      });
    }

    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const whipEndpoint = config.whipUrl;
      const streamUrl = `${this.webrtcUrl}/${this.streamKey}`;

      const requestBody = {
        api: whipEndpoint,
        streamurl: streamUrl,
        sdp: offer.sdp,
      };

      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const jsonResponse = await response.json();

      if (jsonResponse.code !== 0 || !jsonResponse.sdp) {
        throw new Error(`SRS Error: ${JSON.stringify(jsonResponse)}`);
      }

      await this.pc.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: jsonResponse.sdp,
        }),
      );
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  stop() {
    this.cleanup();
  }

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.canvasInputs = null;
  }
}
