// src/components/dashboard/RecentTicketsTable.jsx
/**
 * ============================================================================
 * RECENT TICKETS TABLE - MODERN ECO 2026 STYLE
 * ============================================================================
 * 
 * 🎨 DESIGN:
 * - Samsung/Apple 2026 modern style
 * - Eco-friendly green accents
 * - Glassmorphism subtle
 * - Live badge animat
 * 
 * 📊 LAYOUT:
 * - Badge sector (stânga)
 * - Operator + cod deșeu + nr. auto (centru)
 * - Cantitate + dată/oră (dreapta)
 * 
 * ============================================================================
 */

import React from "react";
import { Radio } from "lucide-react";

const RecentTicketsTable = ({ data = [], loading = false }) => {
  
  // ========================================================================
  // CULORI SECTOARE (ECO PALETTE)
  // ========================================================================
  
  const sectorColors = {
    1: { 
      bg: "bg-violet-500", 
      text: "text-violet-500",
      border: "border-violet-200 dark:border-violet-500/20"
    },
    2: { 
      bg: "bg-gray-400", 
      text: "text-gray-400",
      border: "border-gray-200 dark:border-gray-500/20"
    },
    3: { 
      bg: "bg-emerald-500", 
      text: "text-emerald-500",
      border: "border-emerald-200 dark:border-emerald-500/20"
    },
    4: { 
      bg: "bg-amber-500", 
      text: "text-amber-500",
      border: "border-amber-200 dark:border-amber-500/20"
    },
    5: { 
      bg: "bg-pink-500", 
      text: "text-pink-500",
      border: "border-pink-200 dark:border-pink-500/20"
    },
    6: { 
      bg: "bg-cyan-500", 
      text: "text-cyan-500",
      border: "border-cyan-200 dark:border-cyan-500/20"
    },
  };

  const getColorConfig = (sectorNum) =>
    sectorColors[sectorNum] || sectorColors[1];

  // ========================================================================
  // FORMATĂRI DATE/ORĂ
  // ========================================================================
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========================================================================
  // LOADING SKELETON
  // ========================================================================
  
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="mb-6">
          <div className="h-5 w-44 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-gray-100 dark:bg-gray-600" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER MAIN
  // ========================================================================

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      
      {/* HEADER */}
      <div className="mb-5 flex flex-shrink-0 items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Ultimele înregistrări
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            50 înregistrări recente
          </p>
        </div>

        {/* LIVE BADGE - ANIMAT */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5">
          <div className="relative flex h-2 w-2">
            {/* Ping animat */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* LISTĂ CU SCROLL - CARDS ELEGANTE COMPACTE */}
      <div className="flex max-h-[470px] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2">
        {data.map((ticket, idx) => {
          const sectorNum = ticket.sector_number || 1;
          const colorConfig = getColorConfig(sectorNum);

          return (
            <div
              key={ticket.ticket_id || idx}
              className="group relative flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 transition-all duration-200 hover:shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/30"
            >
              
              {/* BADGE SECTOR - COMPACT */}
              <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${colorConfig.bg} shadow-sm`}>
                <span className="text-base font-bold text-white">
                  {sectorNum}
                </span>
              </div>

              {/* INFO CENTRU - OPERATOR + COD + NR AUTO */}
              <div className="flex-1 min-w-0">
                {/* Operator */}
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {ticket.supplier_name || "Operator necunoscut"}
                </p>
                
                {/* Cod deșeu + Nr. auto */}
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-mono font-medium">{ticket.waste_code}</span>
                  {ticket.vehicle_number && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>{ticket.vehicle_number}</span>
                    </>
                  )}
                </div>
              </div>

              {/* INFO DREAPTA - CANTITATE + DATĂ/ORĂ */}
              <div className="flex-shrink-0 text-right">
                {/* Cantitate + tone (1 rand) */}
                <p className={`text-base font-bold ${colorConfig.text} leading-tight`}>
                  {ticket.net_weight_tons_formatted || 
                    `${(ticket.net_weight_tons || 0).toLocaleString('ro-RO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal ml-1">t</span>
                </p>
                
                {/* Dată + Oră (1 rand) */}
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDate(ticket.ticket_date)} • {formatTime(ticket.ticket_date || ticket.created_at)}
                </p>
              </div>

              {/* Accent line subtil (hover) */}
              <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Radio className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nu există înregistrări pentru perioada selectată
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER - VEZI TOATE */}
      {data.length > 0 && (
        <div className="mt-4 flex-shrink-0 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Afișate{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {data.length}
            </span>{" "}
            înregistrări
          </span>
          
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            Vezi toate
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTicketsTable;