import { useEffect } from 'react';

interface ToastModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  toastClassName?: string;
}

export default function Toast({
  message,
  isOpen,
  onClose,
  className = 'fixed inset-x-0 bottom-24 z-50 flex justify-center',
  toastClassName = 'rounded-md bg-lico-gray-5/80 px-4 py-2 text-center font-medium text-lico-gray-1',
}: ToastModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={className}>
      <div className={toastClassName}>{message}</div>
    </div>
  );
}
