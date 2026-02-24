// src/components/dashboard/RecentTicketsTable.jsx
import React from "react";
import { Radio, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sectorColorThemes = {
  1: { badge: "bg-gradient-to-br from-violet-500 to-purple-600", text: "text-violet-600 dark:text-violet-400", glow: "shadow-violet-500/20" },
  2: { badge: "bg-gradient-to-br from-slate-400 to-gray-500",    text: "text-slate-600 dark:text-slate-400",   glow: "shadow-slate-500/20"  },
  3: { badge: "bg-gradient-to-br from-emerald-500 to-teal-600",  text: "text-emerald-600 dark:text-emerald-400", glow: "shadow-emerald-500/20" },
  4: { badge: "bg-gradient-to-br from-amber-500 to-orange-600",  text: "text-amber-600 dark:text-amber-400",   glow: "shadow-amber-500/20"  },
  5: { badge: "bg-gradient-to-br from-pink-500 to-rose-600",     text: "text-pink-600 dark:text-pink-400",     glow: "shadow-pink-500/20"   },
  6: { badge: "bg-gradient-to-br from-cyan-500 to-blue-600",     text: "text-cyan-600 dark:text-cyan-400",     glow: "shadow-cyan-500/20"   },
};

const RecentTicketsTable = ({ data = [], loading = false }) => {
  const navigate = useNavigate();
  const getColorConfig = (sectorNum) => sectorColorThemes[sectorNum] || sectorColorThemes[1];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ro-RO", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("ro-RO", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-[28px]
                    border border-gray-200 dark:border-gray-700/50
                    bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    p-6 shadow-sm dark:shadow-none">
        <div className="mb-6 flex-shrink-0 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700/50" />
            <div className="h-3 w-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/30" />
          </div>
          <div className="h-7 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700/50" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[20px] bg-gray-100 dark:bg-gray-700/30"
              style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-[28px]
                  border border-gray-200 dark:border-gray-700/50
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  p-6 shadow-sm dark:shadow-none">

      {/* HEADER — LIVE badge + "Vezi toate" pe același rând */}
      <div className="mb-5 flex flex-shrink-0 items-start justify-between">

        {/* Titlu + nr înregistrări */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Ultimele înregistrări
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {data.length} înregistrări recente
          </p>
        </div>

        {/* Dreapta: LIVE + Vezi toate */}
        <div className="flex items-center gap-2">

          {/* LIVE badge */}
          <div className="inline-flex items-center gap-2
                        rounded-full
                        bg-emerald-100 dark:bg-emerald-500/20
                        border border-emerald-200 dark:border-emerald-500/30
                        px-3 py-1.5 shadow-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full
                             rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2
                             bg-emerald-500 dark:bg-emerald-400" />
            </div>
            <span className="text-[10px] font-bold
                           text-emerald-700 dark:text-emerald-300
                           uppercase tracking-wider">
              Live
            </span>
          </div>

          {/* VEZI TOATE — navighează la rapoarte depozitare */}
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5
                     rounded-full
                     bg-gradient-to-r from-emerald-500 to-teal-600
                     hover:from-emerald-600 hover:to-teal-700
                     px-3 py-1.5
                     text-[10px] font-bold text-white uppercase tracking-wider
                     shadow-md hover:shadow-lg
                     transition-all duration-300
                     hover:scale-105"
          >
            <Radio className="w-3 h-3" />
            Vezi toate
          </button>
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex flex-1 flex-col gap-2
                    overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        {data.map((ticket, idx) => {
          const sectorNum = ticket.sector_number || 1;
          const colorConfig = getColorConfig(sectorNum);

          return (
            <div key={ticket.ticket_id || idx} className="group relative">
              <div className="relative flex items-center gap-3
                          rounded-[20px]
                          border border-gray-200 dark:border-gray-700/50
                          bg-gray-50 dark:bg-gray-900/30
                          px-4 py-3
                          hover:bg-white dark:hover:bg-gray-900/50
                          hover:border-gray-300 dark:hover:border-gray-600
                          hover:shadow-md dark:hover:shadow-lg
                          transition-all duration-300 ease-out
                          hover:-translate-y-0.5">

                <div className="absolute inset-y-0 left-0 w-1 rounded-l-[20px]
                            bg-gradient-to-b from-emerald-500 to-teal-500
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300" />

                {/* SECTOR BADGE */}
                <div className={`flex-shrink-0 flex items-center justify-center
                              w-10 h-10 rounded-[14px] ${colorConfig.badge}
                              shadow-sm ${colorConfig.glow}
                              group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-sm font-bold text-white">{sectorNum}</span>
                </div>

                {/* CENTER INFO */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white
                              truncate leading-tight mb-1">
                    {ticket.supplier_name || "Operator necunoscut"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="font-mono font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {ticket.waste_code}
                    </span>
                    {ticket.vehicle_number && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="font-medium">{ticket.vehicle_number}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT INFO */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-base font-bold ${colorConfig.text} leading-tight mb-1`}>
                    {ticket.net_weight_tons_formatted ||
                      `${(ticket.net_weight_tons || 0).toLocaleString('ro-RO', {
                        minimumFractionDigits: 2, maximumFractionDigits: 2
                      })}`}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium ml-1">t</span>
                  </div>
                  <div className="flex items-center justify-end gap-1
                              text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(ticket.ticket_date)}</span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span>{formatTime(ticket.ticket_date || ticket.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center flex-col gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50
                          flex items-center justify-center">
              <Radio className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Nu există înregistrări pentru perioada selectată
            </p>
          </div>
        )}
      </div>
      {/* FOOTER ELIMINAT — info e în header, buton e lângă LIVE */}
    </div>
  );
};

export default RecentTicketsTable;