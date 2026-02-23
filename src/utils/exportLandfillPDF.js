// src/utils/exportLandfillPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DejaVuSans from '../assets/fonts/DejaVuSans';
import adigidmbLogo from '../assets/branding/adigidmbLogo';

const SECTOR_COLORS = {
  1: '#7C3AED', 2: '#9CA3AF', 3: '#10B981',
  4: '#F59E0B', 5: '#EC4899', 6: '#06B6D4',
};
const CODE_COLORS = ['#7C3AED','#10B981','#F59E0B','#EC4899','#06B6D4','#0EA5E9','#64748B','#F97316','#8B5CF6','#EF4444','#14B8A6'];

// Culori principale - albastru inchis profesional
const PRIMARY      = [30, 64, 175];   // albastru inchis
const PRIMARY_LIGHT= [219, 234, 254]; // albastru foarte pal (fundal titluri)
const PRIMARY_TEXT = [30, 58, 138];   // albastru text titluri
const ACCENT       = [20, 184, 166];  // teal doar pentru linia separator header
const GRAY         = [120, 120, 120];

const fmtRO = (v, dec = 2) => {
  if (v === null || v === undefined || v === '' || isNaN(parseFloat(v))) return '-';
  return parseFloat(v).toLocaleString('ro-RO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const fmtDate = (iso) => {
  if (!iso) return '';
  const p = iso.split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
};
const hexToRgb = (hex) => {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
};

const initDoc = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.addFileToVFS('DejaVuSans.ttf', DejaVuSans);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'bold');
  doc.setFont('DejaVuSans', 'normal');
  return doc;
};

// ---- HEADER ----
const drawPageHeader = (doc, filters) => {
  const pageW = doc.internal.pageSize.width;

  // Titlu mare stanga
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(30, 58, 138);
  doc.text('RAPORT DEPOZITARE', 14, 16);
  doc.setTextColor(...ACCENT);
  doc.text('DE\u0218EURI', 14, 24);

  // Logo ADIGIDMB dreapta
  const logoH = 16;
  const logoW = logoH * (300 / 126);
  doc.addImage('data:image/jpeg;base64,' + adigidmbLogo, 'JPEG', pageW - 14 - logoW, 9, logoW, logoH);

  // Loca\u021bie + Perioad\u0103 DEASUPRA liniei
  const subY = 30;
  const sectorName = filters.sector_id ? `Sectorul ${filters.sector_id}` : 'Bucure\u0219ti';
  const period = `${fmtDate(filters.from)} \u2013 ${fmtDate(filters.to)}`;

  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  let cx = 14;
  doc.text('Loca\u021bie: ', cx, subY);
  cx += doc.getTextWidth('Loca\u021bie: ');
  doc.setFont('DejaVuSans', 'normal');
  doc.text(sectorName, cx, subY);
  cx += doc.getTextWidth(sectorName);
  doc.setFont('DejaVuSans', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text('  \u2022  ', cx, subY);
  cx += doc.getTextWidth('  \u2022  ');
  doc.setTextColor(40, 40, 40);
  doc.text('Perioada: ', cx, subY);
  cx += doc.getTextWidth('Perioada: ');
  doc.setFont('DejaVuSans', 'normal');
  doc.text(period, cx, subY);

  // Linie separator
  const lineY = subY + 3.5;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(14, lineY, pageW - 14, lineY);

  doc.setTextColor(0, 0, 0);
  return lineY + 5;
};

// ---- KPI Cards - +15% inaltime (20.7mm) ----
const drawKPIs = (doc, summary, yStart) => {
  const pageW = doc.internal.pageSize.width;
  const cardW = (pageW - 28 - 8) / 3;
  const cardH = 20.7; // 18 * 1.15
  const cards = [
    { label: 'TOTAL DE\u0218EURI', value: summary?.total_tons_formatted || fmtRO(summary?.total_tons), sub: 'tone depozitate', color: [20,184,166] },
    { label: 'DE\u0218EURI TRATATE DEPOZITATE', value: summary?.treated_waste_formatted || fmtRO(summary?.treated_waste), sub: 'tone din instala\u021bii de tratare', pct: summary?.treated_waste_percentage, color: [99,102,241] },
    { label: 'DE\u0218EURI DEPOZITATE DIRECT', value: summary?.direct_waste_formatted || fmtRO(summary?.direct_waste), sub: 'tone f\u0103r\u0103 prelucrare', pct: summary?.direct_waste_percentage, color: [249,115,22] },
  ];
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    const [r,g,b] = card.color;
    doc.setFillColor(Math.min(r+205,255), Math.min(g+205,255), Math.min(b+205,255));
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.rect(x, yStart, cardW, cardH, 'FD');
    doc.setFillColor(r, g, b);
    doc.rect(x, yStart, cardW, 2, 'F');
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(80, 80, 80);
    doc.text(card.label, x + 3, yStart + 7);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(r, g, b);
    doc.text(card.value, x + 3, yStart + 15);
    if (card.pct !== undefined) {
      doc.setFontSize(7.5);
      doc.text(`${parseFloat(card.pct).toFixed(1)}%`, x + cardW - 3, yStart + 15, { align: 'right' });
    }
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(110, 110, 110);
    doc.text(card.sub, x + 3, yStart + 19.5);
  });
  doc.setTextColor(0, 0, 0);
  return yStart + cardH + 5;
};

