import { config } from '@config/env';

interface CanvasInputs {
  streamCanvas: HTMLCanvasElement;
  imageTextCanvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  interactionCanvas: HTMLCanvasElement;
  containerWidth: number;
  containerHeight: number;
}

export class WebRTCStream {
  private pc: RTCPeerConnection | null;
  private trackSenders: Map<string, RTCRtpSender>;
  private webrtcUrl: string;
  private streamKey: string;
  private compositeCanvas: HTMLCanvasElement;
  private animationFrameId: number | null;
  private canvasInputs: CanvasInputs | null;
  private isConnecting: boolean = false;
  private _isStarted: boolean = false;

  constructor(url: string, streamKey: string) {
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.trackSenders = new Map();
    this.animationFrameId = null;
    this.canvasInputs = null;
    this.compositeCanvas = document.createElement('canvas');
  }

  async updateStreams(screenStream: MediaStream | null, mediaStream: MediaStream | null) {
    if (!this.pc) {
      return this.start(this.canvasInputs!, screenStream, mediaStream);
    }

    try {
      const videoStream = this.compositeCanvas.captureStream(30);
      const videoTrack = videoStream.getVideoTracks()[0];
      const videoSender = this.trackSenders.get('composite-video');

      if (videoSender && videoTrack) {
        await videoSender.replaceTrack(videoTrack);
      }

      if (screenStream?.getAudioTracks().length) {
        const screenAudio = screenStream.getAudioTracks()[0];
        const screenSender = this.trackSenders.get('screen-audio');

        if (screenSender) {
          await screenSender.replaceTrack(screenAudio);
        } else {
          const newSender = this.pc.addTrack(screenAudio);
          this.trackSenders.set('screen-audio', newSender);
        }
      } else {
        const screenSender = this.trackSenders.get('screen-audio');
        if (screenSender) {
          this.pc.removeTrack(screenSender);
          this.trackSenders.delete('screen-audio');
        }
      }

      if (mediaStream?.getAudioTracks().length) {
        const micAudio = mediaStream.getAudioTracks()[0];
        const micSender = this.trackSenders.get('mic-audio');

        if (micSender) {
          await micSender.replaceTrack(micAudio);
        } else {
          const newSender = this.pc.addTrack(micAudio);
          this.trackSenders.set('mic-audio', newSender);
        }
      } else {
        const micSender = this.trackSenders.get('mic-audio');
        if (micSender) {
          this.pc.removeTrack(micSender);
          this.trackSenders.delete('mic-audio');
        }
      }
    } catch (error) {
      console.error('Error updating streams:', error);
      await this.start(this.canvasInputs!, screenStream, mediaStream);
    }
  }

  public isStarted(): boolean {
    return this._isStarted;
  }

  async start(canvasInputs: CanvasInputs, screenStream: MediaStream | null, mediaStream: MediaStream | null) {
    if (this.isConnecting) return;

    try {
      this.isConnecting = true;
      await this.cleanup();

      this.canvasInputs = canvasInputs;
      this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);

      await new Promise(resolve => setTimeout(resolve, 100));

      this.pc = new RTCPeerConnection({
        iceServers: [],
      });

      const videoStream = this.compositeCanvas.captureStream(30);
      const videoTrack = videoStream.getVideoTracks()[0];

      if (!videoTrack) {
        throw new Error('No video track available from canvas');
      }

      const videoSender = this.pc.addTrack(videoTrack);
      this.trackSenders.set('composite-video', videoSender);

      if (screenStream?.getAudioTracks().length) {
        const screenSender = this.pc.addTrack(screenStream.getAudioTracks()[0]);
        this.trackSenders.set('screen-audio', screenSender);
      }

      if (mediaStream?.getAudioTracks().length) {
        const micSender = this.pc.addTrack(mediaStream.getAudioTracks()[0]);
        this.trackSenders.set('mic-audio', micSender);
      }

      await this.connectWHIP();
      this._isStarted = true;
    } catch (error) {
      await this.cleanup();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async connectWHIP() {
    if (!this.pc) {
      throw new Error('No PeerConnection available');
    }

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

  private updateCompositeCanvas = () => {
    if (!this.canvasInputs) return;

    const { streamCanvas, imageTextCanvas, drawCanvas, interactionCanvas, containerWidth, containerHeight } =
      this.canvasInputs;
    const ctx = this.compositeCanvas.getContext('2d');
    if (!ctx) return;

    const scale = window.devicePixelRatio;
    this.compositeCanvas.width = Math.floor(containerWidth * scale);
    this.compositeCanvas.height = Math.floor(containerHeight * scale);

    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    try {
      ctx.drawImage(streamCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(imageTextCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(drawCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(interactionCanvas, 0, 0, containerWidth, containerHeight);
    } catch (error) {
      console.error('Error drawing on composite canvas:', error);
    }

    this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);
  };

  private async cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.pc) {
      this.trackSenders.clear();
      this.pc.close();
      this.pc = null;
    }

    this._isStarted = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    this.canvasInputs = null;
  }

  stop() {
    this.cleanup();
  }
}
