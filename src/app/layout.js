
import { Manrope, DM_Sans } from "next/font/google";
import "./globals.css";

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
      <body className={`${manrope.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
