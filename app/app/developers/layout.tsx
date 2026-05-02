import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "x402 API Gateway - Obsidian Protocol",
  description:
    "Pay-per-call precious metals data API. Every request is a revenue event - AI agents, DeFi protocols, and trading bots pay in SOL via HTTP 402. Settlement in under 400ms on Solana.",
  openGraph: {
    title: "Obsidian Protocol · x402 API Gateway",
    description: "AI agents pay per call. No subscriptions, no invoices. HTTP 402 payment protocol on Solana - settlement in <400ms.",
    url: "https://w3bs.fun/developers",
    images: [{ url: "https://w3bs.fun/assets/pyramid-xgold.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Protocol · x402 API Gateway",
    description: "AI agents pay per call in SOL via HTTP 402. No subscriptions. Settlement in <400ms.",
    images: ["https://w3bs.fun/assets/pyramid-xgold.jpg"],
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
