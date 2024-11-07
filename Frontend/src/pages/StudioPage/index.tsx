import VideoPlayer from '@/components/VideoPlayer';
import {
  LuSearch,
  LuPlay,
  LuCamera,
  LuMonitor,
  LuCopy,
  LuEye,
  LuEyeOff,
  LuImage,
  LuType,
  LuPencil,
  LuSparkles,
} from 'react-icons/lu';
import { useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';

type StreamType = 'OBS' | 'WebOBS';

export default function StudioPage() {
  const [streamType, setStreamType] = useState<StreamType>('OBS');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [imageEnabled, setImageEnabled] = useState(false);
  const [textEnabled, setTextEnabled] = useState(false);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [arEnabled, setArEnabled] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6">
        <div className="mb-4 font-bold text-2xl text-lico-gray-1">스튜디오</div>
        <div className="mt-4">
          <VideoPlayer streamUrl="" />
        </div>

        <div className="mt-4">
          <div className="flex justify-end">
            <div className="inline-flex rounded-lg bg-lico-gray-4 p-1">
              <button
                type="button"
                onClick={() => setStreamType('OBS')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  streamType === 'OBS'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
              >
                OBS
              </button>
              <button
                type="button"
                onClick={() => setStreamType('WebOBS')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  streamType === 'WebOBS'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
              >
                WebOBS
              </button>
            </div>
          </div>

          {streamType === 'OBS' ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block font-bold text-sm text-lico-gray-1">스트림 URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="flex-1 rounded bg-lico-gray-4 p-2 font-medium text-sm text-lico-gray-1 outline-none"
                    value="rtmp://stream.example.com/live"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard('rtmp://stream.example.com/live')}
                    className="flex items-center justify-center rounded bg-lico-gray-3 px-3 text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
                  >
                    <LuCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block font-bold text-sm text-lico-gray-1">스트림 키</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showStreamKey ? 'text' : 'password'}
                      readOnly
                      className="w-full rounded bg-lico-gray-4 p-2 font-medium text-sm text-lico-gray-1 outline-none"
                      value="xxxx-xxxx-xxxx-xxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-lico-gray-1 hover:text-lico-orange-2"
                    >
                      {showStreamKey ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('xxxx-xxxx-xxxx-xxxx')}
                    className="flex items-center justify-center rounded bg-lico-gray-3 px-3 text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
                  >
                    <LuCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setScreenEnabled(!screenEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      screenEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuMonitor className="h-4 w-4" />
                    화면 공유
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebcamEnabled(!webcamEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      webcamEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuCamera className="h-4 w-4" />
                    웹캠
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageEnabled(!imageEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      imageEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuImage className="h-4 w-4" />
                    이미지
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextEnabled(!textEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      textEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuType className="h-4 w-4" />
                    텍스트
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawEnabled(!drawEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      drawEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuPencil className="h-4 w-4" />
                    그리기
                  </button>
                  <button
                    type="button"
                    onClick={() => setArEnabled(!arEnabled)}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium text-sm transition-colors ${
                      arEnabled
                        ? 'bg-lico-orange-2 text-lico-gray-5'
                        : 'bg-lico-gray-4 text-lico-gray-1 hover:text-lico-orange-2'
                    }`}
                  >
                    <LuSparkles className="h-4 w-4" />
                    AR
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-lico-orange-2 px-4 py-2.5 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
              >
                <LuPlay className="h-5 w-5" />
                방송 시작하기
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-96 bg-lico-gray-4 p-6">
        <form className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-bold text-lico-gray-1">방송 제목</label>
            <input
              type="text"
              className="w-full rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-lico-gray-1">방송 설명</label>
            <textarea className="h-24 w-full resize-none overflow-y-auto rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2" />
          </div>

          <div>
            <label className="mb-2 block font-bold text-lico-gray-1">카테고리</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LuSearch className="h-4 w-4 text-lico-gray-2" />
              </div>
              <input
                type="text"
                className="w-full rounded bg-lico-gray-5 py-2 pl-9 pr-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
                placeholder="카테고리 검색"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-bold text-lico-gray-1">
              태그<span className="text-lico-gray-2"> (최대 5개)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
                placeholder="태그 입력"
              />
              <button
                type="button"
                className="whitespace-nowrap rounded-md bg-lico-gray-3 px-3 py-2 font-medium text-sm text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
              >
                추가
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded bg-lico-orange-2 px-4 py-2 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
          >
            업데이트
          </button>
        </form>
      </div>

      <div className="w-80 border-x border-lico-gray-3 bg-lico-gray-4">
        <ChatWindow />
      </div>
    </div>
  );
}
