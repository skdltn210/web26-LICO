import { useState, useEffect } from 'react';

interface StreamingTimerProps {
  startAt: string | Date;
}

function StreamingTimer({ startAt }: StreamingTimerProps) {
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    const updateDuration = () => {
      const startTime = new Date(startAt).getTime();
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const h = Math.floor(diff / 3600)
        .toString()
        .padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const s = Math.floor(diff % 60)
        .toString()
        .padStart(2, '0');
      setDuration(`${h}:${m}:${s}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [startAt]);

  return <div className="text-xs text-lico-gray-2">{duration} 스트리밍 중</div>;
}

export default StreamingTimer;
