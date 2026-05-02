import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnership Economics - Obsidian Protocol",
  description:
    "AGX revenue share model. Protocol fees split 80/20. At 20% AGX network adoption (12,000 accounts), projected annual revenue from mint, burn, transfer, and custody fees.",
  openGraph: {
    title: "Obsidian Protocol · Partnership Economics",
    description: "80/20 fee split. AGX earns 20% of all protocol fees. See the full revenue projection at each adoption tier.",
    url: "https://w3bs.fun/revenue",
    images: [{ url: "https://w3bs.fun/assets/pyramid-xgold.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Protocol · Partnership Economics",
    description: "AGX earns 20% of all Obsidian protocol fees.",
    images: ["https://w3bs.fun/assets/pyramid-xgold.jpg"],
  },
};

export default function RevenueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