// ---- Titlu sectiune SEPARAT (deasupra graficului/tabelului) ----
const drawSectionTitle = (doc, title, yStart) => {
  const pageW = doc.internal.pageSize.width;
  const boxW = pageW - 28;
  // Fundal albastru pal
  doc.setFillColor(...PRIMARY_LIGHT);
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.3);
  doc.rect(14, yStart, boxW, 8, 'FD');
  // Accent line stanga
  doc.setFillColor(...PRIMARY);
  doc.rect(14, yStart, 3, 8, 'F');
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_TEXT);
  doc.text(title, 20, yStart + 5.5);
  doc.setTextColor(0, 0, 0);
  return yStart + 8 + 2; // 2mm spatiu intre titlu si continut
};

// ---- Chenar simplu pentru grafic (fara titlu in el) ----
const drawChartBox = (doc, yStart, boxH) => {
  const pageW = doc.internal.pageSize.width;
  doc.setFillColor(252, 253, 253);
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.25);
  doc.rect(14, yStart, pageW - 28, boxH, 'FD');
};

// ---- Line Chart ----
const drawLineChart = (doc, monthlyData, seriesKeys, seriesColors, seriesLabels, yStart, boxH) => {
  const pageW = doc.internal.pageSize.width;
  const boxX = 14;
  const boxW = pageW - 28;
  // chenar
  drawChartBox(doc, yStart, boxH);

  const legendH = Math.ceil(seriesKeys.length / 6) * 7 + 3;
  const plotX = boxX + 12;
  const plotW = boxW - 16;
  const plotH = boxH - legendH - 10;
  const plotY = yStart + 5;

  if (!monthlyData || monthlyData.length === 0) {
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8); doc.setTextColor(150,150,150);
    doc.text('Nu exist\u0103 date disponibile', plotX + plotW/2, plotY + plotH/2, { align: 'center' });
    doc.setTextColor(0,0,0); return yStart + boxH + 4;
  }

  let maxVal = 0;
  monthlyData.forEach(d => seriesKeys.forEach(k => {
    const v = parseFloat(d[k]) || 0; if (v > maxVal) maxVal = v;
  }));
  if (maxVal === 0) maxVal = 1;
  const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
  maxVal = Math.ceil(maxVal / mag) * mag;

  const nMonths = monthlyData.length;
  const stepX = plotW / Math.max(nMonths - 1, 1);

  // Grid + Y labels
  for (let g = 0; g <= 4; g++) {
    const frac = g / 4;
    const gy = plotY + plotH - frac * plotH;
    doc.setDrawColor(220, 230, 238); doc.setLineWidth(0.15);
    doc.line(plotX, gy, plotX + plotW, gy);
    const val = maxVal * frac;
    const lbl = frac === 0 ? '0' : (val >= 1000 ? `${Math.round(val/1000)}k` : fmtRO(val, 0));
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(4.5); doc.setTextColor(150,150,150);
    doc.text(lbl, plotX - 1, gy + 1.3, { align: 'right' });
  }

  // X labels - luna scurta
  monthlyData.forEach((d, i) => {
    const px = plotX + i * stepX;
    const shortM = (d.month_label || '').split(' ')[0] || '';
    doc.setFontSize(4.5); doc.setTextColor(150,150,150);
    doc.text(shortM, px, plotY + plotH + 4.5, { align: 'center' });
  });

  // Lines
  seriesKeys.forEach((key, idx) => {
    const [r,g,b] = hexToRgb(seriesColors[idx] || '#6B7280');
    const pts = monthlyData.map((d, i) => ({
      x: plotX + i * stepX,
      y: plotY + plotH - ((parseFloat(d[key]) || 0) / maxVal) * plotH,
    }));
    if (pts.length < 2) return;
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.7);
    for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y);
    doc.setFillColor(r, g, b);
    pts.forEach(p => doc.circle(p.x, p.y, 0.55, 'F'));
  });

  // Legend - un singur rand, centrat, dots
  doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5);
  const legY = plotY + plotH + 9;
  const dotGap = 2.5; const itemGap = 5;
  let totalW = 0;
  seriesKeys.forEach((key, i) => { totalW += 3 + dotGap + doc.getTextWidth(seriesLabels[i] || key) + itemGap; });
  totalW -= itemGap;
  let lx = boxX + boxW/2 - totalW/2;
  seriesKeys.forEach((key, i) => {
    const [r,g,b] = hexToRgb(seriesColors[i] || '#6B7280');
    const lbl = seriesLabels[i] || key;
    doc.setFillColor(r, g, b);
    doc.circle(lx + 1.5, legY + 1.2, 1.5, 'F');
    doc.setTextColor(50, 50, 50);
    doc.text(lbl, lx + 1.5 + dotGap, legY + 2);
    lx += 3 + dotGap + doc.getTextWidth(lbl) + itemGap;
  });

  doc.setTextColor(0, 0, 0);
  return yStart + boxH + 4;
};

