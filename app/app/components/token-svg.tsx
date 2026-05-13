"use client";

/**
 * TokenSvg — REAL 3D pixelated token models with CSS 3D transforms.
 *
 * xGOLD / xSLVR  → 5-tier step pyramid (gold / silver)
 * xGLDD          → hexagonal gold coin (6-sided prism)
 * xSLVD          → silver dollar coin (12-sided prism for smooth round look)
 * xGLDB          → stack of flat goldback notes (8 thin slabs, jittered)
 *
 * Every model:
 *   - Built from real 3D face elements (front/back/left/right/top), so as the
 *     parent rotates, all four sides sweep into view (not a 2D image flipping).
 *   - Sized in cqw (container query width) → auto-scales to its parent box.
 *   - Ticker label baked onto the most-visible face (pyramid base front,
 *     coin top, top goldback note) — rotates with the model.
 */

import type { CSSProperties } from "react";

// ── Brand colors ─────────────────────────────────────────────────────────
const GOLD       = "#C8960C";
const GOLD_LIGHT = "#E0B840";
const GOLD_DARK  = "#8B6914";
const GOLD_SIDE  = "#A37A0A";

const SILVER       = "#B8B8B8";
const SILVER_LIGHT = "#E0E0E0";
const SILVER_DARK  = "#707070";
const SILVER_SIDE  = "#909090";

const BG = "#0D0D0D";

interface ModelColors {
  front: string;
  back:  string;
  side:  string;
  top:   string;
}

interface TokenSvgProps {
  symbol: string;
  className?: string;
  style?: CSSProperties;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function faceStyle(
  widthCqw: number,
  heightCqw: number,
  background: string,
  transform: string,
  extra?: CSSProperties,
): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: `${widthCqw}cqw`,
    height: `${heightCqw}cqw`,
    background,
    transform,
    transformOrigin: "center center",
    backfaceVisibility: "visible",
    WebkitBackfaceVisibility: "visible",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.20)",
    imageRendering: "pixelated",
    ...extra,
  };
}

function tickerLabelStyle(fontSizeCqw: number): CSSProperties {
  return {
    color: "#0D0D0D",
    fontFamily: "var(--font-display)",
    fontSize: `${fontSizeCqw}cqw`,
    fontWeight: 900,
    letterSpacing: "0.1em",
    textShadow: "0 1px 0 rgba(255,255,255,0.35)",
    pointerEvents: "none",
    userSelect: "none",
    lineHeight: 1,
  };
}

// ── Containers ───────────────────────────────────────────────────────────

function Spinner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="token-3d-spin"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}

function ModelContainer({
  className,
  style,
  children,
}: {
  className: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        background: BG,
        perspective: "140cqw",
        perspectiveOrigin: "50% 35%",
        overflow: "hidden",
        containerType: "inline-size",
      } as CSSProperties}
      aria-hidden="true"
    >
      <Spinner>{children}</Spinner>
    </div>
  );
}

// ── Model 1: Step pyramid (xGOLD, xSLVR) ────────────────────────────────

const TIER_WIDTHS_CQW = [60, 48, 36, 24, 12];
const TIER_HEIGHT_CQW = 9;

