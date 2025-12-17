import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Class, RegistrationData } from '@/types/models';

// Function to load image as base64
const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', error);
    throw error;
  }
};

const getDayName = (dayNumber: number): string => {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return days[dayNumber - 1] || "TBD";
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatTimeRange = (start: string, end: string): string => {
  return `${formatTime(start)}${formatTime(end)}`;
};


export const generateCorPdf = async (data: RegistrationData) => {
  const {
    user,
    classes,
    academicYear = '2025-2026 1st Term',
    program = 'BSIT 2nd',
    registrarName = 'Grace B. Valde',
    registrarTitle = 'College Registrar',
    dateEnrolled,
    tuitionFee = 0.00,
    miscFee = 0.00,
  } = data;
  
  // Use provided dateEnrolled or fallback to current date
  const enrollmentDate = dateEnrolled || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const maroonColor: [number, number, number] = [128, 0, 0];
  const blackColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [100, 100, 100];

  // Current date in top right
  doc.setFontSize(9);
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  doc.text(currentDate, pageWidth - margin, 15, { align: 'right' });

  // School Header Section
  let yPos = 25;

  // School Logo
  const logoX = pageWidth / 2;
  const logoSize = 24;
  
  try {
    // Load and add the actual logo image
    const logoDataUrl = await loadImageAsBase64('/system.png');
    doc.addImage(logoDataUrl, 'PNG', logoX - logoSize/2, yPos - logoSize/2, logoSize, logoSize);
  } catch (error) {
    console.error('Failed to load logo, using placeholder:', error);
    // Fallback: draw placeholder circle if logo fails to load
    doc.setDrawColor(...maroonColor);
    doc.setLineWidth(0.5);
    doc.circle(logoX, yPos, 12);
    doc.setFontSize(6);
    doc.setTextColor(...maroonColor);
    doc.text('LOGO', logoX, yPos + 1, { align: 'center' });
  }

  // School Name and Address
  yPos += 18;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...maroonColor);
  doc.text('Tagoloan Community College', pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...blackColor);
  doc.text('Baluarte, Tagoloan, Misamis Oriental', pageWidth / 2, yPos, { align: 'center' });

  yPos += 4;
  doc.text('Tel. No. (08822) 740-835', pageWidth / 2, yPos, { align: 'center' });

  // Certificate of Registration Title
  yPos += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('Certificate of Registration', pageWidth / 2, yPos, { align: 'center' });

  // Student Information Row
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const studentId = `ST${user?.id?.toString().padStart(8, '0') || '00000000'}`;
  const studentName = `${user?.last_name || ''}, ${user?.first_name || ''}`;

  // Left side - Student ID and Name
  doc.text('Student ID', margin, yPos);
  doc.text(`: ${studentId}`, margin + 25, yPos);

  // Right side - AY
  doc.text(`AY : ${academicYear}`, pageWidth - margin - 50, yPos);

  yPos += 6;
  doc.text('Name', margin, yPos);
  doc.text(`: ${studentName}`, margin + 25, yPos);

  // Right side - Program
  doc.text(`Program : ${program}`, pageWidth - margin - 50, yPos);

  // Table Section
  yPos += 10;

  // Table dimensions
  const tableStartX = margin;
  const tableWidth = contentWidth * 0.72;
  const soaStartX = tableStartX + tableWidth + 5;
  const soaWidth = contentWidth * 0.25;

  // Column widths for main table
  const colWidths = {
    subject: 25,
    section: 20,
    unit: 12,
    day: 15,
    time: 35,
    room: 20,
  };

  // Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blackColor);

  let xPos = tableStartX;
  doc.text('Subject', xPos, yPos, { align: 'left' });
  xPos += colWidths.subject;
  doc.text('Section', xPos, yPos, { align: 'left' });
  xPos += colWidths.section;
  doc.text('Unit', xPos + colWidths.unit/2, yPos, { align: 'center' });
  xPos += colWidths.unit;
  doc.text('Day', xPos + colWidths.day/2, yPos, { align: 'center' });
  xPos += colWidths.day;
  doc.text('Time', xPos, yPos, { align: 'left' });
  xPos += colWidths.time;
  doc.text('Room', xPos, yPos, { align: 'left' });

  // Statement of Account Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Statement of Account', soaStartX, yPos);

  // Draw header line
  yPos += 2;
  doc.setDrawColor(...grayColor);
  doc.setLineWidth(0.3);
  doc.line(tableStartX, yPos, tableStartX + tableWidth, yPos);

  // Table Body
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // SOA items
  const soaYStart = yPos;
  doc.text('Tuition Fee', soaStartX, soaYStart);
  doc.text(tuitionFee.toFixed(2), soaStartX + soaWidth - 5, soaYStart, { align: 'right' });

  doc.text('Misc Fee', soaStartX, soaYStart + 6);
  doc.text(miscFee.toFixed(2), soaStartX + soaWidth - 5, soaYStart + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total', soaStartX, soaYStart + 16);
  doc.text((tuitionFee + miscFee).toFixed(2), soaStartX + soaWidth - 5, soaYStart + 16, { align: 'right' });

  // Subject rows
  doc.setFont('helvetica', 'normal');
  if (!classes || !Array.isArray(classes)) {
    doc.text('No classes enrolled', tableStartX, yPos);
  } else {
    classes.forEach((classItem: Class) => {
    const subject = classItem.subject;
    const section = classItem.section;
    const schedules = classItem.schedules || [];
    const hasSchedules = schedules.length > 0;

    if (hasSchedules) {
      schedules.forEach((schedule, index) => {
        xPos = tableStartX;
        
        // Always show subject, section, and units for each schedule row
        doc.setTextColor(...maroonColor);
        doc.text(subject?.code || 'N/A', xPos, yPos, { align: 'left' });
        
        doc.setTextColor(...blackColor);
        xPos += colWidths.subject;
        doc.text(section?.name || 'N/A', xPos, yPos, { align: 'left' });
        
        xPos += colWidths.section;
        doc.text(subject?.units?.toString() || '0', xPos + colWidths.unit/2, yPos, { align: 'center' });

        xPos += colWidths.unit;
        doc.setTextColor(...maroonColor);
        doc.text(getDayName(parseInt(schedule.day_of_week)), xPos + colWidths.day/2, yPos, { align: 'center' });

        doc.setTextColor(...blackColor);
        xPos += colWidths.day;
        doc.text(formatTimeRange(schedule.start_time, schedule.end_time), xPos, yPos, { align: 'left' });

        doc.setTextColor(...maroonColor);
        xPos += colWidths.time;
        doc.text(schedule?.room || 'TBD', xPos, yPos, { align: 'left' });

        yPos += 5;
      });
    } else {
      // No schedules - show TBD
      xPos = tableStartX;
      doc.setTextColor(...maroonColor);
      doc.text(subject?.code || 'N/A', xPos, yPos, { align: 'left' });

      doc.setTextColor(...blackColor);
      xPos += colWidths.subject;
      doc.text(section?.name || 'N/A', xPos, yPos, { align: 'left' });

      xPos += colWidths.section;
      doc.text(subject?.units?.toString() || '0', xPos + colWidths.unit/2, yPos, { align: 'center' });

      xPos += colWidths.unit;
      doc.text('TBD', xPos + colWidths.day/2, yPos, { align: 'center' });

      xPos += colWidths.day;
      doc.text('TBD', xPos, yPos, { align: 'left' });

      xPos += colWidths.time;
      doc.text('TBD', xPos, yPos, { align: 'left' });

      yPos += 5;
    }
    });
  }

  // Total Units
  yPos += 5;
  const totalUnits = classes && Array.isArray(classes) 
    ? classes.reduce((sum: number, item: Class) => sum + (item.subject?.units || 0), 0)
    : 0;
  doc.setTextColor(...maroonColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Units : ${totalUnits}`, tableStartX, yPos);

  // Registrar Section
  yPos += 20;
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Registrar name with underline
  doc.setFont('helvetica', 'bold');
  doc.text(registrarName, margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, margin + 40, yPos + 1);

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(registrarTitle, margin, yPos);

  // Date Enrolled
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Date Enrolled : ${enrollmentDate}`, margin, yPos);

  // QR Code Section
  const qrY = yPos - 30;
  const qrX = pageWidth - margin - 35;
  const qrSize = 30;

  try {
    const validationData = {
      studentId: studentId,
      studentName: studentName,
      documentType: 'Certificate of Registration',
      validationCode: `COR-${studentId}-${Date.now()}`,
      issuedDate: new Date().toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }),
      status: 'ENROLLED',
      program: program,
      academicYear: academicYear
    };
    
    // Generate URL in the format expected by CorValidation page
    const validationUrl = `${window.location.origin}/validate/cor?code=${validationData.validationCode}&student=${validationData.studentId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (error) {
    // Fallback: draw placeholder rectangle
    doc.setDrawColor(...blackColor);
    doc.rect(qrX, qrY, qrSize, qrSize);
    doc.setFontSize(6);
    doc.text('QR Code', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
  }

  // Scan to Verify text
  doc.setFontSize(8);
  doc.setTextColor(...maroonColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Scan to Verify', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('Online validation', qrX + qrSize / 2, qrY + qrSize + 8, { align: 'center' });

  // Save the PDF
  const fileName = `COR_${user?.last_name || 'Student'}_${user?.first_name || ''}_${Date.now()}.pdf`;
  doc.save(fileName);
};
