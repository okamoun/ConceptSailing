import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
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
            <Link href="/" className="text-3xl font-black tracking-tight text-accent" style={{fontFamily:'Inter,Segoe UI,Helvetica Neue,Arial,sans-serif'}}>
              Concept Mediterranean Sailing
            </Link>
            <div className="space-x-8 text-lg font-semibold">
              <Link href="/themes" className="hover:text-accent transition-colors">Adventure Themes</Link>
              <Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link>
              <Link href="/boats" className="hover:text-accent transition-colors">Boats</Link>
              <Link href="/about" className="hover:text-accent transition-colors">About</Link>
              <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            </div>
          </div>
        </nav>
        <main className="pt-6">{children}</main>
        <footer className="mt-16 glass border-t border-accent py-10">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-extrabold mb-4 text-accent">Concept Mediterranean Sailing</h3>
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
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
