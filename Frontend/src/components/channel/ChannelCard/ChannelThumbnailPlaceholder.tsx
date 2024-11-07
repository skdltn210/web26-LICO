import { PiOrange } from 'react-icons/pi';

function ChannelThumbnailPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-lico-gray-4">
      <PiOrange color="#FF6B35" size={48} />
    </div>
  );
}

export default ChannelThumbnailPlaceholder;
