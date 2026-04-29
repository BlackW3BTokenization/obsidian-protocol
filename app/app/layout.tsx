import type { Metadata } from "next";
import { Chakra_Petch, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";
import { Nav } from "./components/nav";
import { Footer } from "./components/footer";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BLKW3B // Obsidian Protocol",
  description:
    "Tokenized gold and silver on Solana. xGOLD · xSLVR · xGLDD · xSLVD · xGLDB · backed 1:1 by AGX vault reserves.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Egyptian+Hieroglyphs&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${chakraPetch.variable} ${spaceGrotesk.variable} antialiased`}>
        <Providers>
          <div
            className="relative min-h-screen flex flex-col"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            {/* Global obsidian grid background */}
            <div
              className="pointer-events-none fixed inset-0"
              aria-hidden="true"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(200,150,12,0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(200,150,12,0.04) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }}
            />
            {/* Gold radial glow at top */}
            <div
              className="pointer-events-none fixed inset-x-0 top-0 h-96"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(200,150,12,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
