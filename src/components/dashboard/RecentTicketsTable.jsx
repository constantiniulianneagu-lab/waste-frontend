import React from "react";
import { ExternalLink } from "lucide-react";

const RecentTicketsTable = ({ data = [], loading = false }) => {
  // Culori uniforme pe sectoare
  const sectorColors = {
    1: { gradient: "from-violet-500 to-violet-600" },
    2: { gradient: "from-slate-200 to-slate-300" },
    3: { gradient: "from-emerald-500 to-emerald-600" },
    4: { gradient: "from-amber-500 to-amber-600" },
    5: { gradient: "from-pink-500 to-rose-500" },
    6: { gradient: "from-cyan-500 to-sky-500" },
  };

  const getColorConfig = (sectorNum) =>
    sectorColors[sectorNum] || sectorColors[1];

  // Formatări
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

  /* LOADING SKELETON */
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
        <div className="mb-6">
          <div className="h-5 w-44 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  // Date mock pentru demo
  const mockData = data.length > 0 ? data : [
    {
      ticket_id: 1,
      sector_number: 3,
      operator_name: "Ion Popescu",
      waste_code: "20 03 01",
      vehicle_number: "B-123-ABC",
      net_weight_tons: 12.45,
      ticket_date: new Date().toISOString(),
    },
    {
      ticket_id: 2,
      sector_number: 1,
      operator_name: "Maria Ionescu",
      waste_code: "17 01 07",
      vehicle_number: "IF-456-DEF",
      net_weight_tons: 8.30,
      ticket_date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      ticket_id: 3,
      sector_number: 4,
      operator_name: "Gheorghe Dumitrescu",
      waste_code: "15 01 06",
      vehicle_number: "B-789-GHI",
      net_weight_tons: 15.80,
      ticket_date: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
      {/* HEADER */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ultimele înregistrări
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            50 înregistrări recente
          </p>
        </div>

        {/* Badge „Live" */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Live
        </div>
      </div>

      {/* LISTĂ CU SCROLL */}
      <div className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1">
        {mockData.map((ticket, idx) => {
          const sectorNum = ticket.sector_number || 1;
          const colorConfig = getColorConfig(sectorNum);

          return (
            <div
              key={ticket.ticket_id || idx}
              className="group relative flex flex-shrink-0 items-center gap-4 rounded-2xl border border-gray-100/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-emerald-200/60 hover:bg-white hover:shadow-md dark:border-gray-800/50 dark:bg-[#1a1f2e]/50 dark:hover:border-emerald-500/30 dark:hover:bg-[#1a1f2e]"
            >
              {/* Badge sector - eco design */}
              <div
                className={`
                  flex h-12 w-12 flex-shrink-0 items-center justify-center 
                  rounded-xl bg-gradient-to-br ${colorConfig.gradient}
                  text-sm font-bold text-white shadow-lg
                  ring-2 ring-white/20 dark:ring-white/10
                `}
              >
                {sectorNum}
              </div>

              {/* Info operator și deșeu */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {ticket.operator_name || "Operator necunoscut"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{ticket.waste_code}</span>
                  {ticket.vehicle_number && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>{ticket.vehicle_number}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cantitate + Dată/Oră */}
              <div className="flex flex-shrink-0 flex-col items-end text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {ticket.net_weight_tons_formatted ??
                    `${(ticket.net_weight_tons || 0).toFixed(2)}`}
                  <span className="ml-1 text-xs font-medium text-gray-400">t</span>
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{formatDate(ticket.ticket_date)}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{formatTime(ticket.ticket_date || ticket.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {mockData.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Nu există tichete pentru perioada selectată.
          </div>
        )}
      </div>

      {/* FOOTER */}
      {mockData.length > 0 && (
        <div className="mt-4 flex flex-shrink-0 items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-xs text-gray-600 backdrop-blur-sm dark:border-gray-800/50 dark:bg-[#1a1f2e]/30 dark:text-gray-400">
          <span>
            Afișate{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {mockData.length}
            </span>{" "}
            înregistrări
          </span>
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-emerald-600 hover:to-emerald-700"
          >
            Vezi toate
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTicketsTable;