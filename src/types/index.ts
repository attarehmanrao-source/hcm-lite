export type Role = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  employeeId?: string;
  isFirstSignIn: boolean;
  employeeProfile?: Employee | null;
}

export interface Employee {
  id: string; // EMP-XXXX
  userId?: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  salaryGrade: string;
  baseSalary: number;
  dateOfJoining: string;
  phone: string;
  address: string;
  role: Role;
  status: 'active' | 'on_leave' | 'terminated';
  leaveBalance: {
    annual: number;
    casual: number;
    sick: number;
  };
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  totalHours: number;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent';
  notes?: string;
  adjustedBy?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Casual' | 'Sick' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

export interface PayrollRecord {
  id: string;
  payrollMonth: string; // YYYY-MM
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  baseSalary: number;
  allowances: number;
  overtimeBonus: number;
  taxDeduction: number;
  providentFund: number;
  otherDeductions: number;
  netSalary: number;
  paymentStatus: 'Processed' | 'Paid';
  processedAt: string;
  processedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Policy' | 'Event' | 'Alert' | 'General';
  priority: 'Normal' | 'Important' | 'Urgent';
  isPinned: boolean;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface AttendanceTrendItem {
  date: string;
  dayLabel: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  attendanceRate: number;
  pendingLeaves: number;
  totalPayrollExpense: number;
  latestPayrollMonth: string;
  departmentDistribution: { name: string; count: number }[];
  attendanceTrend?: AttendanceTrendItem[];
  recentActivity: AuditLog[];
}
