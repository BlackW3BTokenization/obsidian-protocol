/**
 * /api/mint — server-side Token-2022 mint
 *
 * Mint authority keypair is stored in MINT_AUTHORITY_SECRET env var (base58).
 * Call after running: node scripts/create-devnet-mints.mjs
 *
 * POST { tokenSymbol, walletAddress, tokenAmount }
 * → { ok: true, signature: string }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
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
  if (!secret) throw new Error("MINT_AUTHORITY_SECRET not set in environment");
  return Keypair.fromSecretKey(bs58.decode(secret));
}

export async function POST(req: NextRequest) {
  try {
    const { tokenSymbol, walletAddress, tokenAmount } = await req.json() as {
      tokenSymbol:  string;
      walletAddress: string;
      tokenAmount:  number;
    };

    if (!tokenSymbol || !walletAddress || !tokenAmount || tokenAmount <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid params" }, { status: 400 });
    }

    const token = OBSIDIAN_TOKENS.find((t) => t.symbol === tokenSymbol);
    if (!token) {
      return NextResponse.json({ ok: false, error: `Unknown token: ${tokenSymbol}` }, { status: 400 });
    }

    const authority  = loadAuthority();
    const conn       = new Connection(RPC, "confirmed");
    const mintPubkey = new PublicKey(token.mintAddress);
    const walletPub  = new PublicKey(walletAddress);

    // Derive user's ATA for this Token-2022 mint
    const ata = getAssociatedTokenAddressSync(
      mintPubkey,
      walletPub,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const amountU64 = BigInt(Math.round(tokenAmount * Math.pow(10, token.decimals)));

    const { blockhash } = await conn.getLatestBlockhash("confirmed");

    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: authority.publicKey,
    });

    // Create ATA if needed (idempotent)
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

    // MintTo
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

    const sig = await conn.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await conn.confirmTransaction(sig, "confirmed");

    return NextResponse.json({ ok: true, signature: sig });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
