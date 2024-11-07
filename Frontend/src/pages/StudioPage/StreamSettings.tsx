import { LuCopy, LuEye, LuEyeOff } from 'react-icons/lu';

interface StreamSettingsProps {
  showStreamKey: boolean;
  setShowStreamKey: (show: boolean) => void;
}

export default function StreamSettings({ showStreamKey, setShowStreamKey }: StreamSettingsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor="streamUrl" className="mb-2 block font-bold text-sm text-lico-gray-1">
          스트림 URL
        </label>
        <div className="flex gap-2">
          <input
            id="streamUrl"
            type="text"
            readOnly
            className="flex-1 rounded bg-lico-gray-4 p-2 font-medium text-sm text-lico-gray-1 outline-none"
            value="rtmp://stream.example.com/live"
            aria-label="스트림 URL"
          />
          <button
            type="button"
            onClick={() => copyToClipboard('rtmp://stream.example.com/live')}
            className="flex items-center justify-center rounded bg-lico-gray-3 px-3 text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
            aria-label="스트림 URL 복사"
          >
            <LuCopy className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="streamKey" className="mb-2 block font-bold text-sm text-lico-gray-1">
          스트림 키
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="streamKey"
              type={showStreamKey ? 'text' : 'password'}
              readOnly
              className="w-full rounded bg-lico-gray-4 p-2 font-medium text-sm text-lico-gray-1 outline-none"
              value="xxxx-xxxx-xxxx-xxxx"
              aria-label="스트림 키"
            />
            <button
              type="button"
              onClick={() => setShowStreamKey(!showStreamKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-lico-gray-1 hover:text-lico-orange-2"
              aria-label={showStreamKey ? '스트림 키 숨기기' : '스트림 키 보기'}
            >
              {showStreamKey ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard('xxxx-xxxx-xxxx-xxxx')}
            className="flex items-center justify-center rounded bg-lico-gray-3 px-3 text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
            aria-label="스트림 키 복사"
          >
            <LuCopy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
