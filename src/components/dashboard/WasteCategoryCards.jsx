// src/components/dashboard/WasteCategoryCards.jsx
/**
 * ============================================================================
 * WASTE CATEGORY CARDS – PREMIUM TAILWIND
 * ============================================================================
 */

import React from "react";
import {
  formatPercent,
  getWasteCodeIcon,
} from "../../utils/dashboardUtils.js";

const WasteCategoryCards = ({ categories = [], loading = false }) => {
  /**
   * Color presets per waste code
   */
  const getColorConfig = (wasteCode) => {
    const map = {
      "20 03 01": {
        // deșeuri municipale
        gradient:
          "from-purple-500 via-purple-500/90 to-violet-500 dark:from-purple-500 dark:via-purple-600 dark:to-violet-600",
        chipBg: "bg-purple-500/15 dark:bg-purple-400/15",
        chipText: "text-purple-200 dark:text-purple-100",
        barBg: "bg-purple-500",
        ring: "ring-purple-500/40",
        glow: "shadow-[0_0_25px_rgba(168,85,247,0.45)]",
      },
      "20 03 03": {
        // reziduuri străzi
        gradient:
          "from-emerald-500 via-emerald-500/90 to-teal-500 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-600",
        chipBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
        chipText: "text-emerald-100",
        barBg: "bg-emerald-400",
        ring: "ring-emerald-500/40",
        glow: "shadow-[0_0_25px_rgba(16,185,129,0.45)]",
      },
      "19 * *": {
        // deșeuri de sortare
        gradient:
          "from-orange-500 via-amber-500 to-yellow-400 dark:from-orange-500 dark:via-amber-500 dark:to-yellow-400",
        chipBg: "bg-amber-500/15 dark:bg-amber-400/20",
        chipText: "text-amber-100",
        barBg: "bg-amber-400",
        ring: "ring-amber-400/50",
        glow: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
      },
      "17 09 04": {
        // construcții
        gradient:
          "from-pink-500 via-rose-500 to-red-400 dark:from-pink-500 dark:via-rose-500 dark:to-red-400",
        chipBg: "bg-pink-500/15 dark:bg-pink-400/20",
        chipText: "text-pink-100",
        barBg: "bg-pink-400",
        ring: "ring-pink-500/40",
        glow: "shadow-[0_0_25px_rgba(236,72,153,0.45)]",
      },
      ALTELE: {
        // alte fluxuri
        gradient:
          "from-cyan-500 via-sky-500 to-blue-500 dark:from-cyan-500 dark:via-sky-500 dark:to-blue-500",
        chipBg: "bg-cyan-500/15 dark:bg-cyan-400/20",
        chipText: "text-cyan-100",
        barBg: "bg-cyan-400",
        ring: "ring-cyan-400/40",
        glow: "shadow-[0_0_25px_rgba(56,189,248,0.45)]",
      },
    };

    return map[wasteCode] || map.ALTELE;
  };

  /**
   * Loading skeleton (5 cards)
   */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-gradient-to-br from-slate-200/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 animate-pulse"
          >
            <div className="h-full w-full bg-slate-200/40 dark:bg-slate-800/40 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!categories || categories.length === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md px-8 py-10 flex flex-col items-center justify-center text-center shadow-[0_18px_45px_rgba(15,23,42,0.25)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-300 shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11v4M14 11v4"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-100 mb-1">
          Nu există date pentru perioada selectată.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ajustează filtrele de perioadă sau sector pentru a vedea distribuția
          categoriilor de deșeuri.
        </p>
      </div>
    );
  }

  /**
   * Main cards
   */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      {categories.slice(0, 5).map((category) => {
        const {
          gradient,
          chipBg,
          chipText,
          barBg,
          ring,
          glow,
        } = getColorConfig(category.waste_code);
        const icon = getWasteCodeIcon(category.waste_code);
        const percentage = Math.min(
          Number(category.percentage_of_total || 0),
          100,
        );

        return (
          <article
            key={category.waste_code}
            className={`
              relative group overflow-hidden rounded-2xl border border-slate-200/80 
              dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 
              backdrop-blur-lg shadow-[0_18px_45px_rgba(15,23,42,0.22)]
              transition-all duration-500 ease-out
              hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.35)]
              hover:border-transparent hover:${ring}
            `}
          >
            {/* Decorative gradient halo */}
            <div
              className={`
                pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full 
                bg-gradient-to-br ${gradient} opacity-20 blur-2 transition-opacity 
                duration-500 group-hover:opacity-40
              `}
            />
            <div
              className={`
                pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full 
                bg-gradient-to-tl ${gradient} opacity-10 blur group-hover:opacity-25
              `}
            />

            {/* Inner content */}
            <div className="relative z-10 flex h-full flex-col p-5">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span
                    className={`
                      inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold
                      uppercase tracking-[0.08em] ${chipBg} ${chipText}
                      ring-1 ring-inset ring-white/10
                    `}
                  >
                    {category.waste_code}
                  </span>
                  <p className="max-w-[12rem] text-xs font-medium leading-snug text-slate-600 dark:text-slate-200/90">
                    {category.waste_description}
                  </p>
                </div>

                {/* Icon */}
                <div
                  className={`
                    flex h-11 w-11 items-center justify-center rounded-xl 
                    bg-gradient-to-br ${gradient} text-xl text-white
                    shadow-lg ${glow}
                    ring-2 ring-white/30 dark:ring-slate-900/40
                  `}
                >
                  <span className="drop-shadow-sm">{icon}</span>
                </div>
              </div>

              {/* Total tons */}
              <div className="mb-4">
                <p
                  className={`
                    bg-gradient-to-r ${gradient}
                    bg-clip-text text-3xl font-extrabold tracking-tight
                    text-transparent drop-shadow-sm
                  `}
                >
                  {category.total_tons_formatted}
                </p>
                <p className="mt-1 text-[0.7rem] font-medium text-slate-500 dark:text-slate-400">
                  {category.ticket_count}{" "}
                  {category.ticket_count === 1 ? "tichet" : "tichete"} •{" "}
                  {Number(category.total_tons || 0).toFixed(2)} tone
                </p>
              </div>

              {/* Progress + percentage */}
              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-[0.7rem]">
                  <span className="font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Din total
                  </span>
                  <span
                    className={`
                      bg-gradient-to-r ${gradient}
                      bg-clip-text text-sm font-bold text-transparent
                    `}
                  >
                    {formatPercent(category.percentage_of_total)}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/90">
                  <div
                    className={`
                      h-full rounded-full bg-gradient-to-r ${gradient} ${barBg}
                      transition-all duration-[1100ms] ease-out
                    `}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Corner status dot */}
            <div
              className={`
                pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 rounded-full 
                bg-gradient-to-br ${gradient} shadow-[0_0_0_3px_rgba(15,23,42,0.7)]
                animate-pulse
              `}
            />
          </article>
        );
      })}
    </div>
  );
};

export default WasteCategoryCards;