function Pyramid3D({ colors, ticker }: { colors: ModelColors; ticker: string }) {
  return (
    <>
      {TIER_WIDTHS_CQW.map((w, i) => {
        const half  = w / 2;
        const halfH = TIER_HEIGHT_CQW / 2;
        const yOffsetCqw = ((TIER_WIDTHS_CQW.length - 1) / 2 - i) * TIER_HEIGHT_CQW;
        const isBase = i === 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: `translateY(${yOffsetCqw}cqw)`,
            }}
          >
            {/* FRONT */}
            <div style={faceStyle(
              w, TIER_HEIGHT_CQW, colors.front,
              `translate(-50%, -50%) translateZ(${half}cqw)`,
              isBase ? { display: "flex", alignItems: "center", justifyContent: "center" } : undefined,
            )}>
              {isBase && <span style={tickerLabelStyle(TIER_HEIGHT_CQW * 0.55)}>{ticker}</span>}
            </div>
            {/* BACK — at spinner Y=180° net rotation is 0°, text readable */}
            <div style={faceStyle(
              w, TIER_HEIGHT_CQW, colors.back,
              `translate(-50%, -50%) rotateY(180deg) translateZ(${half}cqw)`,
              isBase ? { display: "flex", alignItems: "center", justifyContent: "center" } : undefined,
            )}>
              {isBase && <span style={tickerLabelStyle(TIER_HEIGHT_CQW * 0.55)}>{ticker}</span>}
            </div>
            {/* RIGHT — at spinner Y=270° net rotation is 0°, text readable */}
            <div style={faceStyle(
              w, TIER_HEIGHT_CQW, colors.side,
              `translate(-50%, -50%) rotateY(90deg) translateZ(${half}cqw)`,
              isBase ? { display: "flex", alignItems: "center", justifyContent: "center" } : undefined,
            )}>
              {isBase && <span style={tickerLabelStyle(TIER_HEIGHT_CQW * 0.55)}>{ticker}</span>}
            </div>
            {/* LEFT — at spinner Y=90° net rotation is 0°, text readable */}
            <div style={faceStyle(
              w, TIER_HEIGHT_CQW, colors.side,
              `translate(-50%, -50%) rotateY(-90deg) translateZ(${half}cqw)`,
              isBase ? { display: "flex", alignItems: "center", justifyContent: "center" } : undefined,
            )}>
              {isBase && <span style={tickerLabelStyle(TIER_HEIGHT_CQW * 0.55)}>{ticker}</span>}
            </div>
            {/* TOP */}
            <div style={faceStyle(
              w, w, colors.top,
              `translate(-50%, -50%) rotateX(90deg) translateZ(${halfH}cqw)`,
            )} />
          </div>
        );
      })}
    </>
  );
}

// ── Model 2: Polygonal coin prism (xGLDD hex, xSLVD circle) ─────────────

function CoinPrism3D({
  sides,
  radiusCqw,
  thicknessCqw,
  colors,
  ticker,
}: {
  sides: number;
  radiusCqw: number;
  thicknessCqw: number;
  colors: ModelColors;
  ticker: string;
}) {
  const polyPath = (() => {
    const pts: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;
      const x = 50 + 50 * Math.cos(angle);
      const y = 50 + 50 * Math.sin(angle);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    return `polygon(${pts.join(", ")})`;
  })();

  const sideLength = 2 * radiusCqw * Math.sin(Math.PI / sides);
  const apothem    = radiusCqw * Math.cos(Math.PI / sides);
  const diameter   = 2 * radiusCqw;

  // rotateX(-90deg) stands the coin upright on its Z-axis so it spins face-on.
  // The top face's front (was pointing -Y/down when flat) now points +Z toward
  // the viewer — no scaleX correction needed, text renders naturally.
  // The bottom face comes into view at Y=180° and also reads correctly.
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0,
      width: 0, height: 0,
      transformStyle: "preserve-3d",
      WebkitTransformStyle: "preserve-3d",
      transform: "rotateX(-90deg)",
    }}>
      {/* SIDE FACES — proven geometry unchanged */}
      {Array.from({ length: sides }).map((_, i) => {
        const angle = (i / sides) * 360 + (180 / sides);
        const bg = i % 2 === 0 ? colors.side : colors.front;
        return (
          <div key={i} style={faceStyle(
            sideLength, thicknessCqw, bg,
            `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${apothem}cqw)`,
          )} />
        );
      })}

      {/* TOP FACE — viewed from back side, scaleX(-1) corrects the mirror */}
      <div style={faceStyle(
        diameter, diameter, colors.top,
        `translate(-50%, -50%) rotateX(90deg) translateZ(${thicknessCqw / 2}cqw)`,
        {
          clipPath: polyPath,
          WebkitClipPath: polyPath,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "none",
        },
      )}>
        <span style={tickerLabelStyle(diameter * 0.16)}>{ticker}</span>
      </div>

      {/* BOTTOM FACE — rotate(180deg) corrects mirror+flip when viewed from back */}
      <div style={faceStyle(
        diameter, diameter, colors.back,
        `translate(-50%, -50%) rotateX(-90deg) translateZ(${thicknessCqw / 2}cqw)`,
        {
          clipPath: polyPath,
          WebkitClipPath: polyPath,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "none",
        },
      )}>
        <span style={{ ...tickerLabelStyle(diameter * 0.16), transform: "rotate(180deg)" }}>{ticker}</span>
      </div>
    </div>
  );
}

// ── Model 3: Goldback note stack (xGLDB) ────────────────────────────────

