'use client';

import { useState } from 'react';

interface Props {
  value: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (v: number) => void;
}

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function StarRating({
  value,
  readonly = false,
  size = 'md',
  onChange,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered !== null ? hovered : value;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        return (
          <span
            key={star}
            className={`
              ${SIZE_CLASS[size]}
              ${filled ? 'text-yellow-400' : 'text-gray-300'}
              ${!readonly ? 'cursor-pointer transition-colors' : ''}
            `}
            onMouseEnter={!readonly ? () => setHovered(star) : undefined}
            onMouseLeave={!readonly ? () => setHovered(null) : undefined}
            onClick={!readonly ? () => onChange?.(star) : undefined}
            role={!readonly ? 'button' : undefined}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            {filled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
}
