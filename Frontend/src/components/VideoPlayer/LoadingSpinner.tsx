import { PiOrange } from 'react-icons/pi';

interface LoadingSpinnerProps {
  size?: number;
}

export default function LoadingSpinner({ size = 64 }: LoadingSpinnerProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute text-lico-orange-2">
          <PiOrange size={size} />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-fill-orange text-lico-orange-1">
            <PiOrange size={size} />
          </div>
        </div>
      </div>
    </div>
  );
}