function NoteStack3D({ colors, ticker }: { colors: ModelColors; ticker: string }) {
  const NOTE_W  = 60;    // cqw — long edge (landscape orientation)
  const NOTE_D  = 38;    // cqw — short edge
  const NOTE_H  = 1.8;   // cqw — thickness of each note (very flat)
  const GAP     = 1.4;   // cqw — vertical spacing between notes
  const N_NOTES = 8;

  const halfW = NOTE_W / 2;
  const halfD = NOTE_D / 2;
  const halfH = NOTE_H / 2;

  return (
    <>
      {Array.from({ length: N_NOTES }).map((_, i) => {
        const yOffset = ((N_NOTES - 1) / 2 - i) * (NOTE_H + GAP);
        const isTop = i === N_NOTES - 1;
        // Tiny horizontal jitter so the stack looks hand-stacked, not laser-aligned
        const jitterX = ((i * 37) % 7 - 3) * 0.18;
        const jitterZ = ((i * 53) % 5 - 2) * 0.18;

        // Top note has full face color, others slightly muted edges
        const faceTopColor = isTop ? colors.top : colors.front;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: `translate3d(${jitterX}cqw, ${yOffset}cqw, ${jitterZ}cqw)`,
            }}
          >
            {/* TOP face (ticker on the topmost note) */}
            <div style={faceStyle(
              NOTE_W, NOTE_D, faceTopColor,
              `translate(-50%, -50%) rotateX(90deg) translateZ(${halfH}cqw)`,
              isTop ? { display: "flex", alignItems: "center", justifyContent: "center" } : undefined,
            )}>
              {isTop && <span style={tickerLabelStyle(NOTE_W * 0.14)}>{ticker}</span>}
            </div>
            {/* BOTTOM face */}
            <div style={faceStyle(
              NOTE_W, NOTE_D, colors.back,
              `translate(-50%, -50%) rotateX(-90deg) translateZ(${halfH}cqw)`,
            )} />
            {/* FRONT edge (long) */}
            <div style={faceStyle(
              NOTE_W, NOTE_H, colors.side,
              `translate(-50%, -50%) translateZ(${halfD}cqw)`,
            )} />
            {/* BACK edge */}
            <div style={faceStyle(
              NOTE_W, NOTE_H, colors.side,
              `translate(-50%, -50%) rotateY(180deg) translateZ(${halfD}cqw)`,
            )} />
            {/* RIGHT edge (short) */}
            <div style={faceStyle(
              NOTE_D, NOTE_H, colors.side,
              `translate(-50%, -50%) rotateY(90deg) translateZ(${halfW}cqw)`,
            )} />
            {/* LEFT edge */}
            <div style={faceStyle(
              NOTE_D, NOTE_H, colors.side,
              `translate(-50%, -50%) rotateY(-90deg) translateZ(${halfW}cqw)`,
            )} />
          </div>
        );
      })}
    </>
  );
}

// ── Entry point ──────────────────────────────────────────────────────────

const GOLD_COLORS:   ModelColors = { front: GOLD,   back: GOLD_DARK,   side: GOLD_SIDE,   top: GOLD_LIGHT };
const SILVER_COLORS: ModelColors = { front: SILVER, back: SILVER_DARK, side: SILVER_SIDE, top: SILVER_LIGHT };

export function TokenSvg({ symbol, className = "", style }: TokenSvgProps) {
  switch (symbol) {
    case "xGOLD":
      return (
        <ModelContainer className={className} style={style}>
          <Pyramid3D colors={GOLD_COLORS} ticker="xGOLD" />
        </ModelContainer>
      );
    case "xSLVR":
      return (
        <ModelContainer className={className} style={style}>
          <Pyramid3D colors={SILVER_COLORS} ticker="xSLVR" />
        </ModelContainer>
      );
    case "xGLDD":
      return (
        <ModelContainer className={className} style={style}>
          <CoinPrism3D sides={6} radiusCqw={32} thicknessCqw={14} colors={GOLD_COLORS} ticker="xGLDD" />
        </ModelContainer>
      );
    case "xSLVD":
      return (
        <ModelContainer className={className} style={style}>
          <CoinPrism3D sides={12} radiusCqw={32} thicknessCqw={14} colors={SILVER_COLORS} ticker="xSLVD" />
        </ModelContainer>
      );
    case "xGLDB":
      return (
        <ModelContainer className={className} style={style}>
          <NoteStack3D colors={GOLD_COLORS} ticker="xGLDB" />
        </ModelContainer>
      );
    default:
      return (
        <ModelContainer className={className} style={style}>
          <Pyramid3D colors={GOLD_COLORS} ticker={symbol} />
        </ModelContainer>
      );
  }
}
