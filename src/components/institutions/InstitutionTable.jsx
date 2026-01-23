// src/components/institutions/InstitutionTable.jsx
/**
 * ============================================================================
 * INSTITUTION TABLE - MODERN EXPANDABLE TABLE
 * ============================================================================
 * Design: Amber/Orange theme - consistent cu stilul aplicației
 */

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';
import { getInstitutionTypeLabel, getInstitutionTypeBadgeColor } from '../../constants/institutionTypes';

const InstitutionTable = ({
  institutions = [],
  loading = false,
  expandedRows = new Set(),
  onToggleExpand,
  onEdit,
  onDelete,
  onView,
  onAddContract,
  institutionContracts = {},
  loadingContracts = {},
  sortBy = 'name',
  sortOrder = 'asc',
  onSort,
  canEdit = false,
  canDelete = false,
}) => {
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />;
  };

  const SortableHeader = ({ column, children, className = '' }) => (
    <th
      className={`group px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 
                uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200
                transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {getSortIcon(column)}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[20px] overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 
                        rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă instituțiile...</p>
        </div>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[20px] overflow-hidden shadow-sm">
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 
                        flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Nicio instituție găsită
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Modificați filtrele sau adăugați o instituție nouă.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  border border-gray-200 dark:border-gray-700/50
                  rounded-[20px] overflow-hidden shadow-sm">
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
              <th className="w-12 px-4 py-3"></th>
              <SortableHeader column="name">Instituție</SortableHeader>
              <SortableHeader column="type">Tip</SortableHeader>
              <SortableHeader column="sector">Sectoare</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {institutions.map((institution) => {
              const isExpanded = expandedRows.has(institution.id);
              const contracts = institutionContracts[institution.id] || [];
              const isLoadingContracts = loadingContracts[institution.id];
              
              return (
                <>
                  {/* Main Row */}
                  <tr
                    key={institution.id}
                    className={`
                      group transition-colors duration-200
                      ${isExpanded 
                        ? 'bg-amber-50/50 dark:bg-amber-500/5' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                    `}
                  >
                    {/* Expand Button */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onToggleExpand(institution.id)}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          transition-all duration-200
                          ${isExpanded 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-amber-100 hover:text-amber-600'}
                        `}
                      >
                        {isExpanded 
                          ? <ChevronDown className="w-4 h-4" /> 
                          : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    
                    {/* Institution Name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 
                                      flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {institution.name}
                          </p>
                          {institution.short_name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {institution.short_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Type Badge */}
                    <td className="px-4 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${getInstitutionTypeBadgeColor(institution.type)}
                      `}>
                        {getInstitutionTypeLabel(institution.type)}
                      </span>
                    </td>
                    
                    {/* Sectors */}
                    <td className="px-4 py-4">
                      {institution.sector ? (
                        <div className="flex flex-wrap gap-1">
                          {institution.sector.split(',').map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center justify-center w-6 h-6 
                                       rounded-md bg-blue-100 dark:bg-blue-500/20 
                                       text-xs font-bold text-blue-700 dark:text-blue-400"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    
                    {/* Contact */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {institution.contact_email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{institution.contact_email}</span>
                          </div>
                        )}
                        {institution.contact_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{institution.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      {institution.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                                       bg-emerald-100 dark:bg-emerald-500/20 
                                       text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Activ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                                       bg-gray-100 dark:bg-gray-700 
                                       text-xs font-semibold text-gray-600 dark:text-gray-400">
                          <XCircle className="w-3 h-3" />
                          Inactiv
                        </span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(institution)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 
                                   hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Vizualizează"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {canEdit && (
                          <button
                            onClick={() => onEdit(institution)}
                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 
                                     hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            title="Editează"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => onDelete(institution)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 
                                     hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Șterge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row - Details & Contracts */}
                  {isExpanded && (
                    <tr key={`${institution.id}-expanded`}>
                      <td colSpan={7} className="px-4 py-0">
                        <div className="py-4 pl-12 pr-4 bg-amber-50/30 dark:bg-amber-500/5 
                                      border-t border-amber-100 dark:border-amber-500/10">
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" />
                                Detalii Instituție
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {institution.fiscal_code && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cod Fiscal</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{institution.fiscal_code}</p>
                                  </div>
                                )}
                                {institution.registration_no && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nr. Înregistrare</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{institution.registration_no}</p>
                                  </div>
                                )}
                                {institution.address && (
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> Adresă
                                    </p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{institution.address}</p>
                                  </div>
                                )}
                                {institution.website && (
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                      <Globe className="w-3 h-3" /> Website
                                    </p>
                                    <a 
                                      href={institution.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
                                    >
                                      {institution.website}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Right: Contracts */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-500" />
                                  Contracte
                                </h4>
                                {canEdit && (
                                  <button
                                    onClick={() => onAddContract(institution)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 
                                             bg-amber-500 hover:bg-amber-600 text-white 
                                             text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Adaugă Contract
                                  </button>
                                )}
                              </div>
                              
                              {isLoadingContracts ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                  Se încarcă contractele...
                                </div>
                              ) : contracts.length > 0 ? (
                                <div className="space-y-2">
                                  {contracts.slice(0, 3).map((contract, idx) => (
                                    <div 
                                      key={idx}
                                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {contract.contract_number || `Contract #${idx + 1}`}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          contract.is_active 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                          {contract.is_active ? 'Activ' : 'Inactiv'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  {contracts.length > 3 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                      + încă {contracts.length - 3} contracte
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  Niciun contract înregistrat
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstitutionTable;