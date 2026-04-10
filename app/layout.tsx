'use client';

import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BlueOneProvider, useBlueOneMode } from "./contexts/BlueOneContext";
import "./globals.css";
import "./animations.css";

const inter = Inter({ subsets: ["latin"] });

function NavigationContent() {
  const pathname = usePathname();
  const { isBlueOneMode } = useBlueOneMode();
  
  return (
    <nav className={`sticky top-0 z-50 shadow-lg border-b backdrop-blur-sm ${isBlueOneMode ? 'bg-gradient-to-r from-blue-900/95 to-blue-800/95 border-blue-400/30' : 'bg-gradient-to-r from-[#101824]/95 to-[#1f2937]/95 border-accent/20'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <Image 
            src={isBlueOneMode ? "/images/boats/blueone/logo_blueone.png" : "/logo_cms.svg"} 
            alt={isBlueOneMode ? "BlueOne Logo" : "Concept Sailing Logo"} 
            width={isBlueOneMode ? 120 : 160} 
            height={isBlueOneMode ? 60 : 100} 
            className={`h-24 w-auto drop-shadow-lg transition-transform group-hover:scale-105 ${isBlueOneMode ? 'object-contain' : ''}`} 
            style={{maxHeight:'120px'}} 
            priority 
          />
          <span className={`${isBlueOneMode ? 'text-blue-300' : 'text-accent'} font-semibold text-xs mt-1`}>
            {isBlueOneMode ? 'BlueOne Luxury Yacht' : 'Premium Sailing Adventures'}
          </span>
        </Link>
        <div className="space-x-8 text-lg font-semibold">
          <Link href="/blueone" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-200 font-bold' : 'text-blue-400 font-bold'}`}>BlueOne</Link>
          <Link href="/experiences" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-100' : 'text-gray-300'}`}>Experiences</Link>
          <Link href="/themes" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-100' : 'text-gray-300'}`}>Adventure Themes</Link>
          <Link href="/destinations" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-100' : 'text-gray-300'}`}>Destinations</Link>
          {pathname !== '/blueone' && !isBlueOneMode && (
            <Link href="/boats" className="hover:text-accent transition-colors">All Boats</Link>
          )}
          <Link href="/about" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-100' : 'text-gray-300'}`}>About</Link>
          <Link href="/contact" className={`hover:text-blue-300 transition-colors ${isBlueOneMode ? 'text-blue-100' : 'text-gray-300'}`}>Contact</Link>
        </div>
      </div>
    </nav>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isBlueOneMode } = useBlueOneMode();
  
  return (
    <body className={inter.className + " min-h-screen " + (isBlueOneMode ? "bg-gradient-to-br from-blue-50 to-white" : "bg-gradient-to-br from-[#101824] to-[#1f2937]")}>
      <NavigationContent />
      <main className="pt-6">{children}</main>
      <footer className={`mt-16 border-t py-10 ${isBlueOneMode ? 'bg-blue-900 border-blue-400/30' : 'bg-[#1f2937] border-accent/30'}`}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className={`flex items-center gap-2 text-2xl font-extrabold mb-4 ${isBlueOneMode ? 'text-blue-300' : 'text-accent'}`}>
              <Image 
                src={isBlueOneMode ? "/images/boats/blueone/logo_blueone.png" : "/logo_cms.svg"} 
                alt={isBlueOneMode ? "BlueOne Logo" : "Concept Sailing Logo"} 
                width={100} 
                height={64} 
                className="h-20 w-auto inline-block align-middle" 
                style={{maxHeight:'100px'}} 
                priority 
              />
              {isBlueOneMode ? 'BlueOne Luxury Yacht' : 'Concept Sailing'}
            </h3>
            <p className={`text-lg ${isBlueOneMode ? 'text-blue-100' : 'text-gray-200'}`}>
              Your gateway to exclusive, unforgettable sailing adventures in Greece.
            </p>
          </div>
          <div>
            <h3 className={`text-xl font-bold mb-4 ${isBlueOneMode ? 'text-blue-300' : 'text-accent'}`}>Quick Links</h3>
            <ul className="space-y-2 text-lg">
              <li><Link href="/destinations" className={`hover:${isBlueOneMode ? 'text-blue-300' : 'text-accent'} transition-colors`}>Destinations</Link></li>
              {!isBlueOneMode && <li><Link href="/boats" className="hover:text-accent transition-colors">Our Boats</Link></li>}
              <li><Link href="/about" className={`hover:${isBlueOneMode ? 'text-blue-300' : 'text-accent'} transition-colors`}>About Us</Link></li>
              <li><Link href="/contact" className={`hover:${isBlueOneMode ? 'text-blue-300' : 'text-accent'} transition-colors`}>Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className={`text-xl font-bold mb-4 ${isBlueOneMode ? 'text-blue-300' : 'text-accent'}`}>Contact Us</h3>
            <p className="text-lg">Email: <a href="mailto:contact@nj3cruises.com" className={`hover:${isBlueOneMode ? 'text-blue-300' : 'text-accent'} transition-colors`}>contact@nj3cruises.com</a></p>
            <p className="text-lg">Phone: +30 210 123 4567</p>
            <div className="mt-4">
              <p className={`text-lg font-bold ${isBlueOneMode ? 'text-blue-300' : 'text-accent'}`}>Concept Sailing</p>
              <p className="text-sm text-gray-400">Athens, Greece</p>
            </div>
          </div>
        </div>
      </footer>
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BlueOneProvider>
      <html lang="en">
        <LayoutContent>{children}</LayoutContent>
      </html>
    </BlueOneProvider>
  );
}
