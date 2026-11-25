
import { Manrope, DM_Sans } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "ARTFRA — Art Showcase Platform",
  description:
    "Discover, share, and appreciate digital artworks from creative minds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${manrope.variable} ${dmSans.variable} flex min-h-screen flex-col`}
      >
        <Navbar />

        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
