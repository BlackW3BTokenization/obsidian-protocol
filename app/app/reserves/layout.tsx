import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve Attestation - Obsidian Protocol",
  description:
    "AGX Trust Layer. Every Obsidian token is backed 1:1 by physical metal in AGX's insured vault. Reserve ratio attested daily via Light Protocol ZK proofs on Solana.",
  openGraph: {
    title: "Obsidian Protocol · Provable Backing",
    description: "AGX vault reserves attested daily via Light Protocol ZK proofs. 10,000 oz gold · 500,000 oz silver · fully on-chain.",
    url: "https://w3bs.fun/reserves",
    images: [{ url: "https://w3bs.fun/assets/pyramid-xgold.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Protocol · Provable Backing",
    description: "AGX vault reserves attested daily via Light Protocol ZK proofs.",
    images: ["https://w3bs.fun/assets/pyramid-xgold.jpg"],
  },
};

export default function ReservesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
