// src/utils/exportTmbPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DejaVuSans from '../assets/fonts/DejaVuSans';
import adigidmbLogo from '../assets/branding/adigidmbLogo';

const PRIMARY       = [30, 64, 175];
const PRIMARY_LIGHT = [219, 234, 254];
const PRIMARY_TEXT  = [30, 58, 138];
const ACCENT        = [20, 184, 166];
const GRAY          = [120, 120, 120];
const CYAN          = [6, 182, 212];
const RED           = [239, 68, 68];

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

  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...PRIMARY_TEXT);
  doc.text('RAPORT TMB', 14, 16);
  doc.setTextColor(...ACCENT);
  doc.text('DE\u0218EURI', 14, 24);

  const logoH = 16;
  const logoW = logoH * (300 / 126);
  doc.addImage('data:image/jpeg;base64,' + adigidmbLogo, 'JPEG', pageW - 14 - logoW, 9, logoW, logoH);

  const subY = 30;
  const sectorName = filters.sector_id ? `Sectorul ${filters.sector_id}` : 'Bucure\u0219ti';
  const period = `${fmtDate(filters.from || filters.start_date)} \u2013 ${fmtDate(filters.to || filters.end_date)}`;

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

  const lineY = subY + 3.5;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(14, lineY, pageW - 14, lineY);
  doc.setTextColor(0, 0, 0);
  return lineY + 5;
};

// ---- 3 CARDURI SUMMARY ----
const drawSummaryCards = (doc, summary, yStart) => {
  const pageW = doc.internal.pageSize.width;
  const cardW = (pageW - 28 - 8) / 3;
  const cardH = 20;
  const cards = [
    {
      label: 'TOTAL DE\u0218EURI COLECTATE',
      value: fmtRO(summary?.total_collected),
      sub: 'tone \u2022 Cod de\u0219eu: 20 03 01',
      pct: null,
      color: [20, 184, 166],
    },
    {
      label: 'DE\u0218EURI TRIMISE LA TMB',
      value: fmtRO(summary?.total_tmb_input),
      sub: 'tone',
      pct: summary?.tmb_percent,
      color: CYAN,
    },
    {
      label: 'DE\u0218EURI DEPOZITATE DIRECT',
      value: fmtRO(summary?.total_landfill_direct),
      sub: 'tone',
      pct: summary?.landfill_percent,
      color: RED,
    },
  ];
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    const [r, g, b] = card.color;
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
    doc.setFontSize(13);
    doc.setTextColor(r, g, b);
    doc.text(card.value, x + 3, yStart + 14.5);
    if (card.pct !== null && card.pct !== undefined) {
      doc.setFontSize(7.5);
      doc.text(`${parseFloat(card.pct).toFixed(2)}%`, x + cardW - 3, yStart + 14.5, { align: 'right' });
    }
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(110, 110, 110);
    doc.text(card.sub, x + 3, yStart + 19);
  });
  doc.setTextColor(0, 0, 0);
  return yStart + cardH + 4;
};

// ---- TITLU SECTIUNE ----
const drawSectionTitle = (doc, title, subtitle, yStart) => {
  const pageW = doc.internal.pageSize.width;
  doc.setFillColor(...PRIMARY_LIGHT);
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.3);
  const h = subtitle ? 11 : 8;
  doc.rect(14, yStart, pageW - 28, h, 'FD');
  doc.setFillColor(...PRIMARY);
  doc.rect(14, yStart, 3, h, 'F');
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_TEXT);
  doc.text(title, 20, yStart + (subtitle ? 5 : 5.5));
  if (subtitle) {
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text(subtitle, 20, yStart + 9.5);
  }
  doc.setTextColor(0, 0, 0);
  return yStart + h + 2;
};

