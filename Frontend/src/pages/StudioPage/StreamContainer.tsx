import { useEffect, useRef, useState, CSSProperties } from 'react';
import { Rnd } from 'react-rnd';
import type { ResizeEnable } from 'react-rnd';

interface StreamContainerProps {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isCamFlipped: boolean;
  isStreaming: boolean;
}

export default function StreamContainer({
  screenStream,
  mediaStream,
  isCamFlipped,
  isStreaming,
}: StreamContainerProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const [selectedContainer, setSelectedContainer] = useState<'screen' | 'media' | null>(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (mediaVideoRef.current && mediaStream) {
      mediaVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.rnd-container')) {
        setSelectedContainer(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStyle: CSSProperties = {
    width: '10px',
    height: '10px',
    background: 'white',
    borderRadius: '50%',
    border: '2px solid #666',
    position: 'absolute' as const,
  };

  const resizeHandleStyles = {
    topLeft: {
      ...handleStyle,
      top: '-5px',
      left: '-5px',
      cursor: 'nw-resize',
    } as CSSProperties,
    topRight: {
      ...handleStyle,
      top: '-5px',
      right: '-5px',
      cursor: 'ne-resize',
    } as CSSProperties,
    bottomLeft: {
      ...handleStyle,
      bottom: '-5px',
      left: '-5px',
      cursor: 'sw-resize',
    } as CSSProperties,
    bottomRight: {
      ...handleStyle,
      bottom: '-5px',
      right: '-5px',
      cursor: 'se-resize',
    } as CSSProperties,
  };

  const enableResizing: ResizeEnable = {
    top: false,
    right: false,
    bottom: false,
    left: false,
    topRight: true,
    bottomRight: true,
    bottomLeft: true,
    topLeft: true,
  };

  return (
    <div className="relative h-full w-full bg-black">
      {screenStream && (
        <Rnd
          default={{
            x: 0,
            y: 0,
            width: '100%',
            height: '100%',
          }}
          bounds="parent"
          minWidth="20%"
          minHeight="20%"
          className={`rnd-container ${selectedContainer === 'screen' ? 'ring-2 ring-white' : ''}`}
          onClick={() => setSelectedContainer('screen')}
          resizeHandleStyles={selectedContainer === 'screen' ? resizeHandleStyles : undefined}
          enableResizing={selectedContainer === 'screen' ? enableResizing : false}
          disableDragging={!selectedContainer || selectedContainer !== 'screen'}
        >
          <video ref={screenVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
        </Rnd>
      )}
      {mediaStream && (
        <Rnd
          default={{
            x: 20,
            y: 20,
            width: '25%',
            height: '25%',
          }}
          bounds="parent"
          minWidth="10%"
          minHeight="10%"
          className={`rnd-container z-10 ${selectedContainer === 'media' ? 'ring-2 ring-white' : ''}`}
          onClick={() => setSelectedContainer('media')}
          resizeHandleStyles={selectedContainer === 'media' ? resizeHandleStyles : undefined}
          enableResizing={selectedContainer === 'media' ? enableResizing : false}
          disableDragging={!selectedContainer || selectedContainer !== 'media'}
        >
          <video
            ref={mediaVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover ${isCamFlipped ? 'scale-x-[-1]' : ''}`}
          />
        </Rnd>
      )}
    </div>
  );
}
