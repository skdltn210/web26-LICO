import { useState } from 'react';
import { LuCopy, LuEye, LuEyeOff } from 'react-icons/lu';
import Toast from '@components/common/Toast';
import { config } from '@config/env';

interface StreamSettingsProps {
  streamKey: string;
}

export default function StreamSettings({ streamKey }: StreamSettingsProps) {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
  });

  const streamUrl = config.streamUrl;

  const copyToClipboard = (text: string, type: 'URL이' | '키가') => {
    navigator.clipboard.writeText(text);
    setToast({
      isOpen: true,
      message: `스트림 ${type} 복사되었습니다.`,
    });
  };

  const maskStreamKey = (key: string) => {
    return showStreamKey ? key : '•'.repeat(key.length);
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="streamUrl" className="mb-2 block font-bold text-sm text-lico-gray-1">
            스트림 URL
          </label>
          <div className="flex gap-2">
            <input
              id="streamUrl"
              type="text"
              readOnly
              className="flex-1 rounded bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1 outline-none"
              value={streamUrl}
              aria-label="스트림 URL"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(streamUrl, 'URL이')}
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
                type="text"
                readOnly
                className="w-full rounded bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1 outline-none"
                value={maskStreamKey(streamKey)}
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
              onClick={() => streamKey && copyToClipboard(streamKey, '키가')}
              className="flex items-center justify-center rounded bg-lico-gray-3 px-3 text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
              aria-label="스트림 키 복사"
            >
              <LuCopy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <Toast
        message={toast.message}
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 transform"
        toastClassName="rounded-md bg-lico-gray-4 px-4 py-2 text-center font-medium text-lico-gray-1"
      />
    </>
  );
}
