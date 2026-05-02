/**
 * Obsidian Protocol · 5 Tokenized Precious Metals
 * BLKW3B Inc. · Backed 1:1 by AGX vault holdings
 * Canonical product suite (per Design System v1.0):
 *   xGOLD · xSLVR · xGLDD · xSLVD · xGLDB
 */

export interface ObsidianToken {
  symbol:      string;   // xGOLD, xSLVR, xGLDD, xSLVD, xGLDB
  metalSymbol: string;   // XAU, XAG, AUD, AGD, GBK (instrument tickers)
  iconSymbol:  string;   // Au, Ag, G$, S$, Gb (mood-board badge glyphs)
  name:        string;   // "Gold Bullion", "Silver Dollar", etc.
  priceUsd:    number;   // per native unit
  unit:        string;   // "troy oz" | "coin" | "note"
  unitShort:   string;   // "oz" | "coin" | "note"
  change24h:   string;
  color:       string;
  mintAddress: string;   // devnet SPL Token 2022 mint
  programId:   string;   // Obsidian program (devnet)
  supply:      number;
  reserveQty:  number;   // AGX vault allocation in native units
  decimals:    number;
  description: string;
  image:       string;   // /assets/* path · token visual
}

export const OBSIDIAN_TOKENS: ObsidianToken[] = [
  {
    symbol:      "xGOLD",
    metalSymbol: "XAU",
    iconSymbol:  "Au",
    name:        "Gold Bullion",
    priceUsd:    3178.50,
    unit:        "troy oz",
    unitShort:   "oz",
    change24h:   "+0.42%",
    color:       "#C8960C",   // gold
    mintAddress: "GLD5k8aBKBJT5nuNaFNKNMTpYMML87WJ5fGxN7M6Pnw2",
    programId:   "oBSDnGLD111111111111111111111111111111111111",
    supply:      0,
    reserveQty:  10_000,
    decimals:    6,
    description: "1 xGOLD = 1 troy oz gold bullion · AGX vault · SPL Token 2022",
    image:       "/assets/pyramid-xgold.jpg",
  },
  {
    symbol:      "xSLVR",
    metalSymbol: "XAG",
    iconSymbol:  "Ag",
    name:        "Silver Bullion",
    priceUsd:    31.42,
    unit:        "troy oz",
    unitShort:   "oz",
    change24h:   "-0.18%",
    color:       "#94A3B8",   // silver
    mintAddress: "SLVRqWf9Gj6d8XnP3K5mHeLXwFdqNV7AkCTBhMjYu2x",
    programId:   "oBSDnSLV111111111111111111111111111111111111",
    supply:      0,
    reserveQty:  500_000,
    decimals:    6,
    description: "1 xSLVR = 1 troy oz silver bullion · AGX vault · SPL Token 2022",
    image:       "/assets/pyramid-xslvr.jpg",
  },
  {
    symbol:      "xGLDD",
    metalSymbol: "AUD",
    iconSymbol:  "G$",
    name:        "Gold Dollar",
    priceUsd:    154.88,          // 1/20 troy oz gold coin (approx)
    unit:        "coin",
    unitShort:   "coin",
    change24h:   "+0.42%",
    color:       "#D4A030",   // gold coin - lighter gold
    mintAddress: "GLDDxNf2MjK8aP9rLv3HqC5TYeZBnVkRsWp4ExoAu1m",
    programId:   "oBSDnGLDD11111111111111111111111111111111111",
    supply:      0,
    reserveQty:  60_000,
    decimals:    6,
    description: "1 xGLDD = 1 Gold Dollar coin · AGX vault · SPL Token 2022",
    image:       "/assets/coin-xgldd.jpg",
  },
  {
    symbol:      "xSLVD",
    metalSymbol: "AGD",
    iconSymbol:  "S$",
    name:        "Silver Dollar",
    priceUsd:    24.26,           // 1 Morgan-sized silver dollar (~0.77 oz Ag)
    unit:        "coin",
    unitShort:   "coin",
    change24h:   "-0.18%",
    color:       "#7D9DB5",   // silver dollar - steel blue-silver
    mintAddress: "SLVDaP4kL9bM2vJw7QnYdR6TpUfC5HeBxK3ZoVr1Ng",
    programId:   "oBSDnSLVD11111111111111111111111111111111111",
    supply:      0,
    reserveQty:  300_000,
    decimals:    6,
    description: "1 xSLVD = 1 Silver Dollar coin · AGX vault · SPL Token 2022",
    image:       "/assets/coin-xslvd.jpg",
  },
  {
    symbol:      "xGLDB",
    metalSymbol: "GBK",
    iconSymbol:  "Gb",
    name:        "Goldback",
    priceUsd:    4.60,            // 1 Goldback (any denom/state) spot-equivalent via goldback.com daily rate
    unit:        "note",
    unitShort:   "note",
    change24h:   "+0.42%",
    color:       "#A87C08",   // goldback - deep antique gold
    mintAddress: "GLDB7mFnRt5PqZ2KLyXbC8HdVs9EoAjW3NuBxRvYc6p",
    programId:   "oBSDnGLDB11111111111111111111111111111111111",
    supply:      0,
    reserveQty:  2_500_000,
    decimals:    6,
    description: "1 xGLDB = 1 Goldback · all denoms (1/4-100) · all states · 24k gold · AGX vault",
    image:       "/assets/stack-xgldb.webp",
  },
];

export const TOKEN_MAP = Object.fromEntries(
  OBSIDIAN_TOKENS.map((t) => [t.symbol, t])
) as Record<string, ObsidianToken>;

/** Total AGX-allocated reserve value across all 5 tokens (USD) */
export function totalReserveUsd(): number {
  return OBSIDIAN_TOKENS.reduce((s, t) => s + t.reserveQty * t.priceUsd, 0);
}

/** Reserve normalized to troy oz of gold (using xGOLD spot) */
export function totalGoldEquivOz(): number {
  const goldPrice = OBSIDIAN_TOKENS[0].priceUsd;
  return OBSIDIAN_TOKENS.reduce(
    (s, t) => s + (t.reserveQty * t.priceUsd) / goldPrice,
    0
  );
}
