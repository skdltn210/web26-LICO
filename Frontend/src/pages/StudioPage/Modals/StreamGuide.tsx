import { LuX } from 'react-icons/lu';

interface StreamGuideProps {
  onClose: () => void;
}

export default function StreamGuide({ onClose }: StreamGuideProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-lico-gray-4 px-6 py-4">
        <div className="relative mb-4 items-center justify-center">
          <div className="text-center">
            <h2 className="font-bold text-2xl text-lico-gray-1">스트리밍 가이드</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded p-1 text-lico-gray-1 hover:text-lico-orange-2"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-bold text-lico-gray-1">외부 송출 프로그램으로 방송 시작하기</h3>
            <ul className="space-y-1 font-medium text-sm text-lico-gray-2">
              <li>
                •{' '}
                <a
                  href="https://obsproject.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lico-orange-2 hover:text-lico-orange-1"
                >
                  Open Broadcaster Software (OBS)
                </a>{' '}
                또는{' '}
                <a
                  href="https://prismlive.com/ko_kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lico-orange-2 hover:text-lico-orange-1"
                >
                  PRISM Live Studio
                </a>{' '}
                를 다운로드하세요.
              </li>
              <li>• 설정 &gt; 방송에서 서비스를 사용자 지정으로 설정하고 스트림 URL과 스트림 키를 붙여 넣어주세요.</li>
              <li>• 방송 시작 버튼을 눌러 스트리밍을 시작하세요.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-lico-gray-1">웹 스튜디오로 간단하게 방송 시작하기</h3>
            <ul className="space-y-1 font-medium text-sm text-lico-gray-2">
              <li>• 웹 스튜디오 탭을 선택하세요.</li>
              <li>• 화면 공유, 카메라, 오디오 권한을 허용하세요.</li>
              <li>• 원하는 화면, 카메라, 마이크를 선택 후 방송을 시작하세요.</li>
              <li className="text-lico-orange-2">
                • 송출 브라우저가 최소화되거나 탭이 맨 앞에 있지 않다면 송출이 매끄럽지 않을 수 있습니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-lico-orange-2 px-4 py-2 font-medium text-white transition-colors hover:bg-lico-orange-1"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
