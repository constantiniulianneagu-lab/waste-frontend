// src/components/dashboard/RecentTicketsTable.jsx
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

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
      {/* HEADER */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ultimele înregistrări
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Până la 50 de tichete recente
          </p>
        </div>

        {/* Badge „Live” */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400">
          <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      {/* LISTĂ CU SCROLL */}
      <div className="flex max-h-[420px] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1">
        {data.map((ticket, idx) => {
          const sectorNum = ticket.sector_number || 1;
          const colorConfig = getColorConfig(sectorNum);

          return (
            <div
              key={ticket.ticket_id || idx}
              className="group relative flex flex-shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm shadow-xs transition-all duration-300 hover:scale-[1.02] hover:border-gray-200 hover:bg-white hover:shadow-lg dark:border-gray-800 dark:bg-[#0f1419] dark:hover:border-gray-700 dark:hover:bg-[#101623]"
            >
              {/* Bară colorată stânga */}
              <div
                className={`absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b ${colorConfig.gradient}`}
              />

              {/* Badge sector */}
              <div
                className={`
                  ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center 
                  rounded-xl bg-gradient-to-br ${colorConfig.gradient}
                  text-xs font-semibold text-white shadow-md
                `}
              >
                {sectorNum}
              </div>

              {/* Info tichet */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
                  Cod deșeu: {ticket.waste_code}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{formatDate(ticket.ticket_date)}</span>
                  <span>•</span>
                  <span>Tichet {ticket.ticket_number}</span>
                  {ticket.vehicle_number && (
                    <>
                      <span>•</span>
                      <span>{ticket.vehicle_number}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cantitate + oră */}
              <div className="flex flex-shrink-0 flex-col items-end text-right">
                <p
                  className={`
                    bg-gradient-to-r ${colorConfig.gradient}
                    bg-clip-text text-[15px] font-bold text-transparent
                  `}
                >
                  {ticket.net_weight_tons_formatted ??
                    `${(ticket.net_weight_tons || 0).toFixed(2)} t`}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  {formatTime(ticket.ticket_date || ticket.created_at)}
                </p>
              </div>

              {/* Icon „deschide” */}
              <button
                type="button"
                className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-colors group-hover:border-emerald-500 group-hover:bg-emerald-500/10 dark:border-gray-700 dark:bg-[#0f1419] dark:text-gray-400 dark:group-hover:border-emerald-400"
                title="Deschide tichet"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Nu există tichete pentru perioada selectată.
          </div>
        )}
      </div>

      {/* FOOTER */}
      {data.length > 0 && (
        <div className="mt-4 flex flex-shrink-0 items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500 dark:border-gray-700 dark:bg-[#0f1419] dark:text-gray-400">
          <span>
            Afișate{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {data.length}
            </span>{" "}
            tichete recente
          </span>
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Vezi toate
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTicketsTable;
