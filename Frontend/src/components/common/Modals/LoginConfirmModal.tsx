import { useNavigate } from 'react-router-dom';

interface LoginConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginConfirmModal({
  isOpen,
  onClose,
  message = '이 기능을 사용하기 위해서는 로그인이 필요합니다.',
}: LoginConfirmModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" aria-label="모달 닫기" className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-2xl border-2 border-lico-orange-2 bg-lico-gray-5 p-6">
        <div className="mb-4 flex justify-center font-bold text-2xl text-lico-orange-2">로그인이 필요합니다</div>
        <p className="mb-6 flex justify-center font-medium text-lg text-lico-gray-2">{message}</p>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-md border border-lico-gray-3 bg-lico-gray-5 px-3 py-2 font-bold text-base text-lico-gray-2 hover:bg-lico-gray-4"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="w-1/2 rounded-md bg-lico-orange-2 px-3 py-2 font-bold text-base text-lico-gray-1 hover:bg-lico-orange-1"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
