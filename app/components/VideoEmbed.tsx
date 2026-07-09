'use client';

// Shared video embed. Renders a YouTube video (Short) in a responsive,
// vertically-oriented iframe.
const YOUTUBE_VIDEO_ID = 'KzGihArloV8';

const embedSrc = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&playsinline=1`;

type VideoEmbedProps = {
  title?: string;
  description?: string;
};

export default function VideoEmbed({
  title = 'See BlueOne in Action',
  description = 'Watch the BlueOne catamaran sailing the crystal-clear waters of the Greek islands.',
}: VideoEmbedProps) {
  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center">{title}</h3>
      )}
      {description && (
        <p className="text-center text-base max-w-xl mx-auto mb-8 opacity-90">{description}</p>
      )}
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black">
        <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
          <iframe
            src={embedSrc}
            title="BlueOne yacht video"
            className="absolute inset-0 h-full w-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
