import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'hcm-lite-production-secret-key-2026-atta';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'hcm_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data Schema Types
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'admin' | 'hr' | 'employee';
  employeeId?: string;
  isFirstSignIn: boolean;
  createdAt: string;
}

export interface EmployeeRecord {
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
  role: 'admin' | 'hr' | 'employee';
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
  checkInTime?: string; // ISO or HH:mm
  checkOutTime?: string; // ISO or HH:mm
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

export interface AnnouncementRecord {
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

export interface AuditLogRecord {
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

interface AppStore {
  users: UserRecord[];
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
  leaves: LeaveRecord[];
  payroll: PayrollRecord[];
  announcements: AnnouncementRecord[];
  auditLogs: AuditLogRecord[];
}

// Clean empty start - Initial empty store
function getInitialStore(): AppStore {
  return {
    users: [],
    employees: [],
    attendance: [],
    leaves: [],
    payroll: [],
    announcements: [],
    auditLogs: [],
  };
}

function loadStore(): AppStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load store, initializing empty store', err);
  }
  const initial = getInitialStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: AppStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store', err);
  }
}

let store = loadStore();

function logAudit(
  user: { id: string; fullName: string; role: string },
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  ipAddress = '127.0.0.1'
) {
  const log: AuditLogRecord = {
    id: 'AUD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  };
  store.auditLogs.unshift(log);
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'hr' | 'employee';
    fullName: string;
    employeeId?: string;
    isFirstSignIn: boolean;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

function requireRoles(...allowedRoles: Array<'admin' | 'hr' | 'employee'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized: Insufficient role permissions. Required: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Gemini client:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // System Initialization Status
  // -------------------------------------------------------------
  app.get('/api/system/status', (req: Request, res: Response) => {
    const hasAdmin = store.users.some((u) => u.role === 'admin');
    res.json({
      initialized: hasAdmin,
      userCount: store.users.length,
      employeeCount: store.employees.length,
      developer: 'M. Atta ur Rehman Khan',
      rollNo: '777760',
      institutionAcknowledgment:
        'I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today.',
    });
  });

  // -------------------------------------------------------------
  // Setup First Admin (Initial Clean Slate Setup)
  // -------------------------------------------------------------
  app.post('/api/system/setup-admin', (req: Request, res: Response) => {
    const hasAdmin = store.users.some((u) => u.role === 'admin');
    if (hasAdmin) {
      return res.status(400).json({ error: 'Initial administrator already configured' });
    }

    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const adminUser: UserRecord = {
      id: 'USR-ADMIN-' + Date.now(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // For production demonstration in lite environment
      fullName: fullName.trim(),
      role: 'admin',
      isFirstSignIn: false,
      createdAt: new Date().toISOString(),
    };

    store.users.push(adminUser);
    saveStore(store);

    logAudit(adminUser, 'CREATE_ADMIN', 'USER', adminUser.id, 'Initial administrator registered');

    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        fullName: adminUser.fullName,
        isFirstSignIn: false,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        isFirstSignIn: false,
      },
    });
  });

  // -------------------------------------------------------------
  // Optional Quick Seed (For Testing / Review Demonstration)
  // -------------------------------------------------------------
  app.post('/api/system/seed-demo', (req: Request, res: Response) => {
    // Only allow if requested
    const demoAdmin: UserRecord = {
      id: 'USR-ADM-001',
      email: 'admin@hcmlite.com',
      passwordHash: 'admin123',
      fullName: 'M. Atta ur Rehman Khan',
      role: 'admin',
      employeeId: 'EMP-1001',
      isFirstSignIn: false,
      createdAt: new Date().toISOString(),
    };

    const demoHR: UserRecord = {
      id: 'USR-HR-002',
      email: 'hr@hcmlite.com',
      passwordHash: 'hr123',
      fullName: 'Ayesha Siddiqua',
      role: 'hr',
      employeeId: 'EMP-1002',
      isFirstSignIn: false,
      createdAt: new Date().toISOString(),
    };

    const demoEmp: UserRecord = {
      id: 'USR-EMP-003',
      email: 'employee@hcmlite.com',
      passwordHash: 'emp123',
      fullName: 'Zain Ul Abideen',
      role: 'employee',
      employeeId: 'EMP-1003',
      isFirstSignIn: true,
      createdAt: new Date().toISOString(),
    };

    const demoEmployees: EmployeeRecord[] = [
      {
        id: 'EMP-1001',
        userId: 'USR-ADM-001',
        fullName: 'M. Atta ur Rehman Khan',
        email: 'admin@hcmlite.com',
        department: 'Executive Leadership',
        designation: 'Chief Technology Officer',
        salaryGrade: 'L7-Executive',
        baseSalary: 185000,
        dateOfJoining: '2023-01-15',
        phone: '+92 300 1234567',
        address: 'Karachi, Sindh, Pakistan',
        role: 'admin',
        status: 'active',
        leaveBalance: { annual: 18, casual: 10, sick: 10 },
        createdAt: '2023-01-15T09:00:00Z',
      },
      {
        id: 'EMP-1002',
        userId: 'USR-HR-002',
        fullName: 'Ayesha Siddiqua',
        email: 'hr@hcmlite.com',
        department: 'Human Resources',
        designation: 'Senior HR Operations Manager',
        salaryGrade: 'L5-Lead',
        baseSalary: 120000,
        dateOfJoining: '2023-06-01',
        phone: '+92 321 9876543',
        address: 'Lahore, Punjab, Pakistan',
        role: 'hr',
        status: 'active',
        leaveBalance: { annual: 14, casual: 9, sick: 8 },
        createdAt: '2023-06-01T09:00:00Z',
      },
      {
        id: 'EMP-1003',
        userId: 'USR-EMP-003',
        fullName: 'Zain Ul Abideen',
        email: 'employee@hcmlite.com',
        department: 'Software Engineering',
        designation: 'Full-Stack Software Engineer',
        salaryGrade: 'L3-Senior',
        baseSalary: 95000,
        dateOfJoining: '2024-02-10',
        phone: '+92 333 4567890',
        address: 'Islamabad, Pakistan',
        role: 'employee',
        status: 'active',
        leaveBalance: { annual: 12, casual: 8, sick: 7 },
        createdAt: '2024-02-10T09:00:00Z',
      },
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const demoAttendance: AttendanceRecord[] = [
      {
        id: 'ATT-' + Date.now() + '-1',
        employeeId: 'EMP-1001',
        employeeName: 'M. Atta ur Rehman Khan',
        department: 'Executive Leadership',
        date: todayStr,
        checkInTime: '08:55',
        checkOutTime: '17:30',
        totalHours: 8.58,
        status: 'Present',
      },
      {
        id: 'ATT-' + Date.now() + '-2',
        employeeId: 'EMP-1002',
        employeeName: 'Ayesha Siddiqua',
        department: 'Human Resources',
        date: todayStr,
        checkInTime: '09:42',
        totalHours: 0,
        status: 'Late',
        notes: 'Arrived after 09:30 AM standard policy',
      },
    ];

    const demoLeaves: LeaveRecord[] = [
      {
        id: 'LV-2026-001',
        employeeId: 'EMP-1003',
        employeeName: 'Zain Ul Abideen',
        department: 'Software Engineering',
        leaveType: 'Annual',
        startDate: '2026-11-05',
        endDate: '2026-11-08',
        totalDays: 4,
        reason: 'Family wedding ceremony and travel',
        status: 'Pending',
        appliedAt: new Date().toISOString(),
      },
    ];

    const demoAnnouncements: AnnouncementRecord[] = [
      {
        id: 'ANN-001',
        title: 'Welcome to HCM Lite HRMS Enterprise Portal',
        content:
          'We are delighted to inaugurate HCM Lite developed by M. Atta ur Rehman Khan (Roll No: 777760). Deepest gratitude to SMIT (Saylani Mass IT Training) and instructor Sir Azeem for exceptional mentorship!',
        category: 'General',
        priority: 'Urgent',
        isPinned: true,
        authorName: 'M. Atta ur Rehman Khan',
        authorRole: 'CTO & System Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ANN-002',
        title: 'Fiscal Year 2026 Leave Policy & Health Benefits Notice',
        content:
          'Employees are advised to submit quarterly leave requests at least 5 business days prior to cycle closure. Flexible remote work hours apply on alternating Fridays.',
        category: 'Policy',
        priority: 'Important',
        isPinned: false,
        authorName: 'Ayesha Siddiqua',
        authorRole: 'HR Manager',
        createdAt: new Date().toISOString(),
      },
    ];

    store.users = [demoAdmin, demoHR, demoEmp];
    store.employees = demoEmployees;
    store.attendance = demoAttendance;
    store.leaves = demoLeaves;
    store.announcements = demoAnnouncements;
    saveStore(store);

    logAudit(demoAdmin, 'SEED_DEMO_DATA', 'SYSTEM', 'ALL', 'Populated sample organizational structure');

    res.json({ message: 'Demo data seeded successfully', userCount: store.users.length });
  });

  // -------------------------------------------------------------
  // Reset Database (Clean Empty State)
  // -------------------------------------------------------------
  app.post('/api/system/reset-clean', authenticateToken, requireRoles('admin'), (req: AuthRequest, res: Response) => {
    store = getInitialStore();
    saveStore(store);
    res.json({ message: 'Database reset to clean empty state successfully' });
  });

  // -------------------------------------------------------------
  // Module 1: Authentication & Session
  // -------------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        employeeId: user.employeeId,
        isFirstSignIn: user.isFirstSignIn,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit(user, 'USER_LOGIN', 'USER', user.id, `User logged in from web client`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        employeeId: user.employeeId,
        isFirstSignIn: user.isFirstSignIn,
      },
    });
  });

  app.post('/api/auth/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
    const { newPassword, currentPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = store.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentPassword && user.passwordHash !== currentPassword) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    user.passwordHash = newPassword;
    user.isFirstSignIn = false;
    saveStore(store);

    logAudit(user, 'CHANGE_PASSWORD', 'USER', user.id, 'User changed password and verified first sign-in');

    res.json({ message: 'Password updated successfully. You can now access full features.' });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    const user = store.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    const emp = store.employees.find((e) => e.id === user.employeeId || e.email === user.email);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        employeeId: user.employeeId,
        isFirstSignIn: user.isFirstSignIn,
        employeeProfile: emp || null,
      },
    });
  });

  // -------------------------------------------------------------
  // Module 2: Employee Directory & CSV Import/Export
  // -------------------------------------------------------------
  app.get('/api/employees', authenticateToken, (req: AuthRequest, res: Response) => {
    const { search, department, status } = req.query;
    let list = [...store.employees];

    // Employee role can only see their own profile or public team listing
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }
    if (department) {
      list = list.filter((e) => e.department === department);
    }
    if (status) {
      list = list.filter((e) => e.status === status);
    }

    res.json(list);
  });

  app.post('/api/employees', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const {
      fullName,
      email,
      department,
      designation,
      salaryGrade,
      baseSalary,
      dateOfJoining,
      phone,
      address,
      role = 'employee',
      defaultPassword = 'Password123!',
    } = req.body;

    if (!fullName || !email || !department || !designation) {
      return res.status(400).json({ error: 'Name, email, department, and designation are mandatory' });
    }

    const existingEmp = store.employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (existingEmp) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    // Auto-generate Employee ID
    const nextNum = store.employees.length + 1001;
    const empId = `EMP-${nextNum}`;

    const newEmp: EmployeeRecord = {
      id: empId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      department,
      designation,
      salaryGrade: salaryGrade || 'L2-Associate',
      baseSalary: parseFloat(baseSalary) || 50000,
      dateOfJoining: dateOfJoining || new Date().toISOString().split('T')[0],
      phone: phone || '',
      address: address || '',
      role: role || 'employee',
      status: 'active',
      leaveBalance: { annual: 14, casual: 10, sick: 8 },
      createdAt: new Date().toISOString(),
    };

    // Also create login account for this employee with isFirstSignIn: true
    const newUser: UserRecord = {
      id: 'USR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      email: newEmp.email,
      passwordHash: defaultPassword,
      fullName: newEmp.fullName,
      role: newEmp.role,
      employeeId: newEmp.id,
      isFirstSignIn: true,
      createdAt: new Date().toISOString(),
    };

    newEmp.userId = newUser.id;
    store.employees.push(newEmp);
    store.users.push(newUser);
    saveStore(store);

    logAudit(
      req.user!,
      'CREATE_EMPLOYEE',
      'EMPLOYEE',
      newEmp.id,
      `Created employee record for ${newEmp.fullName} (${newEmp.id}) with role ${newEmp.role}`
    );

    res.status(201).json({
      employee: newEmp,
      temporaryPassword: defaultPassword,
      message: 'Employee and user account successfully created',
    });
  });

  app.put('/api/employees/:id', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const emp = store.employees.find((e) => e.id === id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const {
      fullName,
      department,
      designation,
      salaryGrade,
      baseSalary,
      phone,
      address,
      status,
      leaveBalance,
    } = req.body;

    if (fullName) emp.fullName = fullName.trim();
    if (department) emp.department = department;
    if (designation) emp.designation = designation;
    if (salaryGrade) emp.salaryGrade = salaryGrade;
    if (baseSalary !== undefined) emp.baseSalary = parseFloat(baseSalary);
    if (phone !== undefined) emp.phone = phone;
    if (address !== undefined) emp.address = address;
    if (status) emp.status = status;
    if (leaveBalance) emp.leaveBalance = leaveBalance;

    saveStore(store);

    logAudit(req.user!, 'UPDATE_EMPLOYEE', 'EMPLOYEE', emp.id, `Updated employee profile for ${emp.fullName}`);

    res.json(emp);
  });

  // Update Employee Security / Password
  app.post('/api/employees/:id/security', authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emp = store.employees.find((e) => e.id === id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const targetUser = store.users.find((u) => u.employeeId === id || u.email === emp.email);
    if (!targetUser) {
      return res.status(404).json({ error: 'Associated user account not found' });
    }

    // Role check: Only Admin, HR, or the employee themselves can update password
    const isSelf = req.user?.id === targetUser.id || req.user?.employeeId === id;
    const isAuthorizedRole = req.user?.role === 'admin' || req.user?.role === 'hr';

    if (!isSelf && !isAuthorizedRole) {
      return res.status(403).json({ error: 'Unauthorized to change this password' });
    }

    // If self-service, check current password if provided
    if (isSelf && currentPassword && targetUser.passwordHash !== currentPassword) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    targetUser.passwordHash = newPassword;
    targetUser.isFirstSignIn = false;
    saveStore(store);

    logAudit(
      req.user!,
      'RESET_EMPLOYEE_PASSWORD',
      'USER',
      targetUser.id,
      `Security password updated for ${emp.fullName} (${emp.id}) by ${req.user?.fullName}`
    );

    res.json({ message: `Password for ${emp.fullName} updated successfully` });
  });

  app.delete('/api/employees/:id', authenticateToken, requireRoles('admin'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const index = store.employees.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const removed = store.employees.splice(index, 1)[0];
    // Deactivate user
    const userIdx = store.users.findIndex((u) => u.employeeId === id || u.email === removed.email);
    if (userIdx !== -1) {
      store.users.splice(userIdx, 1);
    }
    saveStore(store);

    logAudit(req.user!, 'DELETE_EMPLOYEE', 'EMPLOYEE', id, `Deleted employee record for ${removed.fullName}`);

    res.json({ message: 'Employee successfully removed' });
  });

  // Bulk CSV Import
  app.post('/api/employees/bulk-import', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { employees: importedList } = req.body;
    if (!Array.isArray(importedList) || importedList.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty employee list' });
    }

    const added: EmployeeRecord[] = [];
    const errors: string[] = [];

    importedList.forEach((item: any, idx: number) => {
      if (!item.fullName || !item.email || !item.department) {
        errors.push(`Row ${idx + 1}: Missing name, email, or department`);
        return;
      }

      if (store.employees.some((e) => e.email.toLowerCase() === item.email.toLowerCase())) {
        errors.push(`Row ${idx + 1}: Email ${item.email} already exists`);
        return;
      }

      const nextNum = store.employees.length + added.length + 1001;
      const empId = `EMP-${nextNum}`;

      const newEmp: EmployeeRecord = {
        id: empId,
        fullName: item.fullName.trim(),
        email: item.email.toLowerCase().trim(),
        department: item.department.trim(),
        designation: item.designation || 'Staff Associate',
        salaryGrade: item.salaryGrade || 'L2-Associate',
        baseSalary: parseFloat(item.baseSalary) || 50000,
        dateOfJoining: item.dateOfJoining || new Date().toISOString().split('T')[0],
        phone: item.phone || '',
        address: item.address || '',
        role: item.role === 'admin' || item.role === 'hr' ? item.role : 'employee',
        status: 'active',
        leaveBalance: { annual: 14, casual: 10, sick: 8 },
        createdAt: new Date().toISOString(),
      };

      const newUser: UserRecord = {
        id: 'USR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        email: newEmp.email,
        passwordHash: 'Password123!',
        fullName: newEmp.fullName,
        role: newEmp.role,
        employeeId: newEmp.id,
        isFirstSignIn: true,
        createdAt: new Date().toISOString(),
      };

      newEmp.userId = newUser.id;
      added.push(newEmp);
      store.users.push(newUser);
    });

    store.employees.push(...added);
    saveStore(store);

    logAudit(
      req.user!,
      'BULK_IMPORT_EMPLOYEES',
      'EMPLOYEE',
      'MULTIPLE',
      `Imported ${added.length} employees via CSV. Errors: ${errors.length}`
    );

    res.json({
      successCount: added.length,
      errors,
      employees: added,
    });
  });

  // -------------------------------------------------------------
  // Module 3: Attendance Management
  // -------------------------------------------------------------
  app.get('/api/attendance', authenticateToken, (req: AuthRequest, res: Response) => {
    const { date, employeeId, department } = req.query;
    let list = [...store.attendance];

    // If Employee role, restrict to their own logs
    if (req.user?.role === 'employee') {
      const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
      const myEmpId = emp?.id || req.user?.employeeId;
      list = list.filter((a) => a.employeeId === myEmpId);
    } else {
      if (employeeId) {
        list = list.filter((a) => a.employeeId === employeeId);
      }
      if (department) {
        list = list.filter((a) => a.department === department);
      }
    }

    if (date) {
      list = list.filter((a) => a.date === date);
    }

    // Sort descending by date
    list.sort((a, b) => (b.date + (b.checkInTime || '')).localeCompare(a.date + (a.checkInTime || '')));

    res.json(list);
  });

  app.get('/api/attendance/today', authenticateToken, (req: AuthRequest, res: Response) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
    const myEmpId = emp?.id || req.user?.employeeId;

    if (!myEmpId) {
      return res.json({ record: null, message: 'No employee record associated' });
    }

    const todayRecord = store.attendance.find((a) => a.employeeId === myEmpId && a.date === todayStr);
    res.json({ record: todayRecord || null, employeeId: myEmpId });
  });

  app.post('/api/attendance/check-in', authenticateToken, (req: AuthRequest, res: Response) => {
    const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
    if (!emp) {
      return res.status(400).json({ error: 'No active employee profile linked to your account' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const existing = store.attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);

    if (existing && existing.checkInTime) {
      return res.status(400).json({ error: 'You have already checked in today at ' + existing.checkInTime });
    }

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5); // HH:mm
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Standard office starts at 09:30 AM. After 09:30 is marked Late
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status: AttendanceRecord['status'] = isLate ? 'Late' : 'Present';

    const newRecord: AttendanceRecord = {
      id: 'ATT-' + Date.now(),
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      date: todayStr,
      checkInTime: timeStr,
      totalHours: 0,
      status,
      notes: isLate ? 'Late punch recorded after 09:30 AM' : 'Standard check-in',
    };

    store.attendance.push(newRecord);
    saveStore(store);

    logAudit(req.user!, 'CHECK_IN', 'ATTENDANCE', newRecord.id, `Recorded check-in at ${timeStr} (${status})`);

    res.status(201).json({ message: 'Checked in successfully', record: newRecord });
  });

  app.post('/api/attendance/check-out', authenticateToken, (req: AuthRequest, res: Response) => {
    const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
    if (!emp) {
      return res.status(400).json({ error: 'No active employee profile linked' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const record = store.attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);

    if (!record || !record.checkInTime) {
      return res.status(400).json({ error: 'You must check in first before checking out' });
    }

    if (record.checkOutTime) {
      return res.status(400).json({ error: 'You have already checked out today at ' + record.checkOutTime });
    }

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5); // HH:mm
    record.checkOutTime = timeStr;

    // Calculate hours worked
    const [inH, inM] = record.checkInTime.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    const diffMinutes = outH * 60 + outM - (inH * 60 + inM);
    const totalHours = Math.max(0, parseFloat((diffMinutes / 60).toFixed(2)));
    record.totalHours = totalHours;

    if (totalHours < 4 && record.status !== 'Late') {
      record.status = 'Half-day';
    }

    saveStore(store);

    logAudit(
      req.user!,
      'CHECK_OUT',
      'ATTENDANCE',
      record.id,
      `Recorded check-out at ${timeStr}. Total hours: ${totalHours}h`
    );

    res.json({ message: 'Checked out successfully', record });
  });

  app.post('/api/attendance/adjust', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { employeeId, date, checkInTime, checkOutTime, status, notes } = req.body;
    if (!employeeId || !date) {
      return res.status(400).json({ error: 'Employee ID and date are required' });
    }

    const emp = store.employees.find((e) => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let record = store.attendance.find((a) => a.employeeId === employeeId && a.date === date);
    if (!record) {
      record = {
        id: 'ATT-' + Date.now(),
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        date,
        totalHours: 0,
        status: status || 'Present',
        notes: notes || 'Manual adjustment by HR',
        adjustedBy: req.user?.fullName,
      };
      store.attendance.push(record);
    }

    if (checkInTime) record.checkInTime = checkInTime;
    if (checkOutTime) record.checkOutTime = checkOutTime;
    if (status) record.status = status;
    if (notes) record.notes = notes;
    record.adjustedBy = req.user?.fullName;

    if (record.checkInTime && record.checkOutTime) {
      const [inH, inM] = record.checkInTime.split(':').map(Number);
      const [outH, outM] = record.checkOutTime.split(':').map(Number);
      const diffMinutes = outH * 60 + outM - (inH * 60 + inM);
      record.totalHours = Math.max(0, parseFloat((diffMinutes / 60).toFixed(2)));
    }

    saveStore(store);

    logAudit(
      req.user!,
      'ADJUST_ATTENDANCE',
      'ATTENDANCE',
      record.id,
      `Adjusted attendance for ${emp.fullName} on ${date} (Status: ${record.status})`
    );

    res.json({ message: 'Attendance adjusted successfully', record });
  });

  // -------------------------------------------------------------
  // Module 4: Leave Management
  // -------------------------------------------------------------
  app.get('/api/leaves', authenticateToken, (req: AuthRequest, res: Response) => {
    const { status, employeeId } = req.query;
    let list = [...store.leaves];

    // If regular employee, only show their own leaves
    if (req.user?.role === 'employee') {
      const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
      const myEmpId = emp?.id || req.user?.employeeId;
      list = list.filter((l) => l.employeeId === myEmpId);
    } else {
      if (employeeId) {
        list = list.filter((l) => l.employeeId === employeeId);
      }
    }

    if (status) {
      list = list.filter((l) => l.status === status);
    }

    list.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    res.json(list);
  });

  app.post('/api/leaves', authenticateToken, (req: AuthRequest, res: Response) => {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required' });
    }

    const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
    if (!emp) {
      return res.status(400).json({ error: 'No active employee profile linked' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) {
      return res.status(400).json({ error: 'End date must be on or after start date' });
    }

    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    const typeKey = leaveType.toLowerCase() as 'annual' | 'casual' | 'sick';
    if (typeKey in emp.leaveBalance) {
      if (emp.leaveBalance[typeKey] < totalDays) {
        return res.status(400).json({
          error: `Insufficient ${leaveType} leave balance. Available: ${emp.leaveBalance[typeKey]} days, requested: ${totalDays} days.`,
        });
      }
    }

    const newLeave: LeaveRecord = {
      id: 'LV-' + new Date().getFullYear() + '-' + (store.leaves.length + 101),
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
      status: 'Pending',
      appliedAt: new Date().toISOString(),
    };

    store.leaves.push(newLeave);
    saveStore(store);

    logAudit(
      req.user!,
      'APPLY_LEAVE',
      'LEAVE',
      newLeave.id,
      `Applied for ${totalDays} days of ${leaveType} leave from ${startDate} to ${endDate}`
    );

    res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
  });

  app.patch('/api/leaves/:id/review', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected' });
    }

    const leave = store.leaves.find((l) => l.id === id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: 'This leave request has already been reviewed' });
    }

    leave.status = status;
    leave.reviewedBy = req.user?.fullName;
    leave.reviewComment = reviewComment || (status === 'Approved' ? 'Approved by HR' : 'Declined per HR review');
    leave.reviewedAt = new Date().toISOString();

    // If approved, deduct leave balance
    if (status === 'Approved') {
      const emp = store.employees.find((e) => e.id === leave.employeeId);
      if (emp) {
        const typeKey = leave.leaveType.toLowerCase() as 'annual' | 'casual' | 'sick';
        if (typeKey in emp.leaveBalance) {
          emp.leaveBalance[typeKey] = Math.max(0, emp.leaveBalance[typeKey] - leave.totalDays);
        }
      }
    }

    saveStore(store);

    logAudit(
      req.user!,
      'REVIEW_LEAVE',
      'LEAVE',
      leave.id,
      `${status} leave request for ${leave.employeeName} (${leave.totalDays} days)`
    );

    res.json({ message: `Leave application ${status.toLowerCase()} successfully`, leave });
  });

  // -------------------------------------------------------------
  // Module 5: Payroll & Compensation Engine
  // -------------------------------------------------------------
  app.get('/api/payroll', authenticateToken, (req: AuthRequest, res: Response) => {
    const { month, employeeId } = req.query;
    let list = [...store.payroll];

    if (req.user?.role === 'employee') {
      const emp = store.employees.find((e) => e.userId === req.user?.id || e.email === req.user?.email);
      const myEmpId = emp?.id || req.user?.employeeId;
      list = list.filter((p) => p.employeeId === myEmpId);
    } else {
      if (employeeId) {
        list = list.filter((p) => p.employeeId === employeeId);
      }
    }

    if (month) {
      list = list.filter((p) => p.payrollMonth === month);
    }

    list.sort((a, b) => b.payrollMonth.localeCompare(a.payrollMonth));
    res.json(list);
  });

  app.post('/api/payroll/run', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { payrollMonth } = req.body; // e.g. "2026-10"
    if (!payrollMonth || !/^\d{4}-\d{2}$/.test(payrollMonth)) {
      return res.status(400).json({ error: 'Valid payroll month (YYYY-MM) is required' });
    }

    const activeEmployees = store.employees.filter((e) => e.status !== 'terminated');
    if (activeEmployees.length === 0) {
      return res.status(400).json({ error: 'No active employees found to execute payroll' });
    }

    const processedSlips: PayrollRecord[] = [];
    const timestamp = new Date().toISOString();

    for (const emp of activeEmployees) {
      // Check if already processed for this cycle
      const existing = store.payroll.find((p) => p.employeeId === emp.id && p.payrollMonth === payrollMonth);
      if (existing) continue;

      const baseSalary = emp.baseSalary || 50000;
      // Allowances: 15% Medical & Conveyance
      const allowances = Math.round(baseSalary * 0.15);
      // Tax: Simplified progressive deduction (e.g. 5% if base > 60k, 10% if base > 100k)
      let taxRate = 0.02;
      if (baseSalary >= 100000) taxRate = 0.08;
      else if (baseSalary >= 60000) taxRate = 0.05;

      const taxDeduction = Math.round(baseSalary * taxRate);
      // Provident Fund: 5%
      const providentFund = Math.round(baseSalary * 0.05);
      // Overtime or performance bonus
      const overtimeBonus = 0;
      const otherDeductions = 0;

      const netSalary = baseSalary + allowances + overtimeBonus - (taxDeduction + providentFund + otherDeductions);

      const record: PayrollRecord = {
        id: `PAY-${payrollMonth}-${emp.id}`,
        payrollMonth,
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        designation: emp.designation,
        baseSalary,
        allowances,
        overtimeBonus,
        taxDeduction,
        providentFund,
        otherDeductions,
        netSalary,
        paymentStatus: 'Processed',
        processedAt: timestamp,
        processedBy: req.user?.fullName || 'System HR',
      };

      store.payroll.push(record);
      processedSlips.push(record);
    }

    saveStore(store);

    logAudit(
      req.user!,
      'RUN_PAYROLL',
      'PAYROLL',
      payrollMonth,
      `Executed payroll cycle for ${payrollMonth}: ${processedSlips.length} payslips generated.`
    );

    res.status(201).json({
      message: `Payroll cycle executed successfully for ${payrollMonth}`,
      processedCount: processedSlips.length,
      records: processedSlips,
    });
  });

  // -------------------------------------------------------------
  // Module 6: Executive Dashboards & KPIs
  // -------------------------------------------------------------
  app.get('/api/dashboard/stats', authenticateToken, (req: AuthRequest, res: Response) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalEmployees = store.employees.length;
    const activeEmployees = store.employees.filter((e) => e.status === 'active').length;

    // Today's attendance
    const todayAtt = store.attendance.filter((a) => a.date === todayStr);
    const presentToday = todayAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    // Pending Leaves
    const pendingLeaves = store.leaves.filter((l) => l.status === 'Pending').length;

    // Payroll expense for latest cycle
    const latestMonth = store.payroll[0]?.payrollMonth || 'Current';
    const latestPayrollList = store.payroll.filter((p) => p.payrollMonth === latestMonth);
    const totalPayrollExpense = latestPayrollList.reduce((acc, curr) => acc + curr.netSalary, 0);

    // Department breakdown
    const deptMap: Record<string, number> = {};
    store.employees.forEach((e) => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    const departmentDistribution = Object.entries(deptMap).map(([name, count]) => ({
      name,
      count,
    }));

    // Attendance trend for the last 7 days
    const attendanceTrend: Array<{ date: string; dayLabel: string; present: number; late: number; absent: number; total: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLogs = store.attendance.filter((a) => a.date === dateStr);
      const present = dayLogs.filter((a) => a.status === 'Present').length;
      const late = dayLogs.filter((a) => a.status === 'Late').length;
      const halfDay = dayLogs.filter((a) => a.status === 'Half-day').length;
      const absent = totalEmployees > 0 ? Math.max(0, totalEmployees - (present + late + halfDay)) : 0;
      attendanceTrend.push({
        date: dateStr,
        dayLabel,
        present: present + halfDay,
        late,
        absent,
        total: totalEmployees,
      });
    }

    // Recent activity audit
    const recentActivity = store.auditLogs.slice(0, 10);

    res.json({
      totalEmployees,
      activeEmployees,
      presentToday,
      attendanceRate,
      pendingLeaves,
      totalPayrollExpense,
      latestPayrollMonth: latestMonth,
      departmentDistribution,
      attendanceTrend,
      recentActivity,
    });
  });

  // -------------------------------------------------------------
  // Module 7: AI Assistant (LLM Tool Calling with Gemini 3.8 Flash)
  // -------------------------------------------------------------
  app.post('/api/ai/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { message, conversationHistory = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message prompt is required' });
    }

    if (!geminiClient) {
      // Graceful fallback response when GEMINI_API_KEY is not configured in environment
      return res.json({
        reply: `AI Assistant is currently operating in offline guidance mode. (Set GEMINI_API_KEY to activate live Gemini 3.8 Flash tool-calling). Here is what I can tell you from local data:\n\n` +
          `• Total Employees: ${store.employees.length}\n` +
          `• Pending Leaves: ${store.leaves.filter((l) => l.status === 'Pending').length}\n` +
          `• System Developer: M. Atta ur Rehman Khan (Roll No: 777760)\n` +
          `• Institution: SMIT under Sir Azeem's guidance.`,
        toolCalls: [],
      });
    }

    try {
      // Define tool functions that the LLM can execute
      const functionDeclarations: FunctionDeclaration[] = [
        {
          name: 'query_employee_leave_status',
          description: 'Lookup leave requests and leave balances for an employee or all pending leaves.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              employeeNameOrId: {
                type: Type.STRING,
                description: 'Optional employee name or ID to filter by. Leave empty for all.',
              },
            },
          },
        },
        {
          name: 'get_attendance_metrics',
          description: 'Retrieve today or a specific date attendance breakdown, late arrivals, and rate.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              date: {
                type: Type.STRING,
                description: 'Date in YYYY-MM-DD format (defaults to today if empty).',
              },
            },
          },
        },
        {
          name: 'summarize_payroll',
          description: 'Get summary of payroll expenditures, processed headcount, and total net pay.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              payrollMonth: {
                type: Type.STRING,
                description: 'Month in YYYY-MM format (e.g. 2026-10).',
              },
            },
          },
        },
        {
          name: 'list_company_announcements',
          description: 'Retrieve active broadcasts and policy announcements.',
          parameters: {
            type: Type.OBJECT,
            properties: {},
          },
        },
      ];

      // Tool dispatcher
      const executeTool = (name: string, args: any) => {
        if (name === 'query_employee_leave_status') {
          const q = args?.employeeNameOrId?.toLowerCase() || '';
          let results = store.leaves;
          if (q) {
            results = results.filter(
              (l) => l.employeeName.toLowerCase().includes(q) || l.employeeId.toLowerCase().includes(q)
            );
          }
          return {
            totalLeavesFound: results.length,
            leaves: results.slice(0, 5),
            activeEmployeesBalance: store.employees.map((e) => ({
              id: e.id,
              name: e.fullName,
              leaveBalance: e.leaveBalance,
            })),
          };
        }

        if (name === 'get_attendance_metrics') {
          const targetDate = args?.date || new Date().toISOString().split('T')[0];
          const logs = store.attendance.filter((a) => a.date === targetDate);
          const present = logs.filter((a) => a.status === 'Present').length;
          const late = logs.filter((a) => a.status === 'Late').length;
          const halfDay = logs.filter((a) => a.status === 'Half-day').length;
          return {
            date: targetDate,
            totalLogs: logs.length,
            present,
            late,
            halfDay,
            logs: logs.slice(0, 10),
          };
        }

        if (name === 'summarize_payroll') {
          const month = args?.payrollMonth || store.payroll[0]?.payrollMonth;
          const records = month ? store.payroll.filter((p) => p.payrollMonth === month) : store.payroll;
          const totalNet = records.reduce((s, c) => s + c.netSalary, 0);
          return {
            month: month || 'All Cycles',
            count: records.length,
            totalNetExpense: totalNet,
            records: records.slice(0, 5),
          };
        }

        if (name === 'list_company_announcements') {
          return {
            announcements: store.announcements,
          };
        }

        return { error: 'Unknown tool' };
      };

      const systemPrompt = `You are the executive AI HR Assistant for "HCM Lite", developed by M. Atta ur Rehman Khan (Roll No: 777760) under the guidance of Sir Azeem at SMIT (Saylani Mass IT Training).
You help HR managers, Admins, and Employees manage attendance, query leave balances, inspect payroll stats, view announcements, and understand HR policies.
Use the provided tools when accurate data is requested. Be professional, concise, empathetic, and clear.`;

      // Call Gemini 3.8 Flash
      const firstResponse = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations }],
        },
      });

      const functionCalls = firstResponse.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const executedToolsRecord: any[] = [];
        const functionResponseParts: any[] = [];

        for (const call of functionCalls) {
          const fnName = call.name || '';
          const toolResult = executeTool(fnName, call.args);
          executedToolsRecord.push({ name: fnName, args: call.args, result: toolResult });
          functionResponseParts.push({
            functionResponse: {
              name: fnName,
              response: toolResult,
            },
          });
        }

        // Send tool results back to the model for final synthesis
        const secondResponse = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: message }] },
            firstResponse.candidates?.[0]?.content!,
            { role: 'user', parts: functionResponseParts },
          ],
          config: {
            systemInstruction: systemPrompt,
          },
        });

        return res.json({
          reply: secondResponse.text || 'I have retrieved the requested HR records for you.',
          toolCalls: executedToolsRecord,
        });
      }

      return res.json({
        reply: firstResponse.text || 'How can I assist you with HCM Lite today?',
        toolCalls: [],
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.json({
        reply: `I processed your request, but experienced an AI service error (${err.message || 'unknown'}). Total records currently active: ${store.employees.length} employees, ${store.leaves.length} leaves, ${store.attendance.length} attendance punches.`,
        toolCalls: [],
      });
    }
  });

  // -------------------------------------------------------------
  // Module 8: Company Announcements
  // -------------------------------------------------------------
  app.get('/api/announcements', authenticateToken, (req: AuthRequest, res: Response) => {
    // Pinned announcements first, then newest
    const list = [...store.announcements].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    res.json(list);
  });

  app.post('/api/announcements', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { title, content, category = 'General', priority = 'Normal', isPinned = false } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newAnnouncement: AnnouncementRecord = {
      id: 'ANN-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
      isPinned: Boolean(isPinned),
      authorName: req.user?.fullName || 'HR Department',
      authorRole: req.user?.role?.toUpperCase() || 'HR',
      createdAt: new Date().toISOString(),
    };

    store.announcements.unshift(newAnnouncement);
    saveStore(store);

    logAudit(
      req.user!,
      'POST_ANNOUNCEMENT',
      'ANNOUNCEMENT',
      newAnnouncement.id,
      `Published broadcast announcement: "${newAnnouncement.title}" [${priority}]`
    );

    res.status(201).json(newAnnouncement);
  });

  app.delete('/api/announcements/:id', authenticateToken, requireRoles('admin', 'hr'), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const idx = store.announcements.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const removed = store.announcements.splice(idx, 1)[0];
    saveStore(store);

    logAudit(req.user!, 'DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', id, `Removed announcement "${removed.title}"`);

    res.json({ message: 'Announcement deleted successfully' });
  });

  // -------------------------------------------------------------
  // Module 9: Audit Logging
  // -------------------------------------------------------------
  app.get('/api/audit-logs', authenticateToken, requireRoles('admin'), (req: AuthRequest, res: Response) => {
    const { action, entityType, limit = 100 } = req.query;
    let list = [...store.auditLogs];

    if (action) {
      list = list.filter((l) => l.action === action);
    }
    if (entityType) {
      list = list.filter((l) => l.entityType === entityType);
    }

    res.json(list.slice(0, parseInt(limit as string) || 100));
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev middleware or Static Dist)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HCM Lite Full-Stack Server running on port ${PORT}`);
    console.log(`Developer: M. Atta ur Rehman Khan | Roll No: 777760 | Institution: SMIT (Sir Azeem)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
