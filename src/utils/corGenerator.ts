import jsPDF from 'jspdf';
import type { Class } from '@/types/models';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
}

export const generateCorPdf = (user: User | null, classes: Class[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica');

  /* ================= DATE ================= */
  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString(),
    pageWidth - 20,
    15,
    { align: 'right' }
  );

  /* ================= HEADER ================= */
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tagoloan Community College', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Baluarte, Tagoloan, Misamis Oriental', pageWidth / 2, 30, { align: 'center' });
  doc.text('Tel. No. (08822) 740-835', pageWidth / 2, 35, { align: 'center' });

  /* ================= TITLE ================= */
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Registration', pageWidth / 2, 45, { align: 'center' });

  /* ================= STUDENT INFO ================= */
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text(`Student ID : ${user?.id ?? ''}`, 20, 55);
  doc.text('AY : 2025-2026 1st Term', pageWidth - 20, 55, { align: 'right' });

  doc.text(
    `Name       : ${user?.last_name}, ${user?.first_name} ${user?.middle_name ?? ''}`,
    20,
    60
  );
  doc.text('Program : BSIT 2nd', pageWidth - 20, 60, { align: 'right' });

  /* ================= TABLE HEADER ================= */
  let y = 70;

  doc.setFont('helvetica', 'bold');
  doc.text('Subject', 20, y);
  doc.text('Section', 50, y);
  doc.text('Unit', 75, y);
  doc.text('Day', 90, y);
  doc.text('Time', 105, y);
  doc.text('Room', 150, y);

  doc.line(20, y + 2, pageWidth - 20, y + 2);

  /* ================= SUBJECT ROWS ================= */
  doc.setFont('helvetica', 'normal');
  y += 8;

  let totalUnits = 0;

  classes.forEach((c: any) => {
    const subject = c.subject || {};
    const units = subject.units || 0;

    if (units) totalUnits += units;

    doc.text(subject.code || '', 20, y);
    doc.text(c.section?.name || 'BSIT 2A', 50, y);
    doc.text(units ? units.toString() : '', 75, y);
    doc.text(c.day || '', 90, y);
    doc.text(c.time || '', 105, y);
    doc.text(c.room || '', 150, y);

    y += 6;
  });

  /* ================= TOTAL UNITS ================= */
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Units : ${totalUnits}`, 20, y + 5);

  /* ================= REGISTRAR ================= */
  doc.setFontSize(9);
  doc.text('Grace B. Valde', 20, 250);
  doc.setFont('helvetica', 'normal');
  doc.text('College Registrar', 20, 255);

  doc.text('Date Enrolled : 07/21/2025', 20, 265);

  /* ================= QR PLACEHOLDER ================= */
  doc.rect(pageWidth - 50, 245, 30, 30);
  doc.setFontSize(8);
  doc.text('Scan to Verify', pageWidth - 35, 280, { align: 'center' });
  doc.text('Online validation', pageWidth - 35, 285, { align: 'center' });

  /* ================= STATEMENT OF ACCOUNT ================= */
  const boxX = pageWidth - 80;
  const boxY = 195;
  const boxW = 60;
  const boxH = 45;

  doc.rect(boxX, boxY, boxW, boxH);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement of Account', boxX + 5, boxY + 8);

  doc.setFont('helvetica', 'normal');
  doc.text('Tuition Fee', boxX + 5, boxY + 18);
  doc.text('0.00', boxX + boxW - 5, boxY + 18, { align: 'right' });

  doc.text('Mics Fee', boxX + 5, boxY + 25);
  doc.text('0.00', boxX + boxW - 5, boxY + 25, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total', boxX + 5, boxY + 35);
  doc.text('0.00', boxX + boxW - 5, boxY + 35, { align: 'right' });

  /* ================= SAVE ================= */
  doc.save(`COR_${user?.last_name}_${user?.first_name}.pdf`);
};
