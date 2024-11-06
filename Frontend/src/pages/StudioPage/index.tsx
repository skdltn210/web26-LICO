import VideoPlayer from '@/components/VideoPlayer';
// import CategoryBadge from '@/components/common/Badges/CategoryBadge';
import { LuPlay, LuSettings, LuGlobe } from 'react-icons/lu';

export default function StudioPage() {
  return (
    <>
      <VideoPlayer streamUrl="" />
      <form className="flex w-full max-w-4xl flex-col gap-3 p-3">
        <div>
          <label className="mb-1 block font-bold text-lico-gray-1">방송 제목</label>
          <input
            type="text"
            className="w-full rounded bg-lico-gray-4 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-lico-gray-1">방송 설명</label>
          <textarea className="h-24 w-full resize-none overflow-y-auto rounded bg-lico-gray-4 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2" />
        </div>

        <div>
          <label className="mb-1 block font-bold text-lico-gray-1">카테고리</label>
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-md bg-lico-gray-3 px-2 py-1 font-medium text-sm text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2">
              추가
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded bg-lico-orange-2 px-4 py-2 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
          >
            <LuPlay className="-mt-0.5 h-4 w-4" />
            방송 시작하기
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded bg-lico-gray-3 px-4 py-2 font-medium text-lico-gray-1 transition-colors hover:bg-lico-gray-1 hover:text-lico-orange-2"
          >
            <LuSettings className="-mt-0.5 h-4 w-4" />
            OBS 설정
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded bg-lico-gray-3 px-4 py-2 font-medium text-lico-gray-1 transition-colors hover:bg-lico-gray-1 hover:text-lico-orange-2"
          >
            <LuGlobe className="-mt-0.5 h-4 w-4" />
            WebOBS 설정
          </button>
        </div>
      </form>
    </>
  );
}
