import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/useAuthStore';
import { LuCamera } from 'react-icons/lu';
import { useRef, useState } from 'react';
import { useUpdateProfile } from '@hooks/useUser';
import Toast from '@components/common/Toast';

export default function MyPage() {
  const { userId } = useParams<{ userId: string }>();
  const user = useAuthStore(state => state.user);
  const updateProfileMutation = useUpdateProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState(user?.profileImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
  });

  if (user && user.id !== Number(userId)) {
    return <Navigate to="/" replace />;
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    const nickname = nicknameInputRef.current?.value;
    if (!nickname) {
      setToast({
        isOpen: true,
        message: '닉네임을 입력해주세요.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('nickname', nickname);
    if (selectedFile) {
      formData.append('profile_image', selectedFile);
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        formData,
      });

      setToast({
        isOpen: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
      });
    } catch (error) {
      setToast({
        isOpen: true,
        message: '프로필 업데이트에 실패했습니다.',
      });
      console.error('Profile update error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">마이페이지</div>
      <div className="relative mx-4 rounded-lg bg-lico-gray-4 p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div
              className="group relative h-40 w-40 cursor-pointer overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-lico-orange-2"
              onClick={handleImageClick}
            >
              <img
                src={previewImage}
                alt="프로필 이미지"
                className="h-full w-full object-cover transition-opacity group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <LuCamera className="h-8 w-8 text-lico-orange-2" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="w-full max-w-md space-y-2">
            <label htmlFor="nickname" className="block font-bold text-sm text-lico-gray-1">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              ref={nicknameInputRef}
              defaultValue={user?.nickname}
              className="w-full rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none transition-all focus:ring-2 focus:ring-lico-orange-2"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-6 rounded bg-lico-orange-2 px-6 py-2 font-bold text-white transition-colors hover:bg-lico-orange-1"
          >
            프로필 수정
          </button>

          <Toast
            message={toast.message}
            isOpen={toast.isOpen}
            onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            className="absolute inset-x-0 -bottom-32 flex justify-center"
            toastClassName="rounded-md bg-lico-gray-4 px-4 py-2 text-center font-medium text-lico-gray-1"
          />
        </div>
      </div>
    </div>
  );
}
