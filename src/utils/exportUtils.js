/**
 * ============================================================================
 * EXPORT UTILITIES
 * ============================================================================
 * Funcții pentru export rapoarte în Excel, CSV și PDF
 * ============================================================================
 */

/**
 * EXPORT TO EXCEL
 * Folosește biblioteca xlsx (SheetJS)
 * npm install xlsx
 */
export const exportToExcel = (tickets, summaryData, filename = 'raport_depozitare') => {
    // Verifică dacă xlsx este disponibil
    if (typeof window.XLSX === 'undefined') {
      console.error('XLSX library not loaded. Install with: npm install xlsx');
      alert('Pentru export Excel, instalează biblioteca: npm install xlsx');
      return;
    }
  
    const XLSX = window.XLSX;
  
    // Pregătește datele pentru export
    const data = tickets.map(ticket => ({
      'Ticket Cântar': ticket.ticket_number,
      'Data': new Date(ticket.ticket_date).toLocaleDateString('ro-RO'),
      'Ora': ticket.ticket_time,
      'Furnizor': ticket.supplier_name,
      'Tip Produs': ticket.waste_code,
      'Descriere': ticket.waste_description,
      'Provenință': ticket.sector_name,
      'Generator': ticket.generator,
      'Nr. Auto': ticket.vehicle_number,
      'Tone Brut': ticket.gross_weight_tons,
      'Tone Tară': ticket.tare_weight_tons,
      'Tone Net': ticket.net_weight_tons,
      'Contract': ticket.contract,
      'Operație': ticket.operation,
      'Observații': ticket.observations || ''
    }));
  
    // Creează workbook
    const wb = XLSX.utils.book_new();
    
    // Adaugă summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['RAPORT DEPOZITARE DEȘEURI'],
      [''],
      ['Perioada analizată'],
      ['An:', summaryData?.period.year || ''],
      ['Data început:', summaryData?.period.date_from || ''],
      ['Data sfârșit:', summaryData?.period.date_to || ''],
      ['UAT:', summaryData?.period.sector || ''],
      ['Total cantitate:', `${summaryData?.total_quantity || '0.00'} tone`],
      [''],
      ['Generat la:', new Date().toLocaleString('ro-RO')]
    ]);
    
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Sumar');
  
    // Adaugă data sheet
    const dataSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Înregistrări');
  
    // Descarcă fișierul
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
  };
  
  /**
   * EXPORT TO CSV
   * Export simplu în format CSV
   */
  export const exportToCSV = (tickets, summaryData, filename = 'raport_depozitare') => {
    // Header CSV
    const headers = [
      'Ticket Cântar',
      'Data',
      'Ora',
      'Furnizor',
      'Tip Produs',
      'Descriere',
      'Provenință',
      'Generator',
      'Nr. Auto',
      'Tone Brut',
      'Tone Tară',
      'Tone Net',
      'Contract',
      'Operație',
      'Observații'
    ];
  
    // Rows CSV
    const rows = tickets.map(ticket => [
      ticket.ticket_number,
      new Date(ticket.ticket_date).toLocaleDateString('ro-RO'),
      ticket.ticket_time,
      ticket.supplier_name,
      ticket.waste_code,
      ticket.waste_description,
      ticket.sector_name,
      ticket.generator,
      ticket.vehicle_number,
      ticket.gross_weight_tons,
      ticket.tare_weight_tons,
      ticket.net_weight_tons,
      ticket.contract,
      ticket.operation,
      ticket.observations || ''
    ]);
  
    // Construiește CSV
    const csvContent = [
      // Summary header
      ['RAPORT DEPOZITARE DEȘEURI'],
      [''],
      ['Perioada analizată'],
      ['An:', summaryData?.period.year || ''],
      ['Data început:', summaryData?.period.date_from || ''],
      ['Data sfârșit:', summaryData?.period.date_to || ''],
      ['UAT:', summaryData?.period.sector || ''],
      ['Total cantitate:', `${summaryData?.total_quantity || '0.00'} tone`],
      [''],
      ['Generat la:', new Date().toLocaleString('ro-RO')],
      [''],
      [''],
      // Data
      headers,
      ...rows
    ]
      .map(row => row.map(cell => {
        // Escape quotes în CSV
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
      .join('\n');
  
    // Creează blob și descarcă
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * EXPORT TO PDF
   * Folosește jsPDF + autoTable
   * npm install jspdf jspdf-autotable
   */
  export const exportToPDF = (tickets, summaryData, filename = 'raport_depozitare') => {
    // Verifică dacă jsPDF este disponibil
    if (typeof window.jspdf === 'undefined') {
      console.error('jsPDF library not loaded. Install with: npm install jspdf jspdf-autotable');
      alert('Pentru export PDF, instalează bibliotecile: npm install jspdf jspdf-autotable');
      return;
    }
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
  
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPORT DEPOZITARE DEȘEURI', 14, 20);
  
    // Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 30;
    
    doc.text(`Perioada analizată`, 14, yPos);
    yPos += 6;
    doc.text(`An: ${summaryData?.period.year || ''}`, 14, yPos);
    yPos += 5;
    doc.text(`Data început: ${summaryData?.period.date_from || ''}`, 14, yPos);
    yPos += 5;
    doc.text(`Data sfârșit: ${summaryData?.period.date_to || ''}`, 14, yPos);
    yPos += 5;
    doc.text(`UAT: ${summaryData?.period.sector || ''}`, 14, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total cantitate: ${summaryData?.total_quantity || '0.00'} tone`, 14, yPos);
    yPos += 10;
  
    // Table
    doc.autoTable({
      startY: yPos,
      head: [[
        'Ticket',
        'Data',
        'Ora',
        'Furnizor',
        'Cod',
        'Sector',
        'Generator',
        'Nr. Auto',
        'T. Net',
        'Contract'
      ]],
      body: tickets.map(ticket => [
        ticket.ticket_number,
        new Date(ticket.ticket_date).toLocaleDateString('ro-RO'),
        ticket.ticket_time,
        ticket.supplier_name,
        ticket.waste_code,
        ticket.sector_name,
        ticket.generator,
        ticket.vehicle_number,
        `${ticket.net_weight_tons}t`,
        ticket.contract
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [99, 102, 241], // Indigo
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 14, right: 14 }
    });
  
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generat la: ${new Date().toLocaleString('ro-RO')} | Pagina ${i} din ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
  
    // Descarcă PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${filename}_${timestamp}.pdf`);
  };
  
  /**
   * EXPORT DROPDOWN COMPONENT
   * Component React pentru dropdown export
   */
  export const ExportDropdown = ({ tickets, summaryData, className = '' }) => {
    const [isOpen, setIsOpen] = React.useState(false);
  
    const handleExport = (format) => {
      setIsOpen(false);
      
      switch (format) {
        case 'excel':
          exportToExcel(tickets, summaryData);
          break;
        case 'csv':
          exportToCSV(tickets, summaryData);
          break;
        case 'pdf':
          exportToPDF(tickets, summaryData);
          break;
        default:
          console.error('Unknown export format:', format);
      }
    };
  
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg 
                   transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export date
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
  
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242b3d] rounded-lg shadow-lg 
                          border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default {
    exportToExcel,
    exportToCSV,
    exportToPDF,
    ExportDropdown
  };