// ---- Stats Bar ----
const drawStatsBar = (doc, stats, yStart) => {
  const pageW = doc.internal.pageSize.width;
  const barW = pageW - 28;
  const barH = 17;
  doc.setFillColor(250, 250, 255);
  doc.setDrawColor(200, 210, 240);
  doc.setLineWidth(0.3);
  doc.rect(14, yStart, barW, barH, 'FD');
  const avg = stats?.monthly_average || stats?.avg_monthly || stats?.average_monthly || 0;
  const items = [
    { label: 'MAXIMUM', value: fmtRO(stats?.maximum?.value, 2), sub: stats?.maximum?.month || '', color:[16,185,129] },
    { label: 'MINIMUM', value: fmtRO(stats?.minimum?.value, 2), sub: stats?.minimum?.month || '', color:[239,68,68] },
    { label: 'MEDIE LUNAR\u0102', value: fmtRO(avg, 2), sub: 'tone / lun\u0103', color:[99,102,241] },
    { label: 'TRENDING', value: stats?.trending?.value ? `${parseFloat(stats.trending.value).toFixed(1)}%` : '0%', sub: `vs ${stats?.trending?.vs_period || '2024'}`, color: stats?.trending?.direction === 'up' ? [16,185,129] : [239,68,68] },
  ];
  const colW = barW / 4;
  items.forEach((item, i) => {
    const x = 14 + i * colW; const [r,g,b] = item.color;
    if (i > 0) { doc.setDrawColor(200,210,235); doc.setLineWidth(0.2); doc.line(x, yStart+2, x, yStart+barH-2); }
    doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(5.5); doc.setTextColor(130,130,130);
    doc.text(item.label, x+colW/2, yStart+4.5, { align:'center' });
    doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(11); doc.setTextColor(r,g,b);
    doc.text(item.value, x+colW/2, yStart+11.5, { align:'center' });
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5); doc.setTextColor(150,150,150);
    doc.text(item.sub, x+colW/2, yStart+15.5, { align:'center' });
  });
  doc.setTextColor(0,0,0);
  return yStart + barH + 4;
};