// ---- GRAFIC LINIAR (2 serii: tmb + depozitat) ----
const drawLineChart = (doc, monthlyData, yStart, boxH) => {
  const pageW = doc.internal.pageSize.width;
  const boxX = 14;
  const boxW = pageW - 28;

  doc.setFillColor(252, 253, 253);
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.25);
  doc.rect(boxX, yStart, boxW, boxH, 'FD');

  if (!monthlyData || monthlyData.length === 0) {
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8); doc.setTextColor(150,150,150);
    doc.text('Nu exist\u0103 date', boxX + boxW/2, yStart + boxH/2, { align: 'center' });
    doc.setTextColor(0,0,0);
    return yStart + boxH + 4;
  }

  const legH = 9;
  const plotX = boxX + 13;
  const plotW = boxW - 17;
  const plotH = boxH - legH - 10;
  const plotY = yStart + 5;

  const series = [
    { key: 'tmb_total',      label: 'De\u0219euri tratate',    color: '#06B6D4' },
    { key: 'landfill_total', label: 'De\u0219euri depozitate', color: '#EF4444' },
  ];

  let maxVal = 0;
  monthlyData.forEach(d => series.forEach(s => {
    const v = parseFloat(d[s.key]) || 0; if (v > maxVal) maxVal = v;
  }));
  if (maxVal === 0) maxVal = 1;
  const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
  maxVal = Math.ceil(maxVal / mag) * mag;

  const stepX = plotW / Math.max(monthlyData.length - 1, 1);

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

  monthlyData.forEach((d, i) => {
    const px = plotX + i * stepX;
    const shortM = (d.month || '').split(' ')[0] || (d.month || '').substring(0, 3);
    doc.setFontSize(4.5); doc.setTextColor(150,150,150);
    doc.text(shortM, px, plotY + plotH + 4.5, { align: 'center' });
  });

  series.forEach(s => {
    const [r,g,b] = hexToRgb(s.color);
    const pts = monthlyData.map((d, i) => ({
      x: plotX + i * stepX,
      y: plotY + plotH - ((parseFloat(d[s.key]) || 0) / maxVal) * plotH,
    }));
    if (pts.length < 2) return;
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.8);
    for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y);
    doc.setFillColor(r, g, b);
    pts.forEach(p => doc.circle(p.x, p.y, 0.6, 'F'));
  });

  // Legenda centrata
  doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5);
  const legY = plotY + plotH + 9;
  const dotGap = 2.5; const itemGap = 8;
  let totalW = series.reduce((acc, s) => acc + 3 + dotGap + doc.getTextWidth(s.label) + itemGap, 0) - itemGap;
  let lx = boxX + boxW/2 - totalW/2;
  series.forEach(s => {
    const [r,g,b] = hexToRgb(s.color);
    doc.setFillColor(r, g, b);
    doc.circle(lx + 1.5, legY + 1.2, 1.5, 'F');
    doc.setTextColor(50, 50, 50);
    doc.text(s.label, lx + 1.5 + dotGap, legY + 2);
    lx += 3 + dotGap + doc.getTextWidth(s.label) + itemGap;
  });

  doc.setTextColor(0, 0, 0);
  return yStart + boxH + 4;
};

