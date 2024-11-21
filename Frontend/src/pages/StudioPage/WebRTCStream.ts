export class WebRTCStream {
  private canvas: HTMLCanvasElement | null;
  private streamKey: string;
  private pc: RTCPeerConnection | null;
  private mediaStream: MediaStream | null;
  private screenAudioStream: MediaStream | null;
  private micAudioStream: MediaStream | null;
  private baseUrl: string;

  constructor(url: string, streamKey: string) {
    console.log('WebRTCStream initialized with:', { url, streamKey });
    this.canvas = null;
    const serverUrl = new URL(url.replace('webrtc://', 'https://'));
    this.baseUrl = `https://${serverUrl.hostname}:1985`;
    this.streamKey = streamKey;
    this.pc = null;
    this.mediaStream = null;
    this.screenAudioStream = null;
    this.micAudioStream = null;
  }

  async start(canvas: HTMLCanvasElement, screenStream: MediaStream | null, mediaStream: MediaStream | null) {
    console.log('Starting WebRTC stream with:', {
      canvas: !!canvas,
      hasScreenStream: !!screenStream,
      hasMediaStream: !!mediaStream,
    });

    try {
      this.canvas = canvas;
      const videoStream = this.canvas.captureStream(30);
      console.log('Canvas capture stream created:', {
        videoTracks: videoStream.getVideoTracks().length,
      });

      this.mediaStream = new MediaStream([...videoStream.getVideoTracks()]);
      console.log('Initial media stream created with video tracks');

      if (screenStream) {
        console.log('Adding screen audio tracks');
        this.screenAudioStream = screenStream;
        const screenAudioTracks = this.screenAudioStream.getAudioTracks();
        console.log('Screen audio tracks found:', screenAudioTracks.length);
        screenAudioTracks.forEach(track => {
          this.mediaStream?.addTrack(track.clone());
        });
      }

      if (mediaStream) {
        console.log('Adding microphone audio tracks');
        this.micAudioStream = mediaStream;
        const micAudioTracks = this.micAudioStream.getAudioTracks();
        console.log('Microphone audio tracks found:', micAudioTracks.length);
        micAudioTracks.forEach(track => {
          this.mediaStream?.addTrack(track.clone());
        });
      }

      console.log('Final media stream configuration:', {
        videoTracks: this.mediaStream?.getVideoTracks().length,
        audioTracks: this.mediaStream?.getAudioTracks().length,
      });

      await this.connectWHIP();
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

  private async connectWHIP() {
    console.log('Starting WHIP connection process');

    this.pc = new RTCPeerConnection();
    console.log('RTCPeerConnection created');

    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      console.log('Adding tracks to peer connection:', tracks.length);
      tracks.forEach(track => {
        if (this.mediaStream) {
          this.pc?.addTrack(track, this.mediaStream);
        }
      });
    }

    // Connection state 변경 이벤트 리스너 추가
    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      console.log('Connection state changed:', state);
      if (state === 'connected') {
        console.log('WebRTC connection established successfully');
      }
    };

    console.log('Creating offer');
    const offer = await this.pc.createOffer();
    console.log('Offer created:', { sdpLength: offer.sdp?.length });

    console.log('Setting local description');
    await this.pc.setLocalDescription(offer);
    console.log('Local description set');

    const whipEndpoint = `${this.baseUrl}/rtc/v1/whip/?app=dev&stream=${this.streamKey}`;
    console.log('WHIP endpoint:', whipEndpoint);

    try {
      console.log('Sending WHIP request with SDP:', this.pc.localDescription?.sdp);
      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      console.log('WHIP response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WHIP error response:', errorText);
        throw new Error(`WHIP request failed with status ${response.status}: ${errorText}`);
      }

      const answer = await response.text();
      console.log('SDP answer received:', {
        answerLength: answer.length,
        answer: answer,
      });

      console.log('Setting remote description');
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: answer,
        }),
      );
      console.log('Remote description set');
      console.log('Stream configuration:', this.getStreamInfo());

      this.monitorConnection();
    } catch (error) {
      console.error('WHIP connection failed:', error);
      this.cleanup();
      throw error;
    }
  }

  private monitorConnection() {
    if (!this.pc) return;

    const interval = setInterval(() => {
      if (!this.pc) {
        clearInterval(interval);
        return;
      }

      console.log('Connection Status:', {
        connectionState: this.pc.connectionState,
        signalingState: this.pc.signalingState,
      });

      if (this.pc.connectionState === 'failed') {
        console.log('Connection lost, attempting to reconnect...');
        this.restartConnection();
      }
    }, 5000);
  }

  private async restartConnection() {
    if (!this.pc) return;

    try {
      console.log('Restarting connection');
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const whipEndpoint = `${this.baseUrl}/rtc/v1/whip/?app=dev&stream=${this.streamKey}`;
      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`Connection restart failed with status ${response.status}`);
      }

      const answer = await response.text();
      await this.pc.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: answer,
        }),
      );

      console.log('Connection restarted');
    } catch (error) {
      console.error('Connection restart failed:', error);
    }
  }

  stop() {
    console.log('Stopping WebRTC stream');
    this.cleanup();
  }

  private cleanup() {
    console.log('Starting cleanup');

    if (this.pc) {
      console.log('Closing peer connection');
      this.pc.close();
      this.pc = null;
    }

    if (this.mediaStream) {
      console.log('Stopping media stream tracks');
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.screenAudioStream) {
      console.log('Stopping screen audio tracks');
      this.screenAudioStream.getTracks().forEach(track => track.stop());
      this.screenAudioStream = null;
    }

    if (this.micAudioStream) {
      console.log('Stopping microphone audio tracks');
      this.micAudioStream.getTracks().forEach(track => track.stop());
      this.micAudioStream = null;
    }

    this.canvas = null;
    console.log('Cleanup complete');
  }
}
