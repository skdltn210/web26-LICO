import { config } from '@config/env';

export class WebRTCStream {
  private videoCanvas: HTMLCanvasElement | null;
  private drawingCanvas: HTMLCanvasElement | null;
  private compositeCanvas: HTMLCanvasElement | null;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private screenStream: MediaStream | null;
  private camStream: MediaStream | null;
  private audioStream: MediaStream | null;
  private webrtcUrl: string;
  private animationFrame: number | null;

  constructor(url: string, streamKey: string) {
    this.videoCanvas = null;
    this.drawingCanvas = null;
    this.compositeCanvas = null;
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.camStream = null;
    this.screenStream = null;
    this.audioStream = null;
    this.animationFrame = null;
  }

  async start(
    videoCanvas: HTMLCanvasElement,
    drawingCanvas: HTMLCanvasElement,
    screenStream: MediaStream | null,
    camStream: MediaStream | null,
  ) {
    try {
      this.videoCanvas = videoCanvas;
      this.drawingCanvas = drawingCanvas;

      this.compositeCanvas = document.createElement('canvas');
      this.compositeCanvas.width = videoCanvas.width;
      this.compositeCanvas.height = videoCanvas.height;

      this.startCompositing();

      const videoStream = this.compositeCanvas.captureStream(30);
      this.camStream = new MediaStream([...videoStream.getVideoTracks()]);

      if (screenStream) {
        this.screenStream = screenStream;
        const screenAudioTracks = this.screenStream.getAudioTracks();
        screenAudioTracks.forEach(track => {
          this.camStream?.addTrack(track.clone());
        });
      }

      if (camStream) {
        this.audioStream = camStream;
        const micAudioTracks = this.audioStream.getAudioTracks();
        micAudioTracks.forEach(track => {
          this.camStream?.addTrack(track.clone());
        });
      }

      await this.connectWHIP();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private startCompositing() {
    if (!this.compositeCanvas || !this.videoCanvas || !this.drawingCanvas) return;

    const ctx = this.compositeCanvas.getContext('2d');
    if (!ctx) return;

    const updateFrame = () => {
      ctx.drawImage(this.videoCanvas!, 0, 0);
      ctx.drawImage(this.drawingCanvas!, 0, 0);

      this.animationFrame = requestAnimationFrame(updateFrame);
    };

    updateFrame();
  }

  private async connectWHIP() {
    this.pc = new RTCPeerConnection({
      iceServers: [],
    });

    if (this.camStream) {
      const tracks = this.camStream.getTracks();
      tracks.forEach(track => {
        if (this.camStream) {
          this.pc?.addTrack(track, this.camStream);
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
      console.log(jsonResponse);

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
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.camStream) {
      this.camStream.getTracks().forEach(track => track.stop());
      this.camStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.videoCanvas = null;
    this.drawingCanvas = null;
    this.compositeCanvas = null;
  }
}
