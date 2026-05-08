/**
 * /api/mint — server-side Token-2022 mint
 *
 * Mint authority keypair is stored in MINT_AUTHORITY_SECRET env var (base58).
 * Call after running: node scripts/create-devnet-mints.mjs
 *
 * POST { tokenSymbol, walletAddress, tokenAmount }
 * → { ok: true, signature: string }
 */

// Force Node.js runtime — @solana/web3.js requires Node APIs (not Edge-compatible)
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import bs58 from "bs58";
import { OBSIDIAN_TOKENS } from "../../lib/tokens";

const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

function loadAuthority(): Keypair {
  const secret = process.env.MINT_AUTHORITY_SECRET;
  if (!secret) throw new Error("MINT_AUTHORITY_SECRET not set in environment — add it to Vercel env vars or .env.local");
  return Keypair.fromSecretKey(bs58.decode(secret));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      tokenSymbol:   string;
      walletAddress: string;
      tokenAmount:   number;
    };
    const { tokenSymbol, walletAddress, tokenAmount } = body;

    if (!tokenSymbol || !walletAddress || typeof tokenAmount !== "number" || tokenAmount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid params — need tokenSymbol, walletAddress, tokenAmount > 0" }, { status: 400 });
    }

    const token = OBSIDIAN_TOKENS.find((t) => t.symbol === tokenSymbol);
    if (!token) {
      return NextResponse.json({ ok: false, error: `Unknown token: ${tokenSymbol}` }, { status: 400 });
    }

    const authority  = loadAuthority();
    const conn       = new Connection(RPC, "confirmed");
    const mintPubkey = new PublicKey(token.mintAddress);

    // Validate wallet address
    let walletPub: PublicKey;
    try {
      walletPub = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ ok: false, error: `Invalid wallet address: ${walletAddress}` }, { status: 400 });
    }

    // Derive user's ATA for this Token-2022 mint
    const ata = getAssociatedTokenAddressSync(
      mintPubkey,
      walletPub,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    // Convert to base units, guarding against overflow
    const rawAmount = tokenAmount * Math.pow(10, token.decimals);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return NextResponse.json({ ok: false, error: `Token amount ${tokenAmount} is invalid after scaling` }, { status: 400 });
    }
    const amountU64 = BigInt(Math.round(rawAmount));

    // Get blockhash + lastValidBlockHeight (required for blockheight-based confirmation —
    // avoids WebSocket subscriptions which don't work in serverless environments)
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");

    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: authority.publicKey,
    });

    // Create ATA if it doesn't already exist (idempotent — safe to re-run)
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,   // payer
        ata,                   // associated token account
        walletPub,             // owner
        mintPubkey,            // mint
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )
    );

    // MintTo: credit amountU64 base units to the user's ATA
    tx.add(
      createMintToInstruction(
        mintPubkey,
        ata,
        authority.publicKey,   // mint authority
        amountU64,
        [],
        TOKEN_2022_PROGRAM_ID,
      )
    );

    tx.sign(authority);

    // Send — skip preflight so devnet simulation quirks don't surface false errors
    let sig: string;
    try {
      sig = await conn.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,   // rely on on-chain execution; avoids sim-vs-reality mismatches
        maxRetries: 3,
      });
    } catch (sendErr) {
      const msg  = sendErr instanceof Error ? sendErr.message : String(sendErr);
      const logs = (sendErr as { logs?: string[] }).logs ?? [];
      console.error("[/api/mint] sendRawTransaction failed:", msg, "\nLogs:\n", logs.join("\n"));
      throw new Error(`Send failed: ${msg}`);
    }

    // Blockheight-based confirm — polls via getSignatureStatus (no WebSocket needed)
    const result = await conn.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    if (result.value.err) {
      const errDetail = JSON.stringify(result.value.err);
      console.error("[/api/mint] On-chain error for", sig, ":", errDetail);
      throw new Error(`Transaction landed but failed on-chain: ${errDetail}`);
    }

    console.log("[/api/mint] Minted", tokenAmount, tokenSymbol, "→", walletAddress, "| sig:", sig);
    return NextResponse.json({ ok: true, signature: sig });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/mint] Unhandled error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
