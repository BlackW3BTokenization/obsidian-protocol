"use client";

/**
 * useTokenBalances
 * Fetches SPL Token-2022 balances for all 5 Obsidian tokens for a given wallet.
 * Uses the existing @solana/kit RPC client for consistency with useBalance.
 *
 * ATA derivation: @solana/spl-token's getAssociatedTokenAddressSync
 * (TOKEN_2022_PROGRAM_ID variant) → .toBase58() → kit Address string.
 */

import useSWR from "swr";
import { PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Address } from "@solana/kit";
import { useSolanaClient } from "../solana-client-context";
import { useCluster } from "../../components/cluster-context";
import { OBSIDIAN_TOKENS } from "../tokens";

export type TokenBalances = Record<string, number>;

export function useTokenBalances(walletAddress?: Address) {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR<TokenBalances>(
    walletAddress ? (["token-balances", cluster, walletAddress] as const) : null,
    async ([, , addr]) => {
      const balances: TokenBalances = {};

      await Promise.all(
        OBSIDIAN_TOKENS.map(async (token) => {
          try {
            const ata = getAssociatedTokenAddressSync(
              new PublicKey(token.mintAddress),
              new PublicKey(addr),
              false,
              TOKEN_2022_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID,
            );

            const result = await client.rpc
              .getTokenAccountBalance(ata.toBase58() as Address)
              .send();

            balances[token.symbol] =
              parseFloat(result.value.uiAmountString ?? "0");
          } catch {
            // ATA doesn't exist yet (never minted) → 0
            balances[token.symbol] = 0;
          }
        })
      );

      return balances;
    },
    {
      refreshInterval: 20_000,      // poll every 20s
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
    }
  );

  return {
    balances: data ?? {},
    isLoading,
    error,
    refresh: () => void mutate(),  // call after mint/burn to force immediate refetch
  };
}
