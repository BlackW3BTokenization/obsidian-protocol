"use client";

import { useState } from "react";

/**
 * Design primitives extracted from BLKW3B / Obsidian Protocol design system.
 * Use these alongside the existing CSS classes (`corner-brackets`, `kanji-watermark`)
 * to keep new sections visually coherent with the spec.
 */

export function GoldTopLine() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background:
          "linear-gradient(90deg, transparent, var(--vault-gold) 40%, var(--gold-light) 60%, transparent)",
        zIndex: 1,
      }}
    />
  );
}

export function ColorTopLine({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color} 40%, ${color} 60%, transparent)`,
        zIndex: 1,
      }}
    />
  );
}

export function Scanlines({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${opacity}) 2px, rgba(0,0,0,${opacity}) 4px)`,
      }}
    />
  );
}

export function LiveDot({ color = "var(--mint-green)", size = 6 }: { color?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className="animate-ping absolute inline-flex rounded-full"
        style={{ inset: 0, background: color, opacity: 0.75 }}
      />
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    </span>
  );
}

/**
 * Section eyebrow: gold rule + uppercase Chakra Petch label.
 * The canonical pattern across every section in the design system.
 */
export function SectionEyebrow({
  label,
  status,
  statusColor = "var(--mint-green)",
}: {
  label: string;
  status?: string;
  statusColor?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          style={{ width: 24, height: 1.5, background: "var(--vault-gold)", display: "inline-block" }}
        />
        <span
          className="font-display font-bold uppercase"
          style={{ fontSize: 9, letterSpacing: "0.4em", color: "var(--gold)" }}
        >
          {label}
        </span>
      </div>
      {status && (
        <div className="flex items-center gap-1.5">
          <LiveDot color={statusColor} />
          <span
            className="font-display"
            style={{ fontSize: 8, letterSpacing: "0.2em", color: statusColor }}
          >
            {status}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * StatCard: hoverable, scanline-swept, gold-top-lined card with a 36px Chakra Petch value.
 * Pair multiple in a `flex gap-px bg-[var(--carbon)]` row to mimic the design's hairline grid.
 */
export function StatCard({
  label,
  sublabel,
  value,
  delta,
  deltaPositive = true,
  description,
}: {
  label: string;
  sublabel?: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  description?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-1 min-w-0 transition-[border-color,box-shadow] duration-150"
      style={{
        background: "var(--void)",
        border: `1px solid ${hovered ? "var(--vault-gold)" : "var(--carbon)"}`,
        padding: "24px 24px 20px",
        boxShadow: hovered ? "0 0 30px rgba(200,150,12,0.1)" : "none",
        overflow: "hidden",
      }}
    >
      <GoldTopLine />
      <Scanlines opacity={0.025} />

      {/* corner brackets, applied as inline divs to match design primitive */}
      <span aria-hidden="true" className="absolute" style={{ width: 16, height: 16, top: 0, left: 0, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)", zIndex: 2 }} />
      <span aria-hidden="true" className="absolute" style={{ width: 16, height: 16, bottom: 0, right: 0, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)", zIndex: 2 }} />

      {/* hover sweep */}
      {hovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: 0,
            bottom: 0,
            width: "40%",
            background:
              "linear-gradient(90deg, transparent, rgba(200,150,12,0.04), transparent)",
            animation: "scanline-sweep 0.8s ease-out forwards",
            zIndex: 3,
          }}
        />
      )}

      <div className="relative" style={{ zIndex: 2 }}>
        <p
          className="font-display font-bold uppercase mb-1.5"
          style={{ fontSize: 8, letterSpacing: "0.35em", color: "var(--gray)" }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            className="font-display font-bold uppercase mb-2.5"
            style={{ fontSize: 8, letterSpacing: "0.2em", color: "#444" }}
          >
            {sublabel}
          </p>
        )}
        <p
          className="font-display tabular-nums"
          style={{
            fontWeight: 900,
            fontSize: 36,
            color: "var(--gold-light)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 8,
            textShadow: "0 0 30px rgba(200,150,12,0.25)",
          }}
        >
          {value}
        </p>
        {delta && (
          <p
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: 10,
              color: deltaPositive ? "var(--mint-green)" : "var(--burn-red)",
              letterSpacing: "0.1em",
            }}
          >
            {delta}
          </p>
        )}
        {description && (
          <p
            className="mt-2"
            style={{
              fontSize: 12,
              color: "var(--gray)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Chamfered button: matches the design's clip-path cuts.
 * Variants: gold (filled), outline, mint, danger.
 */
export function ChamferButton({
  children,
  variant = "gold",
  href,
  onClick,
  type = "button",
  className = "",
  external = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  variant?: "gold" | "outline" | "mint" | "danger";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}) {
  const variants = {
    gold:    { bg: "var(--vault-gold)", color: "var(--obsidian)",  border: "none",                          clip: true  },
    outline: { bg: "transparent",        color: "var(--gold)",      border: "1px solid var(--vault-gold)",  clip: false },
    mint:    { bg: "var(--mint-green)",  color: "var(--obsidian)",  border: "none",                          clip: true  },
    danger:  { bg: "transparent",        color: "var(--burn-red)",  border: "1px solid var(--burn-red)",    clip: false },
  } as const;

  const v = variants[variant];

  const styles = {
    fontSize: 9,
    letterSpacing: "0.3em",
    padding: v.clip ? "14px 32px" : "13px 31px",
    background: v.bg,
    color: v.color,
    border: v.border,
    clipPath: v.clip ? "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" : undefined,
    textTransform: "uppercase" as const,
    transition: "opacity 0.15s ease-out, background 0.15s ease-out",
  };

  const cls = `font-display font-bold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:opacity-90 inline-flex items-center justify-center gap-2 ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={cls}
        style={{ ...styles, outlineColor: "var(--vault-gold)" }}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={cls} style={{ ...styles, outlineColor: "var(--vault-gold)" }}>
      {children}
    </button>
  );
}
