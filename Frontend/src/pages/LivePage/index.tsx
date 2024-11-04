import VideoPlayer from '@components/common/VideoPlayer';
import LiveInfo from '@components/common/LiveInfo';
import StreamerInfo from '@components/common/LiveInfo/StreamerInfo';

export default function LivePage() {
  return (
    <>
      <VideoPlayer streamUrl="" />
      <LiveInfo />
      <StreamerInfo />
    </>
  );
}
