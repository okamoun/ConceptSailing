import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windsurf Cruises | Greek Sailing Holidays",
  description: "Discover amazing sailing holidays in Greece. Choose from various themed cruises and create your perfect sailing adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">Windsurf Cruises</a>
            <div className="space-x-6">
              <a href="/themes" className="hover:text-blue-200">Adventure Themes</a>
              <a href="/destinations" className="hover:text-blue-200">Destinations</a>
              <a href="/about" className="hover:text-blue-200">About</a>
              <a href="/contact" className="hover:text-blue-200">Contact</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Windsurf Cruises</h3>
                <p>Your gateway to unforgettable sailing adventures in Greece</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/destinations" className="hover:text-blue-300">Destinations</a></li>
                  <li><a href="/itineraries" className="hover:text-blue-300">Itineraries</a></li>
                  <li><a href="/about" className="hover:text-blue-300">About Us</a></li>
                  <li><a href="/contact" className="hover:text-blue-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p>Email: info@windsurfcruises.com</p>
                <p>Phone: +30 123 456 7890</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
