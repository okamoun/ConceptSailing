import { notFound } from 'next/navigation';
import Link from 'next/link';
import adventures from '../../adventures-data';

export type PageProps = Promise<{ id: string }>;

export async function generateStaticParams() {
  return adventures.map((adv) => ({ id: adv.id }));
}

function AdventureBackground({ adventureName, adventureId }: { adventureName: string, adventureId: string }) {
  switch (adventureId) {
    case "1": // Wind Sports Adventure
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(to bottom, #a7d8f0 0%, #e0f7fa 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            <defs>
              <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b3e0ff" />
                <stop offset="100%" stopColor="#4fc3f7" />
              </linearGradient>
            </defs>
            <path d="M0 300 Q 360 350 720 300 T 1440 300 V400 H0Z" fill="url(#sea)" />
            {/* Sailboat */}
            <g>
              <rect x="720" y="250" width="60" height="10" rx="5" fill="#fff" opacity="0.7" />
              <polygon points="750,250 770,180 790,250" fill="#fff" />
              <polygon points="750,250 730,210 770,250" fill="#90caf9" />
              <rect x="768" y="210" width="4" height="40" fill="#1976d2" />
              {/* Wind lines */}
              <path d="M700 270 Q715 260 730 270" stroke="#81d4fa" strokeWidth="3" fill="none" />
              <path d="M780 270 Q795 260 810 270" stroke="#81d4fa" strokeWidth="3" fill="none" />
            </g>
          </svg>
        </div>
      );
    case "2": // Family Sailing School
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(to bottom, #e3f2fd 0%, #b3e5fc 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            <ellipse cx="400" cy="370" rx="80" ry="18" fill="#fff9c4" opacity="0.4" />
            <ellipse cx="1040" cy="370" rx="90" ry="20" fill="#fff9c4" opacity="0.3" />
            <path d="M0 320 Q 360 370 720 320 T 1440 320 V400 H0Z" fill="#b3e5fc" />
            {/* Two playful boats */}
            <g>
              <rect x="450" y="310" width="40" height="7" rx="3.5" fill="#fff" opacity="0.8" />
              <polygon points="470,310 480,285 490,310" fill="#fff" />
              <polygon points="470,310 460,295 480,310" fill="#90caf9" />
              <rect x="478" y="295" width="3" height="15" fill="#1976d2" />
            </g>
            <g>
              <rect x="1000" y="320" width="30" height="5" rx="2.5" fill="#fff" opacity="0.8" />
              <polygon points="1015,320 1023,305 1031,320" fill="#fff" />
              <polygon points="1015,320 1007,312 1023,320" fill="#90caf9" />
              <rect x="1022" y="312" width="2" height="8" fill="#1976d2" />
            </g>
          </svg>
        </div>
      );
    case "3": // Yoga & Wellness Retreat
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(180deg, #ffe082 0%, #b2dfdb 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            {/* Sunrise */}
            <circle cx="720" cy="350" r="60" fill="#fff9c4" opacity="0.7" />
            {/* Lotus */}
            <g>
              <ellipse cx="720" cy="370" rx="35" ry="10" fill="#fff" opacity="0.6" />
              <path d="M720 370 Q730 350 740 370 Q735 360 720 370" fill="#b2dfdb" />
              <path d="M720 370 Q710 350 700 370 Q705 360 720 370" fill="#b2dfdb" />
              <path d="M720 370 Q720 360 730 370 Q725 365 720 370" fill="#80cbc4" />
              <path d="M720 370 Q720 360 710 370 Q715 365 720 370" fill="#80cbc4" />
            </g>
          </svg>
        </div>
      );
    case "4": // Cleansing & Renewal
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(180deg, #e0f7fa 0%, #c8e6c9 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            {/* Water drops and leaves */}
            <ellipse cx="400" cy="360" rx="16" ry="6" fill="#b2dfdb" opacity="0.5" />
            <ellipse cx="1040" cy="350" rx="20" ry="8" fill="#a5d6a7" opacity="0.4" />
            <circle cx="720" cy="370" r="14" fill="#b2dfdb" opacity="0.7" />
            <rect x="730" y="370" width="6" height="18" rx="3" fill="#a5d6a7" />
          </svg>
        </div>
      );
    case "6": // Culinary Traditions
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(180deg, #fffde7 0%, #ffe082 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            {/* Olives and utensils */}
            <circle cx="400" cy="370" r="12" fill="#a5d6a7" opacity="0.7" />
            <rect x="420" y="370" width="24" height="4" rx="2" fill="#ffe082" />
            <rect x="1040" y="370" width="24" height="4" rx="2" fill="#ffe082" />
            <ellipse cx="1060" cy="370" rx="8" ry="4" fill="#a5d6a7" opacity="0.6" />
            {/* Fork */}
            <rect x="720" y="350" width="4" height="30" fill="#ffe082" />
            <rect x="718" y="350" width="2" height="22" fill="#bdb76b" />
            <rect x="724" y="350" width="2" height="22" fill="#bdb76b" />
          </svg>
        </div>
      );
    default: // Generic sea background
      return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"
          style={{ background: `linear-gradient(to bottom, #a7d8f0 0%, #e0f7fa 100%)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute bottom-0 left-0">
            <defs>
              <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b3e0ff" />
                <stop offset="100%" stopColor="#4fc3f7" />
              </linearGradient>
            </defs>
            <path d="M0 300 Q 360 350 720 300 T 1440 300 V400 H0Z" fill="url(#sea)" />
          </svg>
        </div>
      );
  }
}

export default async function AdventureThemePage( props : { params: PageProps }) {
  const { id } = await props.params;
  const adventure = adventures.find((a) => a.id === id);
  if (!adventure) return notFound();

  return (
    <main className="relative min-h-screen w-full flex justify-center items-start bg-blue-100">
      <AdventureBackground adventureName={adventure.name} adventureId={adventure.id} />
      <div className="relative z-10 max-w-3xl mx-auto py-12 px-4 w-full">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-900">{adventure.name}</h1>
        <p className="text-lg mb-6 text-gray-700">{adventure.description}</p>
        <div className="mb-8">
          <img src={adventure.image} alt={adventure.name} className="rounded-lg shadow-lg w-full h-72 object-cover mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-blue-700">7-Day Experience</h2>
          <p className="mb-4 text-gray-800">{adventure.experience}</p>
          <h3 className="text-xl font-semibold mb-2 text-blue-600">Sample Itinerary</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            {adventure.itinerary.map((day, i) => (
              <li key={i}><span className="font-semibold">Day {i + 1}:</span> {day}</li>
            ))}
          </ol>
        </div>
        <Link href="/themes" className="text-blue-600 hover:underline">← Back to all adventures</Link>
      </div>
    </main>
  );
}
