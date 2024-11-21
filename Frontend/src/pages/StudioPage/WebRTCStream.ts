export class WebRTCStream {
  private canvas: HTMLCanvasElement | null;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private mediaStream: MediaStream | null;
  private screenAudioStream: MediaStream | null;
  private micAudioStream: MediaStream | null;
  private baseUrl: string;
  private originUrl: string;

  constructor(url: string, streamKey: string) {
    this.canvas = null;
    this.originUrl = url;
    const serverUrl = new URL(url.replace('webrtc://', 'https://'));
    this.baseUrl = `https://${serverUrl.hostname}`;
    this.streamKey = streamKey;
    this.pc = null;
    this.mediaStream = null;
    this.screenAudioStream = null;
    this.micAudioStream = null;
  }

  async start(canvas: HTMLCanvasElement, screenStream: MediaStream | null, mediaStream: MediaStream | null) {
    try {
      this.canvas = canvas;
      const videoStream = this.canvas.captureStream(30);
      this.mediaStream = new MediaStream([...videoStream.getVideoTracks()]);

      if (screenStream) {
        this.screenAudioStream = screenStream;
        const screenAudioTracks = this.screenAudioStream.getAudioTracks();
        screenAudioTracks.forEach(track => {
          this.mediaStream?.addTrack(track.clone());
        });
      }

      if (mediaStream) {
        this.micAudioStream = mediaStream;
        const micAudioTracks = this.micAudioStream.getAudioTracks();
        micAudioTracks.forEach(track => {
          this.mediaStream?.addTrack(track.clone());
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

    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach(track => {
        if (this.mediaStream) {
          this.pc?.addTrack(track, this.mediaStream);
        }
      });
    }

    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const whipEndpoint = `${this.baseUrl}/rtc/v1/publish/`;
      const streamUrl = `${this.originUrl}/dev/${this.streamKey}`;

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

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.screenAudioStream) {
      this.screenAudioStream.getTracks().forEach(track => track.stop());
      this.screenAudioStream = null;
    }

    if (this.micAudioStream) {
      this.micAudioStream.getTracks().forEach(track => track.stop());
      this.micAudioStream = null;
    }

    this.canvas = null;
  }
}
