import { useUserProfile } from '@hooks/useUser';
import LoadingSpinner from '@components/common/LoadingSpinner';

interface ChatProfileModalProps {
  userId: number | null;
  onClose: () => void;
  anchorEl: HTMLElement;
}

const MODAL_HEIGHT = 144;
const MODAL_MARGIN = 4;
const INPUT_HEIGHT = 81;

function ChatProfileModal({ userId, onClose, anchorEl }: ChatProfileModalProps) {
  const { data: profile, isLoading } = useUserProfile(userId || 0);

  if (!userId || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <>
      <button type="button" aria-label="모달 닫기" className="fixed inset-0 z-10 cursor-default" onClick={onClose} />
      <div
        className="absolute z-30 flex min-h-36 w-80 items-center justify-center rounded-lg border-2 border-lico-orange-2 bg-lico-gray-4 p-4"
        style={{
          top:
            window.innerHeight - rect.bottom > INPUT_HEIGHT + MODAL_HEIGHT
              ? `${rect.bottom + MODAL_MARGIN}px`
              : `${rect.top - MODAL_HEIGHT - MODAL_MARGIN}px`,
          left: '16px',
        }}
      >
        <div className="text-center">
          {isLoading && <LoadingSpinner />}

          {profile && (
            <>
              <img
                src={profile.profile_image}
                alt={`${profile.nickname}님의 프로필`}
                className="mx-auto mb-1 h-14 w-14 rounded-full"
              />
              <p className="mb-1 font-bold text-lico-gray-1">{profile.nickname}</p>
              <p className="text-sm text-lico-gray-2">가입: {new Date(profile.created_at).toLocaleDateString()}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatProfileModal;