// ---- 4 CARDURI OUTPUT (Reciclabile, Valorificare, Depozitat, Stoc) ----
const drawOutputCards = (doc, outputs, summary, yStart, compact) => {
  const pageW = doc.internal.pageSize.width;
  const cardW = (pageW - 28 - 12) / 4;
  const cardH = compact ? 34 : 40;

  const pct = outputs?.percentages || {};
  const cards = [
    {
      label: 'RECICLABILE',
      value: fmtRO(outputs?.recycling?.sent),
      pct: pct.recycling,
      trimisa: fmtRO(outputs?.recycling?.sent),
      acceptata: fmtRO(outputs?.recycling?.accepted),
      rata: outputs?.recycling?.acceptance_rate,
      color: [16, 185, 129],
    },
    {
      label: 'VALORIFICARE ENERGETIC\u0102',
      value: fmtRO(outputs?.recovery?.sent),
      pct: pct.recovery,
      trimisa: fmtRO(outputs?.recovery?.sent),
      acceptata: fmtRO(outputs?.recovery?.accepted),
      rata: outputs?.recovery?.acceptance_rate,
      color: [239, 68, 68],
    },
    {
      label: 'DEPOZITAT',
      value: fmtRO(outputs?.disposal?.sent),
      pct: pct.disposal,
      trimisa: fmtRO(outputs?.disposal?.sent),
      acceptata: fmtRO(outputs?.disposal?.accepted),
      rata: outputs?.disposal?.acceptance_rate,
      color: [124, 58, 237],
    },
    {
      label: 'STOC/DIFEREN\u0162\u0102',
      value: fmtRO(summary?.stock_difference),
      pct: summary?.total_tmb_input
        ? ((parseFloat(summary.stock_difference) / parseFloat(summary.total_tmb_input)) * 100).toFixed(2)
        : null,
      trimisa: null,
      acceptata: null,
      rata: null,
      color: [245, 158, 11],
    },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    const [r,g,b] = card.color;
    doc.setFillColor(Math.min(r+210,255), Math.min(g+210,255), Math.min(b+210,255));
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.35);
    doc.rect(x, yStart, cardW, cardH, 'FD');
    // accent top
    doc.setFillColor(r, g, b);
    doc.rect(x, yStart, cardW, 1.8, 'F');

    // Label
    doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(5); doc.setTextColor(80,80,80);
    doc.text(card.label, x + 3, yStart + 6.5);

    // Value
    doc.setFont('DejaVuSans', 'bold'); doc.setFontSize(compact ? 9.5 : 10.5); doc.setTextColor(r,g,b);
    doc.text(`${card.value} t`, x + 3, yStart + (compact ? 13 : 14));

    // Pct
    if (card.pct !== null && card.pct !== undefined) {
      doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5); doc.setTextColor(130,130,130);
      doc.text(`${parseFloat(card.pct).toFixed(2)}% din total TMB`, x + 3, yStart + (compact ? 17 : 18.5));
    }

    if (!compact && card.trimisa !== null) {
      // Trimisa / Acceptata
      const rowY1 = yStart + 22;
      const rowY2 = yStart + 26.5;
      doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5); doc.setTextColor(100,100,100);
      doc.text('Trimis\u0103:', x + 3, rowY1);
      doc.setFont('DejaVuSans', 'bold'); doc.setTextColor(40,40,40);
      doc.text(`${card.trimisa} t`, x + cardW - 3, rowY1, { align: 'right' });
      doc.setFont('DejaVuSans', 'normal'); doc.setTextColor(100,100,100);
      doc.text('Acceptat\u0103:', x + 3, rowY2);
      doc.setFont('DejaVuSans', 'bold'); doc.setTextColor(40,40,40);
      doc.text(`${card.acceptata} t`, x + cardW - 3, rowY2, { align: 'right' });

      // Progress bar
      const barY = yStart + 30;
      const barW = cardW - 6;
      const barH2 = 1.5;
      doc.setFillColor(220,220,220);
      doc.rect(x + 3, barY, barW, barH2, 'F');
      const pctVal = Math.min(parseFloat(card.pct) || 0, 100);
      doc.setFillColor(r, g, b);
      doc.rect(x + 3, barY, barW * pctVal / 100, barH2, 'F');

      // Rata acceptare
      if (card.rata !== null) {
        doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5); doc.setTextColor(130,130,130);
        doc.text(`Rata acceptare: ${card.rata}%`, x + 3, yStart + 35.5);
      }
    } else if (compact && card.trimisa !== null) {
      const rowY1 = yStart + 21;
      const rowY2 = yStart + 25.5;
      doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5); doc.setTextColor(100,100,100);
      doc.text('Trimis\u0103:', x + 3, rowY1);
      doc.setFont('DejaVuSans', 'bold'); doc.setTextColor(40,40,40);
      doc.text(`${card.trimisa} t`, x + cardW - 3, rowY1, { align: 'right' });
      doc.setFont('DejaVuSans', 'normal'); doc.setTextColor(100,100,100);
      doc.text('Acceptat\u0103:', x + 3, rowY2);
      doc.setFont('DejaVuSans', 'bold'); doc.setTextColor(40,40,40);
      doc.text(`${card.acceptata} t`, x + cardW - 3, rowY2, { align: 'right' });
      if (card.rata !== null) {
        doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5); doc.setTextColor(130,130,130);
        doc.text(`Rata: ${card.rata}%`, x + 3, yStart + 30.5);
      }
    }
  });

  doc.setTextColor(0,0,0);
  return yStart + cardH + 4;
};

