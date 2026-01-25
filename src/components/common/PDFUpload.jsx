// src/components/common/PDFUpload.jsx
/**
 * ============================================================================
 * PDF UPLOAD COMPONENT
 * ============================================================================
 */

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, Eye, Download, AlertCircle } from 'lucide-react';
import { uploadContractPDF, deleteContractPDF } from '../../utils/supabaseStorage';

const PDFUpload = ({
  value = null,
  onChange,
  onView,
  contractType = 'DISPOSAL',
  contractNumber = '',
  isAmendment = false,
  amendmentNumber = null,
  disabled = false,
  label = 'Document PDF',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Doar fișiere PDF sunt acceptate');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Fișierul depășește limita de 20MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const result = await uploadContractPDF(
        file,
        contractType,
        contractNumber || 'temp',
        isAmendment,
        amendmentNumber
      );

      if (result.success) {
        onChange({
          url: result.url,
          fileName: result.fileName,
          storagePath: result.storagePath,
        });
      } else {
        setError(result.error || 'Eroare la încărcare');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Eroare la încărcarea fișierului');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value?.url) {
      try {
        await deleteContractPDF(value.url, contractType);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleView = () => {
    if (value?.url && onView) {
      onView(value.url, value.fileName);
    }
  };

  const handleDownload = () => {
    if (value?.url) {
      window.open(value.url, '_blank');
    }
  };

  // Has file uploaded
  if (value?.url) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {value.fileName || 'Document.pdf'}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Încărcat cu succes
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onView && (
              <button
                type="button"
                onClick={handleView}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Vizualizează"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-colors"
              title="Descarcă"
            >
              <Download className="w-4 h-4" />
            </button>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Șterge"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Upload area
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${dragOver 
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click pentru a selecta sau trage fișierul aici
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Doar PDF, maxim 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default PDFUpload;