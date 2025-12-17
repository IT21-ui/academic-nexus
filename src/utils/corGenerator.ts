import jsPDF from 'jspdf';
import type { Class } from '@/types/models';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
}

// Helper functions
const getDayName = (dayNumber: number): string => {
  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", 
    "Friday", "Saturday", "Sunday"
  ];
  return days[dayNumber - 1] || "Unknown";
};

const formatTime = (time: string): string => {
  if (!time || typeof time !== "string") return "";
  
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  if (isNaN(hour) || isNaN(parseInt(minutes))) return "";
  
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatUserId = (id: number, role: string): string => {
  const idStr = id.toString().padStart(3, '0');
  
  switch (role.toLowerCase()) {
    case 'student':
      return `ST${idStr}`;
    case 'instructor':
      return `IN${idStr}`;
    case 'admin':
    case 'administrator':
      return `ADM${idStr}`;
    default:
      return idStr;
  }
};

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

  doc.text(`Student ID : ${formatUserId(user?.id || 0, user?.role || '')}`, 20, 55);
  doc.text('AY : 2025-2026 1st Term', pageWidth - 20, 55, { align: 'right' });

  doc.text(
    `Name       : ${user?.last_name}, ${user?.first_name} ${user?.middle_name ?? ''}`,
    20,
    60
  );
  doc.text('Program : BSIT 2nd', pageWidth - 20, 60, { align: 'right' });

  /* ================= TABLE HEADER ================= */
  let y = 70;
  const roomColumnX = 142;
  const statementBoxX = roomColumnX + 25;

  doc.setFont('helvetica', 'bold');
  doc.text('Subject', 20, y);
  doc.text('Section', 50, y);
  doc.text('Unit', 75, y);
  doc.text('Day', 90, y);
  doc.text('Time', 105, y);
  doc.text('Room', 142, y);

  doc.line(20, y + 2, pageWidth - 20, y + 2);

  /* ================= SUBJECT ROWS ================= */
  doc.setFont('helvetica', 'normal');
  y += 8;

  let totalUnits = 0;

  classes.forEach((c: any) => {
    const subject = c.subject || {};
    const units = subject.units || 0;

    if (units) totalUnits += units;

    // Process each schedule as a separate row in the table
    if (c.schedules && c.schedules.length > 0) {
      c.schedules.forEach((schedule: any) => {
        const dayStr = getDayName(schedule.day_of_week || 1);
        const timeStr = `${formatTime(schedule.start_time || '')}-${formatTime(schedule.end_time || '')}`;
        const roomStr = schedule.room || '';
        
        // Place each column in its proper position
        doc.text(subject.code || '', 20, y);           // Subject
        doc.text(c.section?.name || 'BSIT 2A', 50, y);   // Section  
        doc.text(units ? units.toString() : '', 75, y); // Units
        doc.text(dayStr, 90, y);                        // Day
        doc.text(timeStr, 105, y);                      // Time
        doc.text(roomStr, roomColumnX, y);              // Room
        
        y += 6; // Space between schedule rows
      });
    } else {
      // No schedule case - still put in columns
      doc.text(subject.code || '', 20, y);
      doc.text(c.section?.name || 'BSIT 2A', 50, y);
      doc.text(units ? units.toString() : '', 75, y);
      doc.text('No Schedule', 90, y);
      doc.text('', 105, y);
      doc.text('', roomColumnX, y);
      
      y += 6;
    }
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
  const boxX = statementBoxX;
  const boxY = 70;
  const boxW = 40;
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
