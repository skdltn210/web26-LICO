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
  private isConnecting: boolean = false;

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
    if (!this.canvasInputs) {
      return;
    }

    const { streamCanvas, drawCanvas, interactionCanvas, containerWidth, containerHeight } = this.canvasInputs;
    const ctx = this.compositeCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const scale = window.devicePixelRatio;

    const halfStreamWidth = Math.floor(streamCanvas.width / 2);
    const halfStreamHeight = Math.floor(streamCanvas.height / 2);

    this.compositeCanvas.width = Math.floor(containerWidth * scale);
    this.compositeCanvas.height = Math.floor(containerHeight * scale);

    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);

    try {
      ctx.drawImage(streamCanvas, 0, 0, halfStreamWidth, halfStreamHeight, 0, 0, containerWidth, containerHeight);

      ctx.drawImage(drawCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(interactionCanvas, 0, 0, containerWidth, containerHeight);
    } catch (error) {}

    this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);
  };

  async start(canvasInputs: CanvasInputs) {
    if (this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;

      await this.cleanup();

      this.canvasInputs = canvasInputs;
      this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);

      await new Promise(resolve => setTimeout(resolve, 100));

      const videoStream = this.compositeCanvas.captureStream(30);
      const videoTrack = videoStream.getVideoTracks()[0];

      if (!videoTrack) {
        throw new Error('No video track available from canvas');
      }

      this.stream = new MediaStream([videoTrack]);

      await this.connectWHIP();
    } catch (error) {
      await this.cleanup();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async connectWHIP() {
    if (!this.stream) {
      throw new Error('No stream available');
    }

    this.pc = new RTCPeerConnection();

    this.pc.addTransceiver('video', {
      direction: 'sendonly',
      streams: [this.stream],
    });

    this.pc.onconnectionstatechange = () => {
      if (this.pc?.connectionState === 'failed') {
        this.cleanup();
      }
    };

    try {
      const offer = await this.pc.createOffer();

      await this.pc.setLocalDescription(offer);

      const whipEndpoint = config.whipUrl;
      const streamUrl = `${this.webrtcUrl}/${this.streamKey}`;

      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api: whipEndpoint,
          streamurl: streamUrl,
          sdp: offer.sdp,
        }),
      });

      const jsonResponse = await response.json();

      if (jsonResponse.code !== 0 || !jsonResponse.sdp) {
        throw new Error(`WHIP Error: ${JSON.stringify(jsonResponse)}`);
      }

      await this.pc.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: jsonResponse.sdp,
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  private async cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.pc) {
      const senders = this.pc.getSenders();
      for (const sender of senders) {
        await this.pc.removeTrack(sender);
      }

      this.pc.close();
      this.pc = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    this.canvasInputs = null;
  }

  stop() {
    this.cleanup();
  }
}
