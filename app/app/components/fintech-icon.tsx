"use client";

/**
 * FintechIcon · 3D-rendered isometric icons from the FinTech 3D pack.
 * PNG renders live in /public/assets/icons/<name>_black.png.
 *
 * Usage:
 *   <FintechIcon name="safe" size={32} />
 *   <FintechIcon name="wallet" size={48} glow />
 */

export type FintechIconName =
  | "safe"
  | "safe_open_coins"
  | "goldbar"
  | "silverbar"
  | "coin_stack_gold"
  | "coin_stack_silver"
  | "wallet"
  | "key"
  | "lock"
  | "dollar_shield"
  | "percent_shield"
  | "btc_shield"
  | "dollar_contract"
  | "cheque"
  | "cash"
  | "scale"
  | "pie_chart"
  | "bar_chart"
  | "candles"
  | "percent"
  | "laptop_trading"
  | "laptop_security"
  | "credit_card"
  | "calendar";

export function FintechIcon({
  name,
  size = 32,
  glow = false,
  className = "",
  alt,
}: {
  name: FintechIconName;
  size?: number;
  glow?: boolean;
  className?: string;
  alt?: string;
}) {
  const src = `/assets/icons/${name}_black.png`;
  return (
    <img
      src={src}
      alt={alt ?? ""}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      loading="lazy"
      className={`block shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: glow ? "drop-shadow(0 0 12px rgba(200,150,12,0.45))" : undefined,
      }}
    />
  );
}
