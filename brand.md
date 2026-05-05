# Brand · BLKW3B // Obsidian Protocol

_Status: defined-in-code_

The full brand system lives in `app/app/globals.css` as the canonical source of truth.
Do not duplicate tokens here · read globals.css. Highlights:

## Aesthetic
**Black asiatic · hyper premium · ancient future · forged.**
No rounded corners (`--radius: 0`, Tailwind `rounded-*` overridden globally).
Scanline overlay on `body::after` (vault-monitor feel).

## Palette (CSS vars in `:root`)
- Surfaces: `--obsidian` `--void` `--dark2` `--carbon` `--dark4`
- Text: `--parchment` `--gray`
- Accent (primary): `--vault-gold` (#C8960C) · `--gold-light` · `--gold-glow` · `--gold-muted` · `--gold-border`
- Status: `--mint-green` (verified) · `--burn-red` (alert) · `--cyan` · `--purple`

## Typography
- `--font-display` → Orbitron 900 · financial data, headers, numbers
- `--font-sans` → Space Grotesk · body, descriptions
- `--font-jp` → Noto Sans JP · kanji watermarks
- Display tracking: `tracking-[0.15em..0.3em]` (the higher the more ceremonial)

## Aesthetic primitives
- `.corner-brackets` · top-left + bottom-right gold L-brackets, BLKW3B signature
- `.kanji-watermark` · large absolute-positioned kanji at 10% opacity, per-section
- `.hex-clip` · hexagonal clip for token icons
- `.chamfer` · chamfered cut for primary CTAs
- `.font-display` · Orbitron + 0.05em tracking baseline

## Per-section kanji vocabulary
- 黒金庫 (black vault) · landing hero
- 金庫 (vault) · reserves
- 収益 (revenue) · economics
- 関所 (gate / checkpoint) · x402 / developers
- 鋳造 (casting / minting) · how-it-works
- 信用 (trust / credit) · trust layer
- 提携 (partnership) · economics
- 鍛造 (forging) · protocol / dApp

## Voice
Forged, not designed. Confident, dense, factual. No exclamation marks.
Use single-em-dash for emphasis, not "amazing"/"powerful"/"revolutionary".

To re-theme, run `/brand-design`. The skill will detect this status and proceed.
