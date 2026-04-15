import type { Metadata } from "next";
import { Orbitron, Space_Grotesk, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BLKW3B // Obsidian Protocol",
  description: "Tokenized precious metals on Solana. xGOLD, xSLVR, xGLDD, xSLVD, xGLDB — backed 1:1 by AGX vault reserves.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${spaceGrotesk.variable} ${notoJP.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
