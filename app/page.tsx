"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Trophy,
  User,
  LayoutGrid,
  ChevronDown,
  Aperture,
} from "lucide-react";

// ── Feature strip data ────────────────────────────────────────────
const features = [
  {
    icon: Target,
    title: "Set Goals",
    description: "Define clear objectives",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your journey",
  },
  {
    icon: Trophy,
    title: "Achieve More",
    description: "Celebrate success",
  },
];

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0f1c] text-white"
    >
      {/* ── Brand Logos ──────────────────────────────────────────── */}
      {/* Top Left Logo */}
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

      {/* Top Right BEE Sticker */}
      <div className="absolute right-6 top-8 z-50 sm:right-10 lg:right-14">
        <div className="flex w-[85px] flex-col overflow-hidden rounded-b-[10px] rounded-t-[50px] border-[3px] border-[#222] shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:w-[95px]">
          <div className="flex flex-col items-center justify-end bg-[#e31837] pb-1 pt-6">
            <div className="mb-0.5 flex text-[9px] leading-none text-white sm:text-[11px]" style={{ letterSpacing: "-1px" }}>
              ★★★★★
            </div>
          </div>
          <div className="flex items-center justify-center bg-[#ffc107] py-[3px]">
            <span className="text-center text-[4px] font-bold uppercase leading-tight text-black sm:text-[5px]">
              More Stars<br />More Savings
            </span>
          </div>
          <div className="flex items-center justify-center bg-[#231f20] py-1.5">
            <span className="text-[5.5px] font-bold uppercase tracking-widest text-white sm:text-[6.5px]">
              Power Savings
            </span>
          </div>
        </div>
      </div>

      {/* ── Background Layers ─────────────────────────────────────── */}
      {/* ── Static Fan (RIGHT SIDE) ──────────────────────────────── */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-0 -translate-y-1/2 select-none"
        style={{
          width: "clamp(400px, 58vw, 900px)",
          aspectRatio: "1",
          transform: "translateX(18%)",
        }}
      >
        {/* Sharp Unified Static Fan Image */}
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

      {/* ── Hero Content (LEFT SIDE) ───────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 md:px-14 lg:px-14 xl:px-20">
        <div className="max-w-xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-[#151c33]/80 px-3.5 py-1.5 backdrop-blur-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30">
              <Aperture className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-[13px] font-medium text-slate-200/90 pr-2">
              Smart. Silent. Powerful.
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: "easeOut" }}
            className="text-[52px] font-bold leading-[1.05] tracking-tight sm:text-[64px] lg:text-[72px]"
          >
            <span className="block text-white">Welcome to</span>
            <span
              className="block pb-2"
              style={{
                background:
                  "linear-gradient(90deg, #00d2ff 0%, #3a7bd5 40%, #7a2cb3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ATOMQUEST
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
            className="mt-6 text-[17px] leading-[1.6] text-slate-300 sm:text-lg max-w-[420px]"
          >
            Set, track, and achieve your goals<br/>with{" "}
            <span
              className="font-bold"
              style={{
                background: "linear-gradient(90deg, #00d2ff, #7a2cb3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ATOMQUEST
            </span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.52, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-4"
          >
            {/* Primary — Sign in */}
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-[14px] px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              style={{
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
                boxShadow: "0 8px 25px rgba(99,102,241,0.2)",
              }}
            >
              {/* Shine sweep */}
              <span
                className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]"
                aria-hidden
              />
              <User className="h-4 w-4 shrink-0 font-normal" />
              Sign in
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>

            {/* Secondary — Go to dashboard */}
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-[14px] border border-slate-600/40 bg-[#12182b]/60 px-8 py-3.5 text-[15px] font-semibold text-slate-200 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-slate-500/60 hover:bg-slate-800/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span
                className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]"
                aria-hidden
              />
              <LayoutGrid className="h-4 w-4 shrink-0 text-slate-300 transition-colors duration-500 group-hover:text-white" />
              Go to dashboard
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          </motion.div>

          {/* Feature strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.78, ease: "easeOut" }}
            className="mt-16 flex flex-col gap-5 sm:flex-row sm:gap-8"
          >
            {features.map(({ icon: Icon, title, description }, i) => (
              <React.Fragment key={title}>
                {i > 0 && (
                  <div className="hidden h-10 w-[1px] self-center bg-white/10 sm:block" />
                )}
                <div className="flex items-center gap-4">
                  {/* Circular glowing icon */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-[#0c1222]"
                    style={{
                      boxShadow: "0 0 16px rgba(59,130,246,0.15)",
                    }}
                  >
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white/95 tracking-wide">{title}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
