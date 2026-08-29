import type { Metadata } from "next";
import { Bebas_Neue, Caveat, Newsreader, Space_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LIFE MOVIE — Your life. Your story. Your movie.",
  description: "Transform your photos, videos, memories, and personal stories into an emotionally cinematic movie.",
  keywords: ["Life Movie", "Cinematic memories", "AI Film Director", "Personal Documentary", "Storytelling", "Memories to movie"],
  openGraph: {
    title: "LIFE MOVIE — Your life. Your story. Your movie.",
    description: "Transform your personal memories into an emotionally rich cinematic film.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${caveat.variable} ${newsreader.variable} ${spaceMono.variable} ${jakarta.variable} scroll-smooth`}
    >
      <body className="bg-[#F5EFEB] text-[#221F1E] font-sans antialiased selection:bg-[#E26D3B] selection:text-[#FBF8F3] overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
