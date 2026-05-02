import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint · Burn · Redeem — Obsidian Protocol",
  description:
    "Live dApp on Solana devnet. Mint xGOLD, xSLVR, xGLDD, xSLVD, and xGLDB against your AGX reserve allocation. Connect a wallet to start.",
  openGraph: {
    title: "Obsidian Protocol · Live dApp",
    description: "Mint tokenized precious metals on Solana. 5 SPL Token 2022 contracts backed 1:1 by AGX vault metal.",
    url: "https://w3bs.fun/protocol",
    images: [{ url: "https://w3bs.fun/assets/pyramid-xgold.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Protocol · Live dApp",
    description: "Mint tokenized precious metals on Solana.",
    images: ["https://w3bs.fun/assets/pyramid-xgold.jpg"],
  },
};

export default function ProtocolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
