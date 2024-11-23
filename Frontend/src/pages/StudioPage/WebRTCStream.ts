import { config } from '@config/env';

export class WebRTCStream {
  private canvas: HTMLCanvasElement | null;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private screenStream: MediaStream | null;
  private camStream: MediaStream | null;
  private audioStream: MediaStream | null;
  private webrtcUrl: string;

  constructor(url: string, streamKey: string) {
    this.canvas = null;
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.camStream = null;
    this.screenStream = null;
    this.audioStream = null;
  }

  async start(canvas: HTMLCanvasElement, screenStream: MediaStream | null, camStream: MediaStream | null) {
    try {
      this.canvas = canvas;
      const videoStream = this.canvas.captureStream(30);
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

    this.canvas = null;
  }
}
