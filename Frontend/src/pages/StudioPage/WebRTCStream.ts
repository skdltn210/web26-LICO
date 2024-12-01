import { config } from '@config/env';

export class WebRTCStream {
  private compositeCanvas: HTMLCanvasElement | null;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private stream: MediaStream | null;
  private webrtcUrl: string;

  constructor(url: string, streamKey: string) {
    this.compositeCanvas = null;
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.stream = null;
  }

  async start(compositeCanvas: HTMLCanvasElement) {
    try {
      this.compositeCanvas = compositeCanvas;

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
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.compositeCanvas = null;
  }
}
