// src/services/exportService.js
/**
 * ============================================================================
 * EXPORT SERVICE - Excel, PDF, CSV - CORECTAT
 * ============================================================================
 * 
 * ✅ Adăugate coloane: Tip Contract, Generator
 * ✅ Support pentru toate tipurile de rapoarte
 * 
 * ============================================================================
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import DejaVuSans from '../assets/fonts/DejaVuSans';


/**
 * Format număr românesc pentru export
 */
const formatNumberRO = (number) => {
  if (!number && number !== 0) return '0,00';
  const num = typeof number === 'string' ? parseFloat(number) : number;
  const formatted = num.toFixed(2);
  const [intPart, decPart] = formatted.split('.');
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intWithDots},${decPart}`;
};

/**
 * Helper pentru a obține numele locației în export
 */
const getLocationName = (filters, sectors, summaryData) => {
  // Prioritate 1: dacă e filtru pe sector, folosește numele din listă
  if (filters?.sector_id && sectors && sectors.length > 0) {
    const selectedSector = sectors.find(s => s.id === filters.sector_id || s.sector_id === filters.sector_id);
    if (selectedSector) {
      return `Sectorul ${selectedSector.sector_number}`;
    }
  }
  
  // Prioritate 2: nume din backend (doar dacă nu e filtru sector)
  if (summaryData?.period?.sector && !filters?.sector_id) {
    return summaryData.period.sector;
  }
  
  // Default: București
  return 'București';
};

/**
 * Format dată RO pentru export
 */
const formatDateRO = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ro-RO');
};

/**
 * ============================================================================
 * EXPORT TO EXCEL
 * ============================================================================
 */
export const exportToExcel = (tickets, summaryData, filters, reportType = 'landfill', sectors = []) => {
  try {
    console.log('📊 Exporting to Excel...', { tickets: tickets.length, reportType });

    // Configurare coloane per tip raport
    const columnsConfig = {
      landfill: [
        { header: 'Tichet Cântar', key: 'ticket_number' },
        { header: 'Data', key: 'ticket_date', format: 'date' },
        { header: 'Furnizor', key: 'supplier_name' },
        { header: 'Cod Deșeu', key: 'waste_code' },
        { header: 'Descriere Deșeu', key: 'waste_description' },
        { header: 'Tip Contract', key: 'contract_type' },
        { header: 'Generator', key: 'generator_type' },
        { header: 'Sector', key: 'sector_name' },
        { header: 'Nr. Auto', key: 'vehicle_number' },
        { header: 'Tone Net', key: 'net_weight_tons', format: 'number' },
      ],
      tmb: [
        { header: 'Tichet Cântar', key: 'ticket_number' },
        { header: 'Data', key: 'ticket_date', format: 'date' },
        { header: 'Ora', key: 'ticket_time' },
        { header: 'Furnizor', key: 'supplier_name' },
        { header: 'Prestator TMB', key: 'operator_name' },
        { header: 'Cod Deșeu', key: 'waste_code' },
        { header: 'Descriere Deșeu', key: 'waste_description' },
        { header: 'Proveniență', key: 'sector_name' },
        { header: 'Generator', key: 'generator_type' },
        { header: 'Nr. Auto', key: 'vehicle_number' },
        { header: 'Tone Net', key: 'net_weight_tons', format: 'number' },
      ],
      recycling: [
        { header: 'Tichet Cântar', key: 'ticket_number' },
        { header: 'Data', key: 'ticket_date', format: 'date' },
        { header: 'Client', key: 'client_name' },
        { header: 'Furnizor', key: 'supplier_name' },
        { header: 'Cod Deșeu', key: 'waste_code' },
        { header: 'Proveniență', key: 'sector_name' },
        { header: 'Nr. Auto', key: 'vehicle_number' },
        { header: 'Cant. Livrată (t)', key: 'delivered_quantity_tons', format: 'number' },
        { header: 'Cant. Acceptată (t)', key: 'accepted_quantity_tons', format: 'number' },
      ],
    };

    const columns = columnsConfig[reportType] || columnsConfig.landfill;

    // Transformă datele pentru Excel
    const excelData = tickets.map(ticket => {
      const row = {};
      columns.forEach(col => {
        // ✅ FIX: Pentru recycling, mapăm recipient_name la client_name
        let value = ticket[col.key];
        if (reportType === 'recycling' && col.key === 'client_name' && !value) {
          value = ticket.recipient_name;
        }
        
        if (col.format === 'number') {
          row[col.header] = formatNumberRO(value);
        } else if (col.format === 'date') {
          row[col.header] = formatDateRO(value);
        } else {
          row[col.header] = value || '';
        }
      });
      return row;
    });

    // Creează workbook
    const wb = XLSX.utils.book_new();

    // ✅ Titluri specifice pentru fiecare tip de raport
    const reportTitles = {
      tmb: 'RAPORT DEȘEURI - Deșeuri trimise la tratare mecano-biologică',
      recycling: 'RAPORT DEȘEURI - Deșeuri trimise la reciclare',
      recovery: 'RAPORT DEȘEURI - Deșeuri trimise la valorificare',
      disposal: 'RAPORT DEȘEURI - Deșeuri trimise la eliminare',
      rejected: 'RAPORT DEȘEURI - Deșeuri respinse',
      landfill: 'RAPORT DEȘEURI - Depozitare'
    };

    // Sheet 1: Summary
    const summaryData_array = [
      [reportTitles[reportType] || 'RAPORT DEȘEURI'],
      [''],
      ['Perioada analizată'],
      ['An:', filters.year || ''],
      ['De la:', formatDateRO(filters.from) || ''],
      ['Până la:', formatDateRO(filters.to) || ''],
      ['Locație:', getLocationName(filters, sectors, summaryData)],
      [''],
      ['Total cantitate:', `${formatNumberRO(summaryData?.total_quantity || summaryData?.total_delivered || 0)} tone`],
      ['Total tichete:', summaryData?.total_tickets || tickets.length],
      [''],
      ['Generat la:', new Date().toLocaleString('ro-RO')]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData_array);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Sumar');

    // Sheet 2: Data
    const dataSheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Înregistrări');

    // Download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Raport_${reportType}_${filters.year}_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log('✅ Excel exported successfully:', filename);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Export Excel error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================================================
 * EXPORT TO PDF — Layout profesional cu header ADIGIDMB
 * ============================================================================
 */

import adigidmbLogo from '../assets/branding/adigidmbLogo';

// A4 landscape: 297 x 210mm
const M_LEFT  = 12;
const M_RIGHT = 12;
// Linie header: de la 12 la 285 => TABLE_WIDTH = 273
const LINE_START = M_LEFT;
const LINE_END   = 297 - M_RIGHT; // 285
const TABLE_WIDTH = LINE_END - LINE_START; // 273

const PDF_CONFIG = {
  landfill: {
    title: 'CENTRALIZATOR DATE DEPOZITARE DESEURI',
    headerColor: [217, 119, 6],
    altRowColor: [255, 251, 235],
    filename: 'RAPORT_DEPOZITARE_DESEURI',
    columns: ['Tichet', 'Data', 'Furnizor', 'Cod', 'Tip Contract', 'Generator', 'Sector', 'Auto', 'Tone Net'],
    colWidths: [20, 20, 72, 18, 25, 42, 22, 22, 18],
    dataFn: (t) => [
      t.ticket_number || '-',
      formatDateRO(t.ticket_date),
      t.supplier_name || '-',
      t.waste_code || '-',
      t.contract_type || '-',
      t.generator_type || '-',
      t.sector_name || '-',
      t.vehicle_number || '-',
      formatNumberRO(t.net_weight_tons),
    ],
  },
  tmb: {
    title: 'CENTRALIZATOR DATE TRATARE MECANO-BIOLOGICA (TMB)',
    headerColor: [5, 150, 105],
    altRowColor: [236, 253, 245],
    filename: 'RAPORT_TMB',
    columns: ['Tichet', 'Data', 'Ora', 'Furnizor', 'Prestator TMB', 'Cod', 'Provenienta', 'Generator', 'Auto', 'Tone Net'],
    colWidths: [20, 20, 15, 48, 40, 18, 24, 30, 22, 18],
    dataFn: (t) => [
      t.ticket_number || '-',
      formatDateRO(t.ticket_date),
      t.ticket_time || '-',
      t.supplier_name || '-',
      t.operator_name || '-',
      t.waste_code || '-',
      t.sector_name || '-',
      t.generator_type || '-',
      t.vehicle_number || '-',
      formatNumberRO(t.net_weight_tons),
    ],
  },
  recycling: {
    title: 'CENTRALIZATOR DATE DESEURI TRIMISE LA RECICLARE',
    headerColor: [5, 150, 105],
    altRowColor: [236, 253, 245],
    filename: 'RAPORT_RECICLARE',
    columns: ['Tichet', 'Data', 'Furnizor', 'Client', 'Cod', 'Provenienta', 'Auto', 'Livrata (t)', 'Acceptata (t)'],
    colWidths: [20, 20, 60, 54, 18, 24, 22, 28, 28],
    dataFn: (t) => [
      t.ticket_number || '-',
      formatDateRO(t.ticket_date),
      t.supplier_name || '-',
      t.recipient_name || t.client_name || '-',
      t.waste_code || '-',
      t.sector_name || '-',
      t.vehicle_number || '-',
      formatNumberRO(t.delivered_quantity_tons),
      formatNumberRO(t.accepted_quantity_tons),
    ],
  },
  recovery: {
    title: 'CENTRALIZATOR DATE DESEURI TRIMISE LA VALORIFICARE',
    headerColor: [225, 29, 72],
    altRowColor: [255, 241, 242],
    filename: 'RAPORT_VALORIFICARE',
    columns: ['Tichet', 'Data', 'Furnizor', 'Client', 'Cod', 'Provenienta', 'Auto', 'Livrata (t)', 'Acceptata (t)'],
    colWidths: [20, 20, 60, 54, 18, 24, 22, 28, 28],
    dataFn: (t) => [
      t.ticket_number || '-',
      formatDateRO(t.ticket_date),
      t.supplier_name || '-',
      t.recipient_name || t.client_name || '-',
      t.waste_code || '-',
      t.sector_name || '-',
      t.vehicle_number || '-',
      formatNumberRO(t.delivered_quantity_tons),
      formatNumberRO(t.accepted_quantity_tons),
    ],
  },
  disposal: {
    title: 'CENTRALIZATOR DATE DESEURI TRIMISE LA ELIMINARE',
    headerColor: [217, 119, 6],
    altRowColor: [255, 251, 235],
    filename: 'RAPORT_ELIMINARE',
    columns: ['Tichet', 'Data', 'Furnizor', 'Client', 'Cod', 'Provenienta', 'Auto', 'Livrata (t)', 'Acceptata (t)'],
    colWidths: [20, 20, 60, 54, 18, 24, 22, 28, 28],
    dataFn: (t) => [
      t.ticket_number || '-',
      formatDateRO(t.ticket_date),
      t.supplier_name || '-',
      t.recipient_name || t.client_name || '-',
      t.waste_code || '-',
      t.sector_name || '-',
      t.vehicle_number || '-',
      formatNumberRO(t.delivered_quantity_tons),
      formatNumberRO(t.accepted_quantity_tons),
    ],
  },
};

export const exportToPDF = (tickets, summaryData, filters, reportType = 'landfill', sectors = []) => {
  try {
    const cfg = PDF_CONFIG[reportType] || PDF_CONFIG.landfill;
    const doc = new jsPDF('l', 'mm', 'a4');
    const PW = doc.internal.pageSize.width;   // 297mm
    const PH = doc.internal.pageSize.height;  // 210mm
    const [r, g, b] = cfg.headerColor;

    doc.addFileToVFS('DejaVuSans.ttf', DejaVuSans);
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');

    // ── HEADER ────────────────────────────────────────────────────────────
    // Titlu + logo pe acelasi rand
    // Logo: ratio 300:126 (= 2.381:1), inaltime 16mm => latime 38.1mm
    const logoH = 16;
    const logoW = logoH * (300 / 126); // ~38.1mm
    const logoX = LINE_END - logoW;    // aliniat la dreapta pe linia header

    const drawHeader = () => {
      // Titlu stanga
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(r, g, b);
      doc.text(cfg.title, LINE_START, 14);

      // Logo dreapta, aliniat cu capatul liniei
      doc.addImage(
        'data:image/jpeg;base64,' + adigidmbLogo,
        'JPEG',
        logoX, 3, logoW, logoH
      );

      // Linie separator — exact de la LINE_START la LINE_END
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.6);
      doc.line(LINE_START, 21, LINE_END, 21);
    };

    // ── FOOTER ────────────────────────────────────────────────────────────
    const drawFooter = (pageNum, total) => {
      doc.setPage(pageNum);
      doc.setFont('DejaVuSans', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Raport generat automat din SAMD \u00b7 Reflecta filtrele aplicate la momentul exportului.',
        LINE_START, PH - 11
      );
      doc.text(
        `Generat la data: ${new Date().toLocaleString('ro-RO')}`,
        LINE_START, PH - 7
      );
      doc.text(`Pagina ${pageNum} din ${total}`, LINE_END, PH - 9, { align: 'right' });
    };

    // ── PAGINA 1 ──────────────────────────────────────────────────────────
    drawHeader();

    const location = getLocationName(filters, sectors, summaryData);
    const dateFrom = formatDateRO(filters.from) || '';
    const dateTo   = formatDateRO(filters.to)   || '';
    const totalQty = formatNumberRO(
      summaryData?.total_quantity || summaryData?.total_delivered || 0
    );
    const totalTickets = summaryData?.total_tickets || tickets.length;

    let y = 29;
    const meta = [
      ['Locatie:', location],
      ['Perioada:', `${dateFrom} - ${dateTo}`],
      ['Total cantitate:', `${totalQty} t`],
      ['Total tichete:', String(totalTickets)],
    ];

    doc.setFontSize(10);
    meta.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(label, LINE_START, y);
      doc.setTextColor(20, 20, 20);
      doc.text(val, LINE_START + 38, y);
      y += 6;
    });

    // ── TABEL ─────────────────────────────────────────────────────────────
    // colWidths trebuie sa sumeze exact TABLE_WIDTH (273mm)
    const totalColW = cfg.colWidths.reduce((a, b) => a + b, 0);
    const scale = TABLE_WIDTH / totalColW;
    const scaledCols = cfg.colWidths.map(w => +(w * scale).toFixed(2));
    // Ajustare rounding error pe ultima coloana
    const diff = TABLE_WIDTH - scaledCols.reduce((a, b) => a + b, 0);
    scaledCols[scaledCols.length - 1] = +(scaledCols[scaledCols.length - 1] + diff).toFixed(2);

    const colStyles = scaledCols.reduce((acc, w, i) => {
      acc[i] = { cellWidth: w };
      return acc;
    }, {});

    const tableData = tickets.map(cfg.dataFn);

    autoTable(doc, {
      head: [cfg.columns],
      body: tableData,
      startY: y + 2,
      theme: 'grid',
      tableWidth: TABLE_WIDTH,
      columnStyles: colStyles,
      styles: {
        font: 'DejaVuSans',
        fontSize: 7,
        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        overflow: 'ellipsize',
        lineColor: [210, 210, 210],
        lineWidth: 0.2,
        textColor: [30, 30, 30],
        valign: 'middle',
      },
      headStyles: {
        font: 'helvetica',
        fontStyle: 'bold',
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontSize: 8,
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        halign: 'left',
      },
      bodyStyles: {
        font: 'DejaVuSans',
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: cfg.altRowColor,
      },
      didDrawPage: () => {
        drawHeader();
      },
      margin: { left: LINE_START, right: M_RIGHT, top: 25 },
    });

    // ── FOOTERE ───────────────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      drawFooter(i, totalPages);
    }

    const ts = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`${cfg.filename}_${filters.year || ''}_${ts}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Export PDF error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================================================
 * EXPORT TO CSV
 * ============================================================================
 */
