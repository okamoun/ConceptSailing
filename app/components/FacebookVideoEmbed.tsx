'use client';

// Shared Facebook video embed. Renders the Facebook video plugin in an iframe,
// mirroring the Facebook post embed pattern already used on the yacht page.
// Facebook resolves share/reel URLs server-side, so the original share link works
// directly as the `href` value.
const FACEBOOK_VIDEO_URL = 'https://www.facebook.com/share/r/19R8LxKtj4/';

const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
  FACEBOOK_VIDEO_URL,
)}&show_text=false&width=560`;

type FacebookVideoEmbedProps = {
  title?: string;
  description?: string;
};

export default function FacebookVideoEmbed({
  title = 'See BlueOne in Action',
  description = 'Watch the BlueOne catamaran sailing the crystal-clear waters of the Greek islands.',
}: FacebookVideoEmbedProps) {
  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center">{title}</h3>
      )}
      {description && (
        <p className="text-center text-base max-w-xl mx-auto mb-8 opacity-90">{description}</p>
      )}
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black">
        <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
          <iframe
            src={embedSrc}
            title="BlueOne yacht video"
            className="absolute inset-0 h-full w-full"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