// ---- GRAFIC BARE PE SECTOARE ----
const drawBarChartSectors = (doc, sectorData, yStart, boxH) => {
  const pageW = doc.internal.pageSize.width;
  const boxX = 14;
  const boxW = pageW - 28;

  doc.setFillColor(252, 253, 253);
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.25);
  doc.rect(boxX, yStart, boxW, boxH, 'FD');

  if (!sectorData || sectorData.length === 0) {
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(8); doc.setTextColor(150,150,150);
    doc.text('Nu exist\u0103 date', boxX + boxW/2, yStart + boxH/2, { align: 'center' });
    doc.setTextColor(0,0,0);
    return yStart + boxH + 4;
  }

  const legH = 9;
  const plotX = boxX + 14;
  const plotW = boxW - 18;
  const plotH = boxH - legH - 12;
  const plotY = yStart + 5;

  let maxVal = 0;
  sectorData.forEach(d => {
    const t = parseFloat(d.tmb_tons) || 0;
    const l = parseFloat(d.landfill_tons) || 0;
    if (t > maxVal) maxVal = t;
    if (l > maxVal) maxVal = l;
  });
  if (maxVal === 0) maxVal = 1;
  const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
  maxVal = Math.ceil(maxVal / mag) * mag;

  // Grid
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

  const n = sectorData.length;
  const groupW = plotW / n;
  const barW = groupW * 0.32;
  const gap = groupW * 0.04;

  sectorData.forEach((d, i) => {
    const gx = plotX + i * groupW + groupW / 2;

    // Bar TMB (cyan)
    const hTmb = ((parseFloat(d.tmb_tons) || 0) / maxVal) * plotH;
    doc.setFillColor(...CYAN);
    doc.rect(gx - barW - gap/2, plotY + plotH - hTmb, barW, hTmb, 'F');

    // Bar Depozitat (red)
    const hLand = ((parseFloat(d.landfill_tons) || 0) / maxVal) * plotH;
    doc.setFillColor(...RED);
    doc.rect(gx + gap/2, plotY + plotH - hLand, barW, hLand, 'F');

    // Label sector
    const lbl = (d.sector_name || d.name || '').replace('Sectorul ', 'S').replace('Sector ', 'S');
    doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(4.5); doc.setTextColor(120,120,120);
    doc.text(lbl, gx, plotY + plotH + 5, { align: 'center' });
  });

  // Legenda
  const legY = plotY + plotH + 9;
  doc.setFont('DejaVuSans', 'normal'); doc.setFontSize(5.5);
  const series = [
    { label: 'Tratate (TMB)', color: CYAN },
    { label: 'Depozitate', color: RED },
  ];
  let totalW = series.reduce((a, s) => a + 3 + 2.5 + doc.getTextWidth(s.label) + 8, 0) - 8;
  let lx = boxX + boxW/2 - totalW/2;
  series.forEach(s => {
    doc.setFillColor(...s.color);
    doc.rect(lx, legY - 1, 3, 3, 'F');
    doc.setTextColor(50,50,50);
    doc.text(s.label, lx + 4.5, legY + 1.5);
    lx += 3 + 2.5 + doc.getTextWidth(s.label) + 8;
  });

  doc.setTextColor(0,0,0);
  return yStart + boxH + 4;
};

