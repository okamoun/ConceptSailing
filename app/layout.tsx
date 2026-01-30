import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import "./animations.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Concept Mediterranean Sailing | Greek Sailing Holidays",
  description: "Discover amazing sailing holidays in Greece. Choose from various themed cruises and create your perfect sailing adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gradient-to-br from-[#101824] to-[#1f2937] min-h-screen"}>
        <nav className="glass shadow-lg">
          <div className="container mx-auto px-4 py-5 flex justify-between items-center">
            <Link href="/" className="flex flex-col items-center gap-3 group">
  <Image src="/logo_cms.svg" alt="Concept Mediterranean Sailing Logo" width={200} height={128} className="h-32 w-auto drop-shadow-lg transition-transform group-hover:scale-105" style={{maxHeight:'160px'}} priority />
  <span className="text-accent font-semibold text-sm mt-1">By NJ3Cruises ike</span>
</Link>
            <div className="space-x-8 text-lg font-semibold">
              <Link href="/themes" className="hover:text-accent transition-colors">Adventure Themes</Link>
              <Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link>
              <Link href="/boats" className="hover:text-accent transition-colors">Boats</Link>
              <Link href="/about" className="hover:text-accent transition-colors">About</Link>
              <Link href="/contact" className="hover:text-accent transition-colors"> Contact</Link>
            </div>
          </div>
        </nav>
        <main className="pt-6">{children}</main>
        <footer className="mt-16 glass border-t border-accent py-10">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-extrabold mb-4 text-accent">
                <Image src="/logo_cms.svg" alt="Concept Mediterranean Sailing Logo" width={100} height={64} className="h-20 w-auto inline-block align-middle" style={{maxHeight:'100px'}} priority />
             
              </h3>
              <p className="text-lg text-gray-200">Your gateway to exclusive, unforgettable sailing adventures in Greece.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent">Quick Links</h3>
              <ul className="space-y-2 text-lg">
                <li><Link href="/destinations" className="hover:text-accent">Destinations</Link></li>
                <li><Link href="/itineraries" className="hover:text-accent">Itineraries</Link></li>
                <li><Link href="/boats" className="hover:text-accent">Our Boats</Link></li>
                <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent">Contact Us</h3>
              <p className="text-lg">Email: <a href="mailto:info@windsurfcruises.com" className="hover:text-accent">info@windsurfcruises.com</a></p>
<p className="text-lg">Phone: +30 123 456 7890</p>
<div className="mt-4">
  <p className="text-lg font-bold text-accent">NJ3 CRUISES</p>
  <p className="text-lg">Adresse: 87 POSEIDONOS AVENUE 16674 - GLYFADA, Greece</p>
</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