// ---- Footer ----
const drawFooter = (doc) => {
  const n = doc.internal.getNumberOfPages();
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('DejaVuSans','normal'); doc.setFontSize(6.5); doc.setTextColor(160,160,160);
    doc.setDrawColor(210,210,210); doc.setLineWidth(0.3);
    doc.line(14, pageH-12, pageW-14, pageH-12);
    doc.text('Raport generat automat din SAMD \u2022 Reflect\u0103 filtrele aplicate la momentul exportului.', 14, pageH-8);
    doc.text(`Generat la data: ${new Date().toLocaleString('ro-RO')}`, 14, pageH-4.5);
    doc.text(`Pagina ${i} din ${n}`, pageW-14, pageH-6.5, { align:'right' });
  }
};

// ==========================================
// MAIN EXPORT
// ==========================================
export const exportLandfillPDF = (data, filters) => {
  if (!data) return;
  const isSector = !!filters?.sector_id;
  const doc = initDoc();

  // ---- PAGE 1 ----
  let y = drawPageHeader(doc, filters);
  y = drawKPIs(doc, data.summary, y);

  // Sector/Total chart
  const sectorKeys = data.monthly_sector_keys || [];
  const chartData = isSector ? (data.monthly_evolution || []) : (data.monthly_evolution_sectors || data.monthly_evolution || []);
  const chartKeys = isSector ? ['total_tons'] : (sectorKeys.length ? sectorKeys : ['total_tons']);
  const chartColors = isSector ? ['#10B981'] : sectorKeys.map(k => SECTOR_COLORS[Number(String(k).replace('sector_',''))] || '#6B7280');
  const chartLabels = isSector ? [`Sectorul ${filters.sector_id}`] : sectorKeys.map(k => `Sector ${Number(String(k).replace('sector_',''))}`);

  // Titlu SEPARAT, deasupra graficului
  y = drawSectionTitle(doc, 'Evolu\u021bie lunar\u0103 a cantit\u0103\u021bilor depozitate \u2014 Cantit\u0103\u021bi nete (tone) pe luni', y);
  // Grafic mai inalt (72mm) si mai lat (foloseste tot pageW-28)
  y = drawLineChart(doc, chartData, chartKeys, chartColors, chartLabels, y, 72);

  y = drawStatsBar(doc, data.monthly_stats, y);

  // Titlu SEPARAT pentru tabelul sectoare
  y = drawSectionTitle(doc, 'Distribu\u021bia pe Sectoare ale Municipiului Bucure\u0219ti', y);

  // Sector table rows
  let sectorRows;
  if (isSector) {
    const s = (data.per_sector || []).find(s => String(s.sector_number) === String(filters.sector_id));
    sectorRows = s ? [[
      `Sectorul ${s.sector_number}`,
      (s.ticket_count !== undefined && s.ticket_count !== null ? Number(s.ticket_count).toLocaleString('ro-RO') : (s.total_tickets !== undefined ? Number(s.total_tickets).toLocaleString('ro-RO') : '-')),
      fmtRO(s.total_tons),
      s.variation_pct !== undefined ? `${s.variation_pct >= 0 ? '+' : ''}${parseFloat(s.variation_pct).toFixed(1)}%` : '-',
    ]] : [];
  } else {
    sectorRows = (data.per_sector || []).map(s => [
      `Sectorul ${s.sector_number}`,
      (s.ticket_count !== undefined && s.ticket_count !== null ? Number(s.ticket_count).toLocaleString('ro-RO') : (s.total_tickets !== undefined ? Number(s.total_tickets).toLocaleString('ro-RO') : '-')),
      fmtRO(s.total_tons),
      s.variation_pct !== undefined ? `${s.variation_pct >= 0 ? '+' : ''}${parseFloat(s.variation_pct).toFixed(1)}%` : '-',
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Sector', 'Tichete', 'Cantitate (t)', 'Trend']],
    body: sectorRows,
    styles: { font: 'DejaVuSans', fontSize: 8, cellPadding: 2.5, halign: 'center' },
    headStyles: { font: 'DejaVuSans', fillColor: [219,234,254], textColor: [30,58,138], fontStyle: 'bold', halign: 'center', lineWidth: 0 },
    alternateRowStyles: { fillColor: [248,250,255] },
    columnStyles: {
      0: { halign: 'left', cellWidth: 55 },
      1: { halign: 'center', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 50 },
      3: { halign: 'center', cellWidth: 37 },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [180, 205, 245],
    tableLineWidth: 0.2,
    didParseCell: (h) => {
      if (h.section === 'body' && h.column.index === 3) {
        const v = String(h.cell.raw || '');
        if (v.startsWith('+')) h.cell.styles.textColor = [16,185,129];
        else if (v.startsWith('-')) h.cell.styles.textColor = [239,68,68];
      }
    },
  });

  // ---- Codes data ----
  const codesData = (data.waste_categories || []).map(c => [
    c.waste_code || '-',
    c.waste_description || '-',
    (c.ticket_count !== undefined && c.ticket_count !== null ? Number(c.ticket_count).toLocaleString('ro-RO') : '-'),
    fmtRO(c.total_tons),
    c.percentage_of_total !== undefined ? `${parseFloat(c.percentage_of_total).toFixed(1)}%` : '-',
  ]);

  if (!isSector) {
    // ---- PAGE 2 ----
    doc.addPage();
    y = drawPageHeader(doc, filters);

    const codeKeys = data.monthly_code_keys || [];
    const codeColors = codeKeys.map((_, i) => CODE_COLORS[i % CODE_COLORS.length]);
    const codeLabels = codeKeys.map(k => String(k));

    // Titlu SEPARAT deasupra graficului coduri
    y = drawSectionTitle(doc, 'Distribu\u021bia pe coduri de de\u0219euri depozitate \u2014 Cantit\u0103\u021bi nete (tone) pe luni', y);
    // Grafic mai inalt (74mm)
    y = drawLineChart(doc, data.monthly_evolution_codes || [], codeKeys, codeColors, codeLabels, y, 74);

    // Titlu SEPARAT deasupra tabelului
    y = drawSectionTitle(doc, 'Distribu\u021bia pe coduri de de\u0219euri depozitate', y);

    autoTable(doc, {
      startY: y,
      head: [['Cod de\u0219eu', 'Descriere', 'Tichete', 'Cantitate (t)', 'Pondere']],
      body: codesData,
      styles: { font: 'DejaVuSans', fontSize: 7.5, cellPadding: 2, halign: 'center' },
      headStyles: { font: 'DejaVuSans', fillColor: [219,234,254], textColor: [30,58,138], fontStyle: 'bold', halign: 'center', lineWidth: 0 },
      alternateRowStyles: { fillColor: [248,250,255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { halign: 'left', cellWidth: 88 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 28 },
        4: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [180,205,245],
      tableLineWidth: 0.2,
    });

  } else {
    // Sector - coduri pe aceeasi pagina
    y = (doc.lastAutoTable?.finalY || y) + 5;
    y = drawSectionTitle(doc, 'Distribu\u021bia pe coduri de de\u0219euri depozitate', y);
    autoTable(doc, {
      startY: y,
      head: [['Cod de\u0219eu', 'Descriere', 'Tichete', 'Cantitate (t)', 'Pondere']],
      body: codesData,
      styles: { font: 'DejaVuSans', fontSize: 7.5, cellPadding: 2, halign: 'center' },
      headStyles: { font: 'DejaVuSans', fillColor: [219,234,254], textColor: [30,58,138], fontStyle: 'bold', halign: 'center', lineWidth: 0 },
      alternateRowStyles: { fillColor: [248,250,255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { halign: 'left', cellWidth: 88 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 28 },
        4: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [180,205,245],
      tableLineWidth: 0.2,
    });
  }

  drawFooter(doc);
  const loc = filters?.sector_id ? `sector-${filters.sector_id}` : 'bucuresti';
  const yr = filters?.year || new Date().getFullYear();
  doc.save(`raport-depozitare-${loc}-${yr}.pdf`);
};

export default exportLandfillPDF;