// ---- TABEL OPERATORI ----
const drawOperatorsTable = (doc, operators, yStart) => {
  if (!operators || operators.length === 0) return yStart;

  const rows = operators.map(op => {
    const sectorNum = Array.isArray(op.sector_numbers) && op.sector_numbers.length
      ? op.sector_numbers[0] : '-';
    return [
      `S${sectorNum}`,
      op.name || '-',
      `${fmtRO(op.tmb_total_tons)} t\n${op.tmb_percent}%`,
      `${fmtRO(op.landfill_total_tons)} t\n${op.landfill_percent}%`,
    ];
  });

  // Totals row
  const totalTmb = operators.reduce((s, op) => s + (parseFloat(op.tmb_total_tons) || 0), 0);
  const totalLand = operators.reduce((s, op) => s + (parseFloat(op.landfill_total_tons) || 0), 0);
  rows.push(['TOTAL', '', `${fmtRO(totalTmb)} t\n100%`, `${fmtRO(totalLand)} t\n100%`]);

  autoTable(doc, {
    startY: yStart,
    head: [['Sector', 'Operator', 'TMB', 'Depozitat']],
    body: rows,
    styles: { font: 'DejaVuSans', fontSize: 7.5, cellPadding: 2.5, halign: 'center', valign: 'middle' },
    headStyles: { font: 'DejaVuSans', fillColor: PRIMARY_LIGHT, textColor: PRIMARY_TEXT, fontStyle: 'bold', halign: 'center', lineWidth: 0 },
    alternateRowStyles: { fillColor: [248,250,255] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 16 },
      1: { halign: 'left', cellWidth: 88 },
      2: { halign: 'center', cellWidth: 38, textColor: [...CYAN] },
      3: { halign: 'center', cellWidth: 38, textColor: [...RED] },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [180, 205, 245],
    tableLineWidth: 0.2,
    didParseCell: (h) => {
      // Total row - bold
      if (h.row.index === rows.length - 1) {
        h.cell.styles.fontStyle = 'bold';
        h.cell.styles.fillColor = [219, 234, 254];
      }
    },
  });

  return doc.lastAutoTable?.finalY || yStart;
};

// ---- FOOTER ----
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
export const exportTmbPDF = (data, filters) => {
  if (!data) return;
  const isSector = !!filters?.sector_id;
  const doc = initDoc();

  const monthlyData = data.monthly_evolution || [];
  const sectorData  = data.sector_distribution || [];
  const operators   = data.operators || [];

  // =====================
  // PAGINA 1
  // =====================
  let y = drawPageHeader(doc, filters);

  // 3 carduri summary
  y = drawSummaryCards(doc, data.summary, y);

  // Titlu + grafic evolutie lunara
  y = drawSectionTitle(doc,
    'Evolu\u021bie lunar\u0103 a cantit\u0103\u021bilor de de\u0219euri municipale amestecate',
    'Cantit\u0103\u021bi nete (tone) pe luni', y
  );
  const chartH = isSector ? 58 : 60;
  y = drawLineChart(doc, monthlyData, y, chartH);

  // 4 carduri output - compact pt sector, normal pt bucuresti
  y = drawSectionTitle(doc, 'Rezultatul trat\u0103rii mecano-biologice', null, y);
  y = drawOutputCards(doc, data.outputs, data.summary, y, isSector);

  if (isSector) {
    // ---- SECTOR: tabel operatori pe aceeasi pagina (daca incape) ----
    y = drawSectionTitle(doc,
      'Cantit\u0103\u021bile de de\u0219euri gestionate de operatorii de salubrizare',
      'Cod de\u0219eu: 20 03 01', y
    );
    drawOperatorsTable(doc, operators, y);

  } else {
    // =====================
    // PAGINA 2 - BUCURESTI
    // =====================
    doc.addPage();
    y = drawPageHeader(doc, filters);

    // Grafic bare sectoare
    y = drawSectionTitle(doc,
      'Distribu\u021bia pe sectoare a de\u0219eurilor municipale amestecate',
      'Cod de\u0219eu: 20 03 01', y
    );
    y = drawBarChartSectors(doc, sectorData, y, 72);

    // Tabel operatori
    y = drawSectionTitle(doc,
      'Cantit\u0103\u021bile de de\u0219euri gestionate de operatorii de salubrizare',
      'Cod de\u0219eu: 20 03 01', y
    );
    drawOperatorsTable(doc, operators, y);
  }

  drawFooter(doc);
  const loc = filters?.sector_id ? `sector-${filters.sector_id}` : 'bucuresti';
  const yr = filters?.year || new Date().getFullYear();
  doc.save(`raport-tmb-${loc}-${yr}.pdf`);
};

export default exportTmbPDF;