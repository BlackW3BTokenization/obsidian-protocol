/**
 * create-devnet-mints.mjs
 * Run once to deploy 5 SPL Token-2022 mints on devnet.
 * Outputs env vars and mint addresses to copy into .env.local + tokens.ts
 *
 * Usage: node scripts/create-devnet-mints.mjs
 */

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  createInitializeTransferFeeConfigInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

const RPC = "https://api.devnet.solana.com";
const conn = new Connection(RPC, "confirmed");

// Tokens to deploy: symbol → decimals
const TOKENS = [
  { symbol: "xGOLD", decimals: 6 },
  { symbol: "xSLVR", decimals: 6 },
  { symbol: "xGLDD", decimals: 6 },
  { symbol: "xSLVD", decimals: 6 },
  { symbol: "xGLDB", decimals: 6 },
];

async function airdrop(pubkey, sol = 1) {
  // Try faucet.solana.com first (higher limits), fall back to RPC airdrop
  console.log(`  Requesting ${sol} SOL for ${pubkey.toBase58()}…`);
  try {
    const res = await fetch("https://faucet.solana.com/api/airdrop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pubkey: pubkey.toBase58(), lamports: sol * LAMPORTS_PER_SOL }),
    });
    const json = await res.json();
    if (json.signature) {
      await conn.confirmTransaction(json.signature, "confirmed");
      console.log(`  ✓ Faucet airdrop confirmed`);
      return;
    }
  } catch { /* fall through */ }

  // RPC fallback
  const sig = await conn.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
  console.log(`  ✓ Airdrop confirmed`);
}

async function createMint(authority, decimals) {
  const mintKp = Keypair.generate();
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLen = getMintLen(extensions);
  const lamports = await conn.getMinimumBalanceForRentExemption(mintLen);

  const tx = new Transaction().add(
    // Allocate mint account
    SystemProgram.createAccount({
      fromPubkey: authority.publicKey,
      newAccountPubkey: mintKp.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    // Initialize transfer fee extension (0.10% = 10 bps, max 1000 tokens)
    createInitializeTransferFeeConfigInstruction(
      mintKp.publicKey,
      authority.publicKey,
      authority.publicKey,
      10,      // 0.10% in bps
      BigInt(1_000_000), // max fee in token base units
      TOKEN_2022_PROGRAM_ID,
    ),
    // Initialize mint
    createInitializeMintInstruction(
      mintKp.publicKey,
      decimals,
      authority.publicKey,
      null, // freeze authority: none
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  await sendAndConfirmTransaction(conn, tx, [authority, mintKp], { commitment: "confirmed" });
  return mintKp.publicKey.toBase58();
}

async function main() {
  // Load fixed mint authority from env (set MINT_AUTHORITY_SECRET in .env.local)
  const secret = process.env.MINT_AUTHORITY_SECRET;
  if (!secret) {
    console.error("❌ Set MINT_AUTHORITY_SECRET in .env.local first.");
    process.exit(1);
  }
  const authority = Keypair.fromSecretKey(bs58.decode(secret));
  console.log("\n🔑 Mint authority:", authority.publicKey.toBase58());

  // Check balance
  const bal = await conn.getBalance(authority.publicKey);
  console.log(`   Balance: ${(bal / 1e9).toFixed(4)} SOL`);
  if (bal < 0.5 * 1e9) {
    console.error(`\n❌ Insufficient balance. Fund this address with 2 devnet SOL:`);
    console.error(`   https://faucet.solana.com`);
    console.error(`   Address: ${authority.publicKey.toBase58()}`);
    process.exit(1);
  }

  console.log("\n🪙 Creating Token-2022 mints on devnet…\n");
  const results = {};

  for (const { symbol, decimals } of TOKENS) {
    process.stdout.write(`  ${symbol} (${decimals} decimals)… `);
    try {
      const mintAddress = await createMint(authority, decimals);
      results[symbol] = mintAddress;
      console.log(`✓ ${mintAddress}`);
    } catch (err) {
      console.error(`✗ FAILED: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("\n\n════════════════════════════════════════");
  console.log("  Copy these into .env.local:");
  console.log("════════════════════════════════════════");
  console.log(`MINT_AUTHORITY_SECRET=${bs58.encode(authority.secretKey)}`);

  console.log("\n\n════════════════════════════════════════");
  console.log("  Update tokens.ts mintAddress fields:");
  console.log("════════════════════════════════════════");
  for (const [symbol, addr] of Object.entries(results)) {
    console.log(`  ${symbol}: "${addr}"`);
  }
  console.log("\n✅ Done. Run the app — /api/mint will sign server-side.\n");
}

main().catch((err) => { console.error(err); process.exit(1); });
