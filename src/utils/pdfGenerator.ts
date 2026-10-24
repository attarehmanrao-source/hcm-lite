import { jsPDF } from 'jspdf';
import { PayrollRecord } from '../types';

export function generatePayslipPDF(record: PayrollRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('HCM LITE ENTERPRISE SYSTEMS', 20, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('CONFIDENTIAL MONTHLY PAYSLIP & SALARY STATEMENT', 20, y + 16);

  doc.setFontSize(8);
  doc.text(`CYCLE: ${record.payrollMonth}`, pageWidth - 20, y + 13, { align: 'right' });

  y += 30;

  // Employee Information Box
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Employee Information', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Left Col
  doc.text('Employee ID:', 20, y + 13);
  doc.text('Full Name:', 20, y + 19);
  doc.text('Department:', 20, y + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(record.employeeId, 50, y + 13);
  doc.text(record.employeeName, 50, y + 19);
  doc.text(record.department, 50, y + 25);

  // Right Col
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Designation:', 115, y + 13);
  doc.text('Pay Period:', 115, y + 19);
  doc.text('Payment Status:', 115, y + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(record.designation, 145, y + 13);
  doc.text(record.payrollMonth, 145, y + 19);
  doc.text(record.paymentStatus.toUpperCase(), 145, y + 25);

  y += 36;

  // Earnings & Deductions Tables Header
  const colWidth = (pageWidth - 28 - 6) / 2;
  const leftX = 14;
  const rightX = leftX + colWidth + 6;

  // Earnings Header
  doc.setFillColor(241, 245, 249);
  doc.rect(leftX, y, colWidth, 8, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EARNINGS', leftX + 4, y + 5.5);
  doc.text('AMOUNT (PKR)', leftX + colWidth - 4, y + 5.5, { align: 'right' });

  // Deductions Header
  doc.setFillColor(241, 245, 249);
  doc.rect(rightX, y, colWidth, 8, 'F');
  doc.text('DEDUCTIONS', rightX + 4, y + 5.5);
  doc.text('AMOUNT (PKR)', rightX + colWidth - 4, y + 5.5, { align: 'right' });

  y += 10;

  // Rows
  const earnings = [
    { label: 'Basic Salary', amount: record.baseSalary },
    { label: 'Medical & Conveyance Allowance', amount: record.allowances },
    { label: 'Overtime & Bonuses', amount: record.overtimeBonus },
  ];

  const deductions = [
    { label: 'Income Tax (Statutory)', amount: record.taxDeduction },
    { label: 'Provident Fund (5%)', amount: record.providentFund },
    { label: 'Other Adjustments', amount: record.otherDeductions },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const rowCount = Math.max(earnings.length, deductions.length);
  for (let i = 0; i < rowCount; i++) {
    const earn = earnings[i];
    const ded = deductions[i];

    if (earn) {
      doc.setTextColor(71, 85, 105);
      doc.text(earn.label, leftX + 4, y + 5);
      doc.setTextColor(15, 23, 42);
      doc.text(earn.amount.toLocaleString(), leftX + colWidth - 4, y + 5, { align: 'right' });
    }

    if (ded) {
      doc.setTextColor(71, 85, 105);
      doc.text(ded.label, rightX + 4, y + 5);
      doc.setTextColor(15, 23, 42);
      doc.text(ded.amount.toLocaleString(), rightX + colWidth - 4, y + 5, { align: 'right' });
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(leftX, y + 8, leftX + colWidth, y + 8);
    doc.line(rightX, y + 8, rightX + colWidth, y + 8);

    y += 8;
  }

  y += 4;

  // Subtotals
  const totalGross = record.baseSalary + record.allowances + record.overtimeBonus;
  const totalDeductions = record.taxDeduction + record.providentFund + record.otherDeductions;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  doc.text('Total Gross Earnings:', leftX + 4, y + 5);
  doc.text(`PKR ${totalGross.toLocaleString()}`, leftX + colWidth - 4, y + 5, { align: 'right' });

  doc.text('Total Deductions:', rightX + 4, y + 5);
  doc.text(`PKR ${totalDeductions.toLocaleString()}`, rightX + colWidth - 4, y + 5, { align: 'right' });

  y += 14;

  // Net Payable Highlighting Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NET SALARY PAYABLE:', 20, y + 8);

  doc.setFontSize(14);
  doc.text(`PKR ${record.netSalary.toLocaleString()}`, 20, y + 17);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Disbursed via Direct Bank Deposit`, pageWidth - 20, y + 12, { align: 'right' });
  doc.text(`Processed By: ${record.processedBy}`, pageWidth - 20, y + 17, { align: 'right' });

  y += 34;

  // Signatures & Stamp
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y + 12, 70, y + 12);
  doc.line(pageWidth - 70, y + 12, pageWidth - 20, y + 12);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Employee Signature', 45, y + 17, { align: 'center' });
  doc.text('Authorized HR Signatory', pageWidth - 45, y + 17, { align: 'center' });

  // Institutional Footer & Mandatory Acknowledgment
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Developer: M. Atta ur Rehman Khan | Roll No: 777760 | HCM Lite HRMS Enterprise Engine',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'italic');
  doc.text(
    'Deeply thankful to SMIT (Saylani Mass IT Training) and instructor Sir Azeem for guidance.',
    pageWidth / 2,
    footerY + 10,
    { align: 'center' }
  );

  doc.save(`Payslip_${record.employeeId}_${record.payrollMonth}.pdf`);
}
