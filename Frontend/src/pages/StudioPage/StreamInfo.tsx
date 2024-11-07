import { LuSearch } from 'react-icons/lu';

export default function StreamInfo() {
  return (
    <form className="flex flex-col gap-6" aria-label="방송 정보 설정">
      <div>
        <label htmlFor="title" className="mb-2 block font-bold text-lico-gray-1">
          방송 제목
        </label>
        <input
          id="title"
          type="text"
          className="w-full rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
          aria-label="방송 제목"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block font-bold text-lico-gray-1">
          방송 설명
        </label>
        <textarea
          id="description"
          className="h-24 w-full resize-none overflow-y-auto rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
          aria-label="방송 설명"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block font-bold text-lico-gray-1">
          카테고리
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LuSearch className="h-4 w-4 text-lico-gray-2" aria-hidden="true" />
          </div>
          <input
            id="category"
            type="text"
            className="w-full rounded bg-lico-gray-5 py-2 pl-9 pr-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            placeholder="카테고리 검색"
            aria-label="카테고리 검색"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="mb-2 block font-bold text-lico-gray-1">
          태그<span className="text-lico-gray-2"> (최대 5개)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="tags"
            type="text"
            className="flex-1 rounded bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            placeholder="태그 입력"
            aria-label="태그 입력"
          />
          <button
            type="button"
            className="whitespace-nowrap rounded-md bg-lico-gray-3 px-3 py-2 font-medium text-sm text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
            aria-label="태그 추가"
          >
            추가
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded bg-lico-orange-2 px-4 py-2 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
        aria-label="방송 정보 업데이트"
      >
        업데이트
      </button>
    </form>
  );
}
