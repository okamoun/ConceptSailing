import StarRating from './StarRating';
import type { Review } from '../../lib/reviews';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export default function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const date = review.confirmedAt?.toDate?.()?.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  }) ?? '';

  return (
    <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white text-sm">{review.name}</p>
          {date && <p className="text-blue-200 text-xs">{date}</p>}
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      <div>
        <h3 className="text-white font-semibold text-sm mb-1">{review.title}</h3>
        <p className={`text-blue-100 text-xs leading-relaxed ${compact ? 'line-clamp-4' : ''}`}>
          {review.description}
        </p>
      </div>

      {!compact && review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-1">
          {review.photos.map((url, i) => (
            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
