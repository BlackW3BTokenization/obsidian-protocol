import Image from "next/image";

const PARTNERS = [
  { name: "SE Discord", src: "/assets/logos/SEGRAY.png" },
  { name: "GoldBack",   src: "/assets/logos/GoldBack.PNG" },
  { name: "BarCode",    src: "/assets/logos/BarCodeLogo.jpg" },
  { name: "Sp3nd",      src: "/assets/logos/Sp3ndLogo.png" },
  { name: "mtndao",     src: "/assets/logos/mtndao-wordmark.svg" },
] as const;

export function BackedBy() {
  const reel = [...PARTNERS, ...PARTNERS];
  return (
    <section className="my-16 w-full">
      <p
        className="text-center mb-6 uppercase"
        style={{ fontSize: 11, letterSpacing: "0.3em", color: "var(--gray)" }}
      >
        Backed By
      </p>
      <div
        className="overflow-hidden border corner-brackets py-8 relative group"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--void), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--void), transparent)" }}
        />

        <div className="flex w-max gap-16 items-center animate-marquee group-hover:[animation-play-state:paused]">
          {reel.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="shrink-0 flex items-center justify-center"
              style={{ minWidth: 140 }}
            >
              <Image
                src={p.src}
                alt={p.name}
                width={140}
                height={56}
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                style={{ filter: "grayscale(100%)", height: 56, width: "auto" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
