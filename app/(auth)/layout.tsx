import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0f1c] text-white">
      {/* ── Brand Logos ──────────────────────────────────────────── */}
      <div className="absolute left-6 top-8 z-50 flex items-start gap-2.5 sm:left-10 lg:left-14">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#fbbc05]">
          <span className="text-[26px] font-bold text-[#10131f] leading-none mb-1 pr-0.5 tracking-tighter">a</span>
        </div>
        <div className="flex flex-col">
          <span className="mt-0.5 text-[26px] font-bold leading-none tracking-tight text-white" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
            atomberg
          </span>
          <span className="ml-8 mt-1 text-center text-[10px] font-bold italic text-white" style={{ fontFamily: "Georgia, serif" }}>
            "Why not?"
          </span>
        </div>
      </div>

      {/* ── Background Fan ──────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-0 -translate-y-1/2 select-none opacity-40 lg:opacity-100"
        style={{
          width: "clamp(400px, 58vw, 900px)",
          aspectRatio: "1",
          transform: "translateX(18%)",
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/fan-hq.png"
            alt="Ceiling fan"
            fill
            className="object-contain"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
      </div>

      {/* ── form Content (LEFT SIDE) ───────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 md:px-14 lg:px-14 xl:px-20">
        <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#12182b]/80 p-8 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
