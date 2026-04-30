"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClusterSelect } from "./cluster-select";
import { WalletButton } from "./wallet-button";
import { FintechIcon, type FintechIconName } from "./fintech-icon";

const MOCK_GOLD_PRICE = 3178.5;

const ROUTES = [
  { href: "/",           label: "BLKW3B",     kanji: "𓂀", icon: "dollar_shield"   as FintechIconName },
  { href: "/protocol",   label: "PROTOCOL",   kanji: "𓂋", icon: "laptop_trading"  as FintechIconName },
  { href: "/reserves",   label: "RESERVES",   kanji: "𓇳", icon: "safe"            as FintechIconName },
  { href: "/revenue",    label: "REVENUE",    kanji: "𓏥", icon: "bar_chart"       as FintechIconName },
  { href: "/developers", label: "DEV",        kanji: "𓈖", icon: "laptop_security" as FintechIconName },
] as const;

function ObsidianLogo() {
  return (
    <img
      src="/assets/blkw3b-crest.webp"
      alt="BLKW3B crest"
      width={32}
      height={32}
      className="block shrink-0"
      style={{
        width: 32,
        height: 32,
        objectFit: "contain",
        filter: "drop-shadow(0 0 8px rgba(200,150,12,0.55))",
      }}
    />
  );
}

export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      {/* ── Top header (all breakpoints) ─────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          background: "rgba(8,8,8,0.92)",
          borderColor: "var(--carbon)",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <ObsidianLogo />
            <div className="font-display leading-none">
              <div
                className="text-sm font-black tracking-[0.25em] transition-[text-shadow]"
                style={{ color: "var(--gold)", textShadow: "0 0 30px var(--gold-glow)" }}
              >
                BLKW3B
              </div>
              <div className="text-[8px] font-bold tracking-[0.3em] mt-0.5 hidden sm:block" style={{ color: "var(--gray)" }}>
                OBSIDIAN PROTOCOL
              </div>
            </div>
          </Link>

          {/* Desktop routes */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {ROUTES.map((r) => {
              const active = isActive(r.href);
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={active ? "page" : undefined}
                  className="font-display relative px-3 py-2 text-[10px] font-black tracking-[0.25em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    color: active ? "var(--gold-light)" : "var(--gray)",
                    outlineColor: "var(--vault-gold)",
                  }}
                >
                  <span className="font-jp mr-1.5 opacity-50" aria-hidden="true">{r.kanji}</span>
                  {r.label}
                  {active && (
                    <span
                      className="absolute left-2 right-2 -bottom-px h-px"
                      style={{ background: "var(--vault-gold)" }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {/* XAU price chip — hidden on small mobile */}
            <div
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-medium font-display tracking-[0.1em]"
              style={{ background: "var(--gold-muted)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--vault-gold)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--vault-gold)" }} />
              </span>
              XAU ${MOCK_GOLD_PRICE.toLocaleString()}
            </div>
            <ClusterSelect />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar (lg and below) ─────────────── */}
      <nav
        aria-label="Primary mobile"
        className="bottom-nav lg:hidden"
      >
        <div className="grid grid-cols-5 h-14">
          {ROUTES.map((r) => {
            const active = isActive(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 py-2 relative transition-opacity focus-visible:outline-none active:opacity-70"
                style={{ color: active ? "var(--gold-light)" : "var(--gray)" }}
              >
                {/* Active indicator bar at top */}
                {active && (
                  <span
                    className="absolute top-0 left-3 right-3 h-px"
                    style={{ background: "var(--vault-gold)" }}
                    aria-hidden="true"
                  />
                )}
                <span style={{ opacity: active ? 1 : 0.45, transition: "opacity 0.15s" }}>
                  <FintechIcon name={r.icon} size={22} glow={active} />
                </span>
                <span
                  className="font-display font-black tracking-[0.15em]"
                  style={{ fontSize: 7, color: active ? "var(--gold)" : "var(--gray)" }}
                >
                  {r.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
