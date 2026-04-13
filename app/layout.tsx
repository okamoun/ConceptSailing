'use client';

import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { CONTACT } from './config/contact';
import { BlueOneProvider } from "./contexts/BlueOneContext";
import "./globals.css";
import "./animations.css";

const inter = Inter({ subsets: ["latin"] });

function NavigationContent() {
  return (
    <nav className={`sticky top-0 z-50 shadow-lg border-b backdrop-blur-sm bg-gradient-to-r from-blue-900/95 to-blue-800/95 border-blue-400/30`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <Image 
            src="/images/boats/blueone/logo_blueone.png" 
            alt="BlueOne Logo" 
            width={120} 
            height={60} 
            className="h-24 w-auto drop-shadow-lg transition-transform group-hover:scale-105 object-contain" 
            style={{maxHeight:'120px'}} 
            priority 
          />
          <span className="text-blue-300 font-semibold text-xs mt-1">
            BlueOne Luxury Yacht
          </span>
        </Link>
        <div className="space-x-8 text-lg font-semibold">
          <Link href="/experiences" className="text-blue-100 font-bold hover:text-blue-300 transition-colors">Experiences</Link>
          <Link href="/destinations" className="text-blue-100 hover:text-blue-300 transition-colors">Destinations</Link>
          <Link href="/blueone" className="text-blue-200 font-bold hover:text-blue-300 transition-colors">The Yacht</Link>
          <Link href="/about" className="text-blue-100 hover:text-blue-300 transition-colors">About</Link>
          <Link href="/contact" className="text-blue-100 hover:text-blue-300 transition-colors">Contact</Link>
        </div>
      </div>
    </nav>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <body className={inter.className + " min-h-screen bg-gradient-to-br from-blue-50 to-white"}>
      <NavigationContent />
      <main className="pt-6">{children}</main>
      <footer className="mt-16 border-t py-10 bg-blue-900 border-blue-400/30">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-extrabold mb-4 text-blue-300">
              <Image 
                src="/images/boats/blueone/logo_blueone.png" 
                alt="BlueOne Logo" 
                width={100} 
                height={64} 
                className="object-contain"
              />
              BlueOne Luxury Yacht
            </h3>
            <p className="text-gray-300">Experience the ultimate Greek sailing adventure aboard our premium catamaran.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-300">Quick Links</h3>
            <ul className="space-y-2 text-lg">
              <li><Link href="/experiences" className="hover:text-blue-300 transition-colors">Experiences</Link></li>
              <li><Link href="/destinations" className="hover:text-blue-300 transition-colors">Destinations</Link></li>
              <li><Link href="/blueone" className="hover:text-blue-300 transition-colors">The Yacht</Link></li>
              <li><Link href="/about" className="hover:text-blue-300 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-300 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-300">Contact Us</h3>
            <p className="text-lg">Email: <a href="mailto:contact@nj3cruises.com" className="hover:text-blue-300 transition-colors">contact@nj3cruises.com</a></p>
            <p className="text-lg">Phone: {CONTACT.phone.formatted}</p>
            <div className="mt-4">
              <p className="text-lg font-bold text-blue-300">BlueOne Luxury Yacht</p>
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
