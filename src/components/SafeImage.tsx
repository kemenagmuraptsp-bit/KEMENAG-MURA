import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, className = '', fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-emerald-100 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8 text-emerald-300/70 mb-2" />
        <span className="text-xs font-medium tracking-wide text-emerald-200/80 max-w-[200px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
