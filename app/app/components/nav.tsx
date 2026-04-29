"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClusterSelect } from "./cluster-select";
import { WalletButton } from "./wallet-button";

const MOCK_GOLD_PRICE = 3178.5;

const ROUTES = [
  { href: "/",           label: "BLKW3B",     kanji: "𓂀" },
  { href: "/protocol",   label: "PROTOCOL",   kanji: "𓂋" },
  { href: "/reserves",   label: "RESERVES",   kanji: "𓇳" },
  { href: "/revenue",    label: "REVENUE",    kanji: "𓏥" },
  { href: "/developers", label: "DEVELOPERS", kanji: "𓈖" },
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
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        background: "rgba(8,8,8,0.85)",
        borderColor: "var(--carbon)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <ObsidianLogo />
          <div className="font-display leading-none">
            <div
              className="text-base font-black tracking-[0.25em] transition-[text-shadow]"
              style={{ color: "var(--gold)", textShadow: "0 0 30px var(--gold-glow)" }}
            >
              BLKW3B
            </div>
            <div className="text-[9px] font-bold tracking-[0.3em] mt-1" style={{ color: "var(--gray)" }}>
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

        {/* Right cluster: price chip + cluster + wallet */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium font-display tracking-[0.1em]"
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
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex h-10 w-10 items-center justify-center border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--carbon)", color: "var(--gold)", outlineColor: "var(--vault-gold)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <><path d="M4 4l10 10" /><path d="M14 4L4 14" /></>
              ) : (
                <><path d="M3 5h12" /><path d="M3 9h12" /><path d="M3 13h12" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav
          aria-label="Primary mobile"
          className="lg:hidden border-t"
          style={{ background: "var(--obsidian)", borderColor: "var(--carbon)" }}
        >
          <ul className="mx-auto max-w-6xl px-6 py-3 grid gap-1">
            {ROUTES.map((r) => {
              const active = isActive(r.href);
              return (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="font-display flex items-center gap-3 px-3 py-3 text-xs font-black tracking-[0.25em]"
                    style={{
                      background: active ? "var(--gold-muted)" : "transparent",
                      color: active ? "var(--gold-light)" : "var(--gray)",
                      borderLeft: `2px solid ${active ? "var(--vault-gold)" : "transparent"}`,
                    }}
                  >
                    <span className="font-jp opacity-60" aria-hidden="true">{r.kanji}</span>
                    {r.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
