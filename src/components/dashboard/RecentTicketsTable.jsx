/**
 * ============================================================================
 * RECENT TICKETS TABLE COMPONENT
 * ============================================================================
 * 
 * Table showing the 50 most recent waste tickets
 * with:
 * - Ticket number and date
 * - Operator name with sector icon
 * - Waste code and description
 * - Vehicle number
 * - Net weight
 * 
 * Props:
 * - data: Array of recent tickets (max 50)
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React, { useState } from 'react';
import { Calendar, Truck, FileText, Package } from 'lucide-react';
import { formatDateTime, truncateText, getSectorIconClasses } from '../utils/dashboardUtils';

const RecentTicketsTable = ({ data = [], loading = false }) => {
  const [showAll, setShowAll] = useState(false);

  // Show top 20 by default, or all (max 50) if showAll is true
  const displayData = showAll ? data : data.slice(0, 20);

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Nu există înregistrări recente pentru perioada selectată
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Ultimele înregistrări
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            50 înregistrări recente
          </p>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cod deșeu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vehicul
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cantitate
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Operator with Sector Icon */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        font-bold text-sm flex-shrink-0
                        ${getSectorIconClasses(ticket.sector_number)}
                      `}
                    >
                      {ticket.sector_number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {truncateText(ticket.supplier_name, 30)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cod: {ticket.ticket_number}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Waste Code */}
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {ticket.waste_code}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {truncateText(ticket.waste_description, 40)}
                    </p>
                  </div>
                </td>

                {/* Vehicle */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.vehicle_number}
                    </span>
                  </div>
                </td>

                {/* Weight */}
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {ticket.net_weight_tons_formatted}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    tone
                  </p>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(ticket.ticket_date)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {displayData.map((ticket) => (
          <div
            key={ticket.ticket_id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Operator with Sector */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-lg flex-shrink-0
                  ${getSectorIconClasses(ticket.sector_number)}
                `}
              >
                {ticket.sector_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {ticket.supplier_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {ticket.ticket_number}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Cod deșeu
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {ticket.waste_code}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Vehicul
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {ticket.vehicle_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Cantitate
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {ticket.net_weight_tons_formatted}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Data
                </p>
                <p className="text-xs text-gray-900 dark:text-white">
                  {formatDateTime(ticket.ticket_date)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {data.length > 20 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 
                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                     rounded-lg transition-colors"
          >
            {showAll ? (
              <>Arată mai puțin ({data.length - 20} ascunse)</>
            ) : (
              <>Arată toate ({data.length - 20} mai mult)</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTicketsTable;