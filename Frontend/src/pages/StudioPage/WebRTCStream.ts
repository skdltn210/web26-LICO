export class WebRTCStream {
  private canvas: HTMLCanvasElement | null;
  private url: string;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private ws: WebSocket | null;
  private mediaStream: MediaStream | null;
  private screenAudioStream: MediaStream | null;
  private micAudioStream: MediaStream | null;

  constructor(url: string, streamKey: string) {
    this.canvas = null;
    this.url = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.ws = null;
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

      await this.connectSignaling();
    } catch (error) {
      console.error('Streaming failed:', error);
      this.cleanup();
      throw error;
    }
  }

  private getStreamInfo(): string {
    return (
      `Canvas: ${this.canvas ? 'active' : 'inactive'}, ` +
      `Screen Audio: ${this.screenAudioStream?.getAudioTracks().length || 0} tracks, ` +
      `Mic Audio: ${this.micAudioStream?.getAudioTracks().length || 0} tracks`
    );
  }

  private async connectSignaling() {
    return new Promise((resolve, reject) => {
      const wsUrl = this.url.replace('webrtc://', 'wss://');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Stream configuration:', this.getStreamInfo());
        this.sendSignaling({
          type: 'connect',
          streamKey: this.streamKey,
        });
        resolve(null);
      };

      this.ws.onmessage = async e => {
        const message = JSON.parse(e.data);
        await this.handleSignalingMessage(message);
      };

      this.ws.onerror = reject;
    });
  }

  private async handleSignalingMessage(message: any) {
    switch (message.type) {
      case 'offer':
        await this.handleOffer(message.sdp);
        break;
      case 'candidate':
        await this.handleCandidate(message.candidate);
        break;
    }
  }

  private async handleOffer(sdp: string) {
    this.pc = new RTCPeerConnection();

    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach(track => {
        if (this.mediaStream) {
          this.pc?.addTrack(track, this.mediaStream);
        }
      });
    }

    this.pc.onicecandidate = event => {
      if (event.candidate) {
        this.sendSignaling({
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    await this.pc.setRemoteDescription(
      new RTCSessionDescription({
        type: 'offer',
        sdp: sdp,
      }),
    );

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.sendSignaling({
      type: 'answer',
      sdp: answer.sdp,
    });
  }

  private async handleCandidate(candidate: RTCIceCandidateInit) {
    if (this.pc && candidate) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private sendSignaling(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