export const exportToCSV = (tickets, summaryData, filters, reportType = 'landfill', sectors = []) => {
  try {
    console.log('📋 Exporting to CSV...', { tickets: tickets.length, reportType });

    // Configurare coloane per tip raport
    const columnsConfig = {
      landfill: [
        { label: 'Tichet Cântar', key: 'ticket_number' },
        { label: 'Data', key: 'ticket_date', format: 'date' },
        { label: 'Furnizor', key: 'supplier_name' },
        { label: 'Cod Deșeu', key: 'waste_code' },
        { label: 'Descriere Deșeu', key: 'waste_description' },
        { label: 'Tip Contract', key: 'contract_type' },
        { label: 'Generator', key: 'generator_type' },
        { label: 'Sector', key: 'sector_name' },
        { label: 'Nr. Auto', key: 'vehicle_number' },
        { label: 'Tone Net', key: 'net_weight_tons', format: 'number' },
      ],
      tmb: [
        { label: 'Tichet Cântar', key: 'ticket_number' },
        { label: 'Data', key: 'ticket_date', format: 'date' },
        { label: 'Ora', key: 'ticket_time' },
        { label: 'Furnizor', key: 'supplier_name' },
        { label: 'Prestator TMB', key: 'operator_name' },
        { label: 'Cod Deșeu', key: 'waste_code' },
        { label: 'Descriere Deșeu', key: 'waste_description' },
        { label: 'Proveniență', key: 'sector_name' },
        { label: 'Generator', key: 'generator_type' },
        { label: 'Nr. Auto', key: 'vehicle_number' },
        { label: 'Tone Net', key: 'net_weight_tons', format: 'number' },
      ],
      recycling: [
        { label: 'Tichet Cântar', key: 'ticket_number' },
        { label: 'Data', key: 'ticket_date', format: 'date' },
        { label: 'Client', key: 'client_name' },
        { label: 'Furnizor', key: 'supplier_name' },
        { label: 'Cod Deșeu', key: 'waste_code' },
        { label: 'Proveniență', key: 'sector_name' },
        { label: 'Nr. Auto', key: 'vehicle_number' },
        { label: 'Cant. Livrată (t)', key: 'delivered_quantity_tons', format: 'number' },
        { label: 'Cant. Acceptată (t)', key: 'accepted_quantity_tons', format: 'number' },
      ],
    };

    const columns = columnsConfig[reportType] || columnsConfig.landfill;

    // Transformă datele
    const csvData = tickets.map(ticket => {
      const row = {};
      columns.forEach(col => {
        const value = ticket[col.key];
        if (col.format === 'number') {
          row[col.label] = formatNumberRO(value);
        } else if (col.format === 'date') {
          row[col.label] = formatDateRO(value);
        } else {
          row[col.label] = value || '';
        }
      });
      return row;
    });

    // Convertește în CSV
    const csv = Papa.unparse(csvData, {
      quotes: true,
      delimiter: ',',
      header: true,
    });

    // Creează Blob și download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Raport_${reportType}_${filters.year}_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV exported successfully:', filename);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================================================
 * EXPORT HANDLER UNIVERSAL
 * ============================================================================
 */
export const handleExport = async (format, tickets, summaryData, filters, reportType, sectors = []) => {
  try {
    console.log(`🚀 Starting export: ${format}`, { tickets: tickets.length, reportType });

    let result;
    switch (format.toLowerCase()) {
      case 'excel':
      case 'xlsx':
        result = exportToExcel(tickets, summaryData, filters, reportType, sectors);
        break;
      case 'pdf':
        result = exportToPDF(tickets, summaryData, filters, reportType, sectors);
        break;
      case 'csv':
        result = exportToCSV(tickets, summaryData, filters, reportType, sectors);
        break;
      default:
        throw new Error(`Format nesuportat: ${format}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Export error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  exportToExcel,
  exportToPDF,
  exportToCSV,
  handleExport,
};