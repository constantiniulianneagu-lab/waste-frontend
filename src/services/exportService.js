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
 * EXPORT TO PDF
 * ============================================================================
 */
export const exportToPDF = (tickets, summaryData, filters, reportType = 'landfill', sectors = []) => {
  try {
    console.log('📄 Exporting to PDF...', { tickets: tickets.length, reportType });

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    // Unicode font (RO diacritics)
    doc.addFileToVFS('DejaVuSans.ttf', DejaVuSans);
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    doc.setFont('DejaVuSans');

    // Header
    doc.setFont('DejaVuSans', 'normal');   // ✅ nu mai folosi undefined
doc.setFontSize(18);
doc.text('RAPORT DEȘEURI', 14, 15);

    // Informații generale
    doc.setFont('DejaVuSans', 'normal');   // ✅ rămâi pe fontul tău
doc.setFontSize(10);
    const yStart = 25;
    doc.text(`Perioada: ${formatDateRO(filters.from)} - ${formatDateRO(filters.to)}`, 14, yStart);
    doc.text(`An: ${filters.year}`, 14, yStart + 5);
    doc.text(`Locație: ${getLocationName(filters, sectors, summaryData)}`, 14, yStart + 10);
    doc.text(`Total cantitate: ${formatNumberRO(summaryData?.total_quantity || 0)} tone`, 14, yStart + 15);
    doc.text(`Total tichete: ${summaryData?.total_tickets || tickets.length}`, 14, yStart + 20);

    // Configurare coloane per tip raport
    const columnsConfig = {
      landfill: [
        'Tichet',
        'Data',
        'Furnizor',
        'Cod',
        'Tip Contract',
        'Generator',
        'Sector',
        'Auto',
        'Tone',
      ],
      tmb: [
        'Tichet',
        'Data',
        'Ora',
        'Furnizor',
        'Prestator',
        'Cod',
        'Proveniență',
        'Generator',
        'Auto',
        'Tone',
      ],
      recycling: [
        'Tichet',
        'Data',
        'Client',
        'Furnizor',
        'Cod',
        'Auto',
        'Livrată',
        'Acceptată',
      ],
    };

    const columns = columnsConfig[reportType] || columnsConfig.landfill;

    // Transformă datele pentru PDF
    const dataConfig = {
      landfill: (t) => [
        t.ticket_number,
        formatDateRO(t.ticket_date),
        t.supplier_name,
        t.waste_code,
        t.contract_type || '-',
        t.generator_type || '-',
        t.sector_name,
        t.vehicle_number,
        formatNumberRO(t.net_weight_tons),
      ],
      tmb: (t) => [
        t.ticket_number,
        formatDateRO(t.ticket_date),
        t.ticket_time || '-',
        t.supplier_name || '-',
        t.operator_name || '-',
        t.waste_code,
        t.sector_name,
        t.generator_type || '-',
        t.vehicle_number,
        formatNumberRO(t.net_weight_tons),
      ],
      recycling: (t) => [
        t.ticket_number,
        formatDateRO(t.ticket_date),
        t.recipient_name || t.client_name, // ✅ FIX: folosim recipient_name
        t.supplier_name,
        t.waste_code,
        t.vehicle_number,
        formatNumberRO(t.delivered_quantity_tons),
        formatNumberRO(t.accepted_quantity_tons),
      ],
    };

    const dataTransform = dataConfig[reportType] || dataConfig.landfill;
    const tableData = tickets.map(dataTransform);

    // Generează tabel
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: yStart + 30,
      theme: 'grid',
      styles: {
        font: 'DejaVuSans',      // ✅ aici
        fontSize: 7,
        cellPadding: 1.5,
      },
      headStyles: {
        font: 'DejaVuSans',      // ✅ și aici
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        font: 'DejaVuSans',      // ✅ opțional, dar îl punem ca să fie clar
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });
    

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Pagina ${i} din ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generează filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Raport_${reportType}_${filters.year}_${timestamp}.pdf`;

    // Download
    doc.save(filename);

    console.log('✅ PDF exported successfully:', filename);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Export PDF error:', error);
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