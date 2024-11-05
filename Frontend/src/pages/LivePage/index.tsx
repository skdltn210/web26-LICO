import { useParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import LiveInfo from '@/components/LiveInfo';
import StreamerInfo from '@/components/LiveInfo/StreamerInfo';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>잘못된 접근입니다.</div>;

  return (
    <>
      <VideoPlayer streamUrl="" />
      <LiveInfo channelId={id} />
      <StreamerInfo channelId={id} />
    </>
  );
}
