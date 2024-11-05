import VideoPlayer from '@/components/VideoPlayer';
import LiveInfo from '@/components/LiveInfo';
import StreamerInfo from '@/components/LiveInfo/StreamerInfo';

export default function LivePage() {
  return (
    <>
      <VideoPlayer streamUrl="" />
      <LiveInfo />
      <StreamerInfo />
    </>
  );
}
