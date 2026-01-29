// src/components/institutions/InstitutionViewModal.jsx
/**
 * ============================================================================
 * INSTITUTION VIEW MODAL - ELEGANT DESIGN
 * ============================================================================
 */

import {
  X, Building2, Mail, Phone, MapPin, Globe,
  User, Calendar,
} from 'lucide-react';

const InstitutionViewModal = ({
  isOpen,
  onClose,
  institution,
  institutionTypes = {},
}) => {
  if (!isOpen || !institution) return null;

  const typeInfo = institutionTypes[institution.type] || { label: institution.type, color: 'gray' };

  const getTypeGradient = (color) => {
    const gradients = {
      teal: 'from-teal-500 to-emerald-600',
      blue: 'from-blue-500 to-indigo-600',
      cyan: 'from-cyan-500 to-blue-600',
      indigo: 'from-indigo-500 to-purple-600',
      orange: 'from-orange-500 to-red-600',
      amber: 'from-amber-500 to-orange-600',
      purple: 'from-purple-500 to-pink-600',
      pink: 'from-pink-500 to-rose-600',
      yellow: 'from-yellow-500 to-amber-600',
      gray: 'from-gray-500 to-slate-600',
      slate: 'from-slate-500 to-gray-600',
      stone: 'from-stone-500 to-gray-600',
    };
    return gradients[color] || gradients.teal;
  };

  // Get email and phone from various possible field names
  const email = institution.email || institution.contact_email;
  const phone = institution.phone || institution.contact_phone;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Gradient */}
          <div className={`relative bg-gradient-to-br ${getTypeGradient(typeInfo.color)} px-6 py-6`}>
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Institution info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                    {typeInfo.label}
                  </span>
                  {institution.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100">
                      Activ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-400/20 text-gray-200">
                      Inactiv
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {institution.name}
                </h2>
                {institution.short_name && institution.short_name !== institution.name && (
                  <p className="text-white/70 text-sm mt-0.5">
                    {institution.short_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)] space-y-5">
            
            {/* Contact Info */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Contact
              </h3>
              <div className="space-y-3">
                {email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <a href={`mailto:${email}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {email}
                      </a>
                    </div>
                  </div>
                )}
                
                {phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                      <a href={`tel:${phone}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {institution.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                      <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {institution.website}
                      </a>
                    </div>
                  </div>
                )}

                {institution.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Adresă</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {institution.address}
                      </p>
                    </div>
                  </div>
                )}

                {!email && !phone && !institution.website && !institution.address && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Nicio informație de contact
                  </p>
                )}
              </div>
            </div>

            {/* Representative */}
            {(institution.representative_name || institution.representative_position || 
              institution.representative_function || institution.representative_phone || 
              institution.representative_email) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Reprezentant Legal
                </h3>
                <div className="space-y-3">
                  {/* Name and Position */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {institution.representative_name || '-'}
                      </p>
                      {(institution.representative_position || institution.representative_function) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {institution.representative_position || institution.representative_function}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone and Email */}
                  {(institution.representative_phone || institution.representative_email) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {institution.representative_phone && (
                        <a
                          href={`tel:${institution.representative_phone}`}
                          className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate transition-colors">
                              {institution.representative_phone}
                            </p>
                          </div>
                        </a>
                      )}

                      {institution.representative_email && (
                        <a
                          href={`mailto:${institution.representative_email}`}
                          className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate transition-colors">
                              {institution.representative_email}
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sectors */}
            {institution.sectors && institution.sectors.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Sectoare Arondate
                </h3>
                <div className="flex flex-wrap gap-2">
                  {institution.sectors.map(s => (
                    <span 
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-sm font-medium rounded-lg border border-teal-200 dark:border-teal-500/20"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Sector {s.sector_number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CUI / CIF */}
            {(institution.cui || institution.cif || institution.fiscal_code) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Date Fiscale
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(institution.cui || institution.fiscal_code) && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400">CUI</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{institution.cui || institution.fiscal_code}</p>
                    </div>
                  )}
                  {institution.cif && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400">CIF</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{institution.cif}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {institution.notes && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Observații
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  {institution.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstitutionViewModal;