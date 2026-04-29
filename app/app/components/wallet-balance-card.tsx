"use client";

import { useState } from "react";
import { lamports as sol } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "../lib/wallet/context";
import { useBalance } from "../lib/hooks/use-balance";
import { lamportsToSolString } from "../lib/lamports";
import { useSolanaClient } from "../lib/solana-client-context";
import { ellipsify } from "../lib/explorer";
import { useCluster } from "./cluster-context";
import { FintechIcon } from "./fintech-icon";

export function WalletBalanceCard() {
  const { wallet, status } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  const client = useSolanaClient();

  const address = wallet?.account.address;
  const balance = useBalance(address);
  const [copied, setCopied] = useState(false);

  if (status !== "connected" || !address) {
    return (
      <section
        className="relative w-full overflow-hidden border corner-brackets px-5 py-6"
        style={{ borderColor: "var(--carbon)", background: "var(--void)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>
              WALLET DISCONNECTED
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>
              Connect a wallet from the top right to mint, burn, or redeem.
            </p>
          </div>
          <span
            className="font-display px-3 py-1 text-[10px] font-black tracking-[0.2em]"
            style={{ background: "rgba(255,59,59,0.1)", color: "var(--burn-red)", border: "1px solid rgba(255,59,59,0.3)" }}
          >
            OFFLINE
          </span>
        </div>
      </section>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    try {
      toast.info("Requesting airdrop...");
      const sig = await client.airdrop(address, sol(1_000_000_000n));
      toast.success("Airdrop received", {
        description: sig ? (
          <a href={getExplorerUrl(`/tx/${sig}`)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ) : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimited = msg.includes("429") || msg.includes("Internal JSON-RPC error");
      toast.error(
        isRateLimited ? "Devnet faucet rate-limited." : "Airdrop failed.",
        isRateLimited
          ? { description: <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="underline">faucet.solana.com</a> }
          : undefined
      );
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden border corner-brackets px-5 py-5"
      style={{ borderColor: "var(--carbon)", background: "var(--void)" }}
    >
      <div className="relative flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FintechIcon name="wallet" size={40} glow />

          <span className="font-display text-sm font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>
            WALLET BALANCE
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Address copied" : "Copy wallet address"}
            className="flex cursor-pointer items-center gap-1.5 font-mono text-xs transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: "var(--muted)", outlineColor: "var(--vault-gold)" }}
          >
            {ellipsify(address, 4)}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
              {copied ? (
                <path d="M20 6 9 17l-5-5" />
              ) : (
                <>
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </>
              )}
            </svg>
          </button>
        </div>
        {cluster !== "mainnet" && (
          <button
            type="button"
            onClick={handleAirdrop}
            className="font-display cursor-pointer border px-3 py-1.5 text-[10px] font-black tracking-[0.2em] transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--gold-border)", color: "var(--gold)", background: "rgba(200,150,12,0.08)", outlineColor: "var(--vault-gold)" }}
          >
            AIRDROP 1 SOL
          </button>
        )}
      </div>
      <p className="relative mt-4 font-display text-4xl font-black tabular-nums tracking-tight" style={{ color: "var(--parchment)" }}>
        {balance.lamports != null ? lamportsToSolString(balance.lamports) : "--"}
        <span className="ml-1.5 text-lg font-normal" style={{ color: "var(--gold)" }}>SOL</span>
      </p>
    </section>
  );
}
