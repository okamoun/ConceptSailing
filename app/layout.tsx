'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./globals.css";
import "./animations.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  return (
    <html lang="en">
      <body className={inter.className + " bg-gradient-to-br from-[#101824] to-[#1f2937] min-h-screen"}>
        <nav className="bg-gradient-to-r from-[#101824] to-[#1f2937] shadow-lg border-b border-accent/20">
          <div className="container mx-auto px-4 py-5 flex justify-between items-center">
            <Link href="/" className="flex flex-col items-center gap-3 group">
              <Image src="/logo_cms.svg" alt="Concept Sailing Logo" width={200} height={128} className="h-32 w-auto drop-shadow-lg transition-transform group-hover:scale-105" style={{maxHeight:'160px'}} priority />
              <span className="text-accent font-semibold text-sm mt-1">Premium Sailing Adventures</span>
            </Link>
            <div className="space-x-8 text-lg font-semibold">
              <Link href="/blueone" className="hover:text-accent transition-colors text-blue-400 font-bold">BlueOne</Link>
              <Link href="/experiences" className="hover:text-accent transition-colors">Experiences</Link>
              <Link href="/themes" className="hover:text-accent transition-colors">Adventure Themes</Link>
              <Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link>
              {pathname !== '/blueone' && (
                <Link href="/boats" className="hover:text-accent transition-colors">All Boats</Link>
              )}
              <Link href="/about" className="hover:text-accent transition-colors">About</Link>
              <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            </div>
          </div>
        </nav>
        <main className="pt-6">{children}</main>
        <footer className="mt-16 bg-[#1f2937] border-t border-accent/30 py-10">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-extrabold mb-4 text-accent">
                <Image src="/logo_cms.svg" alt="Concept Sailing Logo" width={100} height={64} className="h-20 w-auto inline-block align-middle" style={{maxHeight:'100px'}} priority />
                Concept Sailing
              </h3>
              <p className="text-lg text-gray-200">Your gateway to exclusive, unforgettable sailing adventures in Greece.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent">Quick Links</h3>
              <ul className="space-y-2 text-lg">
                <li><Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link></li>
                <li><Link href="/boats" className="hover:text-accent transition-colors">Our Boats</Link></li>
                <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent">Contact Us</h3>
              <p className="text-lg">Email: <a href="mailto:contact@nj3cruises.com" className="hover:text-accent transition-colors">contact@nj3cruises.com</a></p>
              <p className="text-lg">Phone: +30 210 123 4567</p>
              <div className="mt-4">
                <p className="text-lg font-bold text-accent">Concept Sailing</p>
                <p className="text-sm text-gray-400">Athens, Greece</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
