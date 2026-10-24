import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit3,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Lock,
  KeyRound,
  Shield,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Employee, Role } from '../../types';
import { useToast } from '../../context/ToastContext';

export const EmployeeDirectoryModule: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // View Layout: Table vs Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Edit Modal Active Tab
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'security'>('personal');

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'Software Engineering',
    designation: 'Software Engineer',
    salaryGrade: 'L3-Senior',
    baseSalary: 75000,
    dateOfJoining: new Date().toISOString().split('T')[0],
    phone: '',
    address: '',
    role: 'employee' as Role,
    status: 'active' as 'active' | 'on_leave' | 'terminated',
    defaultPassword: 'Password123!',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees({
        search,
        department: deptFilter,
        status: statusFilter,
      });
      setEmployees(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter]);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  // Sorting
  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortBy === 'name') {
      const cmp = a.fullName.localeCompare(b.fullName);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    if (sortBy === 'salary') {
      return sortOrder === 'asc' ? a.baseSalary - b.baseSalary : b.baseSalary - a.baseSalary;
    }
    if (sortBy === 'date') {
      const cmp = a.dateOfJoining.localeCompare(b.dateOfJoining);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    return 0;
  });

  // Filter by role if selected
  const filteredEmployees = roleFilter
    ? sortedEmployees.filter((e) => e.role === roleFilter)
    : sortedEmployees;

  // Pagination slice
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAddEmployee = () => {
    setEditingEmp(null);
    setFormData({
      fullName: '',
      email: '',
      department: 'Software Engineering',
      designation: 'Associate Engineer',
      salaryGrade: 'L2-Associate',
      baseSalary: 60000,
      dateOfJoining: new Date().toISOString().split('T')[0],
      phone: '',
      address: '',
      role: 'employee',
      status: 'active',
      defaultPassword: 'Password123!',
    });
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setActiveTab('personal');
    setShowEditModal(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      salaryGrade: emp.salaryGrade,
      baseSalary: emp.baseSalary,
      dateOfJoining: emp.dateOfJoining,
      phone: emp.phone || '',
      address: emp.address || '',
      role: emp.role,
      status: emp.status,
      defaultPassword: '',
    });
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSecurityError(null);
    setActiveTab('personal');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      if (editingEmp) {
        await api.updateEmployee(editingEmp.id, formData);
        toast.success(`Profile for ${formData.fullName} updated successfully!`);
      } else {
        await api.createEmployee(formData);
        toast.success(`New employee ${formData.fullName} onboarded!`);
      }
      setShowEditModal(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save employee profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-[#146C43]' };
  };

  const pwdStrength = calculatePasswordStrength(securityData.newPassword);

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!editingEmp) {
      setSecurityError('Please save the employee profile first before changing security credentials.');
      return;
    }

    if (securityData.newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecuritySaving(true);
    try {
      await api.updateEmployeeSecurity(editingEmp.id, {
        newPassword: securityData.newPassword,
        currentPassword: securityData.currentPassword || undefined,
      });
      toast.success(`Security password updated for ${editingEmp.fullName}`);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowEditModal(false);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update security credentials');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate and remove ${name} (${id})?`)) {
      try {
        await api.deleteEmployee(id);
        toast.info(`Employee ${name} removed.`);
        fetchEmployees();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete employee');
      }
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      toast.warning('No employee records available to export.');
      return;
    }

    const headers = ['ID', 'Full Name', 'Email', 'Department', 'Designation', 'Salary Grade', 'Base Salary', 'Joining Date', 'Phone', 'Role', 'Status'];
    const rows = employees.map((e) => [
      e.id,
      `"${e.fullName}"`,
      e.email,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.salaryGrade,
      e.baseSalary,
      e.dateOfJoining,
      `"${e.phone}"`,
      e.role,
      e.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HCM_Lite_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Employee directory exported to CSV.');
  };

  const handleImportCSVSubmit = async () => {
    if (!csvRawText.trim()) {
      toast.warning('Please enter CSV data.');
      return;
    }

    setImportLoading(true);
    try {
      const lines = csvRawText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain a header row and at least one data row.');
      }

      const dataRows = lines.slice(1).map((line) => {
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        return {
          fullName: parts[0] || 'New Employee',
          email: parts[1] || `emp${Math.floor(Math.random() * 1000)}@company.com`,
          department: parts[2] || 'Operations',
          designation: parts[3] || 'Specialist',
          baseSalary: parseFloat(parts[4]) || 55000,
          phone: parts[5] || '',
        };
      });

      const res = await api.bulkImportEmployees(dataRows);
      toast.success(`Successfully imported ${res.successCount} employees!`);
      setShowImportModal(false);
      setCsvRawText('');
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process CSV file');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#146C43]/20 dark:border-[#D4AF37]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146C43] dark:bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Talent & Organization Management
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B3D2E] dark:text-white">
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active roster, employment records, role allocations, and security administration
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle (Table / Grid) */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#0B3D2E]/40 border border-slate-200 dark:border-[#146C43]/30 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-[#146C43] text-[#0B3D2E] dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 rounded-xl hover:bg-[#F5F8F5] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#146C43] dark:text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 rounded-xl hover:bg-[#F5F8F5] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={openAddEmployee}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] hover:opacity-95 border border-[#D4AF37]/30 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Onboard Employee</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter / Search & Sort Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 border border-[#146C43]/20 dark:border-[#D4AF37]/20 shadow-xs">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by full name, ID, or job title..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none focus:ring-1 focus:ring-[#146C43] dark:focus:ring-[#D4AF37]"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Executive Leadership">Executive Leadership</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-[#182B24] dark:text-[#F5F8F5] focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="salary">Sort by Salary</option>
            <option value="date">Sort by Joining</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#146C43]/30 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-600 dark:text-slate-300 hover:text-[#146C43]"
            title={`Toggle sort order (${sortOrder})`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Roster Container: Table or Cards */}
      <div className="border border-[#146C43]/20 dark:border-[#D4AF37]/20 rounded-2xl bg-white dark:bg-[#0B3D2E]/40 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-slate-300 border-t-[#146C43] rounded-full animate-spin" />
            <div className="text-xs font-mono">Synchronizing employee records...</div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#146C43]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center mx-auto text-[#146C43] dark:text-[#D4AF37]">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-base font-bold text-[#0B3D2E] dark:text-white">
              No Employees Found
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || deptFilter || statusFilter
                ? 'No staff records matched your search parameters. Try adjusting the filter criteria.'
                : 'Your organization currently has a clean empty state with zero employee profiles registered.'}
            </p>
            {canManage && (
              <div className="pt-2">
                <button
                  onClick={openAddEmployee}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Onboard First Employee</span>
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#146C43]/15 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#071F17] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Role & Department</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Base Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-[#F5F8F5]/80 dark:hover:bg-[#0B3D2E]/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0B3D2E] dark:bg-[#146C43] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#182B24] dark:text-[#F5F8F5]">{emp.fullName}</div>
                          <div className="text-[11px] font-mono text-[#D4AF37] font-semibold">{emp.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.designation}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{emp.email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.phone || 'No phone'}</div>
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#0B3D2E] dark:text-[#D4AF37]">
                      PKR {emp.baseSalary.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                          emp.status === 'active'
                            ? 'text-[#146C43] dark:text-emerald-400'
                            : emp.status === 'on_leave'
                            ? 'text-[#D4AF37]'
                            : 'text-rose-500'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmp(emp)}
                          title="View Profile Details"
                          className="p-1.5 text-slate-500 hover:text-[#146C43] dark:hover:text-[#D4AF37] rounded-lg hover:bg-slate-100 dark:hover:bg-[#071F17]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditEmployee(emp)}
                          title="Edit Profile & Security"
                          className="p-1.5 text-slate-500 hover:text-[#0B3D2E] dark:hover:text-[#D4AF37] rounded-lg hover:bg-slate-100 dark:hover:bg-[#071F17]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(emp.id, emp.fullName)}
                            title="Deactivate / Remove Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW */
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#F5F8F5]/60 dark:bg-[#071F17]/50 hover:border-[#146C43]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full">
                      {emp.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase font-mono ${emp.status === 'active' ? 'text-[#146C43]' : 'text-amber-500'}`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#182B24] dark:text-white truncate">
                        {emp.fullName}
                      </h4>
                      <p className="text-[11px] text-[#146C43] dark:text-[#D4AF37] font-medium truncate">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Salary:</span>
                      <span className="font-mono font-bold text-[#0B3D2E] dark:text-[#D4AF37]">
                        PKR {emp.baseSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {emp.role}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingEmp(emp)}
                      className="p-1 text-slate-500 hover:text-[#146C43] rounded"
                      title="View Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditEmployee(emp)}
                      className="p-1 text-slate-500 hover:text-[#0B3D2E] rounded"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredEmployees.length > itemsPerPage && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REDESIGNED "EDIT EMPLOYEE PROFILE" MODAL (PERSONAL, EMPLOYMENT, SECURITY) */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-[#F5F8F5] dark:bg-[#0B3D2E]/40 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-[#0B3D2E] dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>{editingEmp ? `Edit Profile &mdash; ${editingEmp.fullName}` : 'Onboard New Employee'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Organized administrative and security credentials console
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B3D2E]/20 px-5 pt-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'personal'
                    ? 'border-[#146C43] text-[#0B3D2E] dark:border-[#D4AF37] dark:text-[#D4AF37]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                1. Personal Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('employment')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'employment'
                    ? 'border-[#146C43] text-[#0B3D2E] dark:border-[#D4AF37] dark:text-[#D4AF37]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                2. Employment Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'border-[#146C43] text-[#0B3D2E] dark:border-[#D4AF37] dark:text-[#D4AF37]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>3. Account & Security</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {/* TAB 1: PERSONAL INFORMATION */}
              {activeTab === 'personal' && (
                <form onSubmit={(e) => { e.preventDefault(); setActiveTab('employment'); }} className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/30 text-slate-500 text-[11px] mb-2">
                    Enter the legal identity and primary contact records for this team member.
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Zain Ul Abideen"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Corporate Work Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        disabled={!!editingEmp && !canManage}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@organization.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address, city, province/state..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('employment')}
                      className="px-5 py-2 font-bold text-white bg-[#0B3D2E] dark:bg-[#146C43] rounded-xl hover:opacity-95"
                    >
                      Proceed to Employment &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: EMPLOYMENT DETAILS */}
              {activeTab === 'employment' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        disabled={!canManage}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] disabled:opacity-50"
                      >
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Executive Leadership">Executive Leadership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Official Designation
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!canManage}
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Base Salary (PKR)
                      </label>
                      <input
                        type="number"
                        required
                        disabled={!canManage}
                        value={formData.baseSalary}
                        onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono font-bold disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Salary Grade
                      </label>
                      <input
                        type="text"
                        disabled={!canManage}
                        value={formData.salaryGrade}
                        onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Employment Status
                      </label>
                      <select
                        disabled={!canManage}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned System Role
                      </label>
                      <select
                        disabled={user?.role !== 'admin'}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] disabled:opacity-50"
                      >
                        <option value="employee">Employee</option>
                        <option value="hr">HR Specialist</option>
                        {user?.role === 'admin' && <option value="admin">Administrator</option>}
                      </select>
                    </div>
                  </div>

                  {!canManage && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px]">
                      Salary and organizational designation fields can only be modified by authorized HR and System Administrators.
                    </div>
                  )}

                  <div className="pt-4 flex justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('personal')}
                      className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                    >
                      &larr; Back to Personal
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95 disabled:opacity-50 shadow-xs"
                      >
                        {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className="px-4 py-2 font-semibold text-[#146C43] dark:text-[#D4AF37] hover:underline"
                      >
                        Account Security &rarr;
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 3: ACCOUNT & SECURITY */}
              {activeTab === 'security' && (
                <form onSubmit={handleSaveSecurity} className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#F5F8F5] dark:bg-[#0B3D2E]/30 text-slate-600 dark:text-slate-300 text-[11px] flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <div>
                      <strong>Strict Security Isolation:</strong> Passwords are never transmitted in plaintext or displayed on screen. Updates are processed through secure server-side cryptographic hashing.
                    </div>
                  </div>

                  {securityError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{securityError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Login Email Identifier
                    </label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-mono text-slate-500"
                    />
                  </div>

                  {/* Current password (only required if changing own password) */}
                  {editingEmp && user?.employeeId === editingEmp.id && (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Password (Identity Verification)
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        placeholder="Verify current password"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17]"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        New Master Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-[#146C43] dark:text-[#D4AF37] font-semibold hover:underline"
                      >
                        {showPassword ? 'Hide Password' : 'Show Password'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                    />

                    {/* Password Strength Indicator */}
                    {securityData.newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Password Strength:</span>
                          <span className="font-bold">{pwdStrength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pwdStrength.color} transition-all duration-300`}
                            style={{ width: `${pwdStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071F17] font-mono"
                    />
                  </div>

                  <div className="pt-4 flex justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('employment')}
                      className="px-4 py-2 text-slate-600 rounded-xl hover:bg-slate-100"
                    >
                      &larr; Back to Employment
                    </button>
                    <button
                      type="submit"
                      disabled={securitySaving}
                      className="px-5 py-2 font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl hover:opacity-95 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{securitySaving ? 'Updating...' : 'Save Security Credentials'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-base">
                  {viewingEmp.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0B3D2E] dark:text-white">
                    {viewingEmp.fullName}
                  </h3>
                  <div className="text-[11px] text-[#146C43] dark:text-[#D4AF37] font-semibold">
                    {viewingEmp.designation} &bull; <span className="font-mono">{viewingEmp.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingEmp(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingEmp.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Salary Grade</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewingEmp.salaryGrade}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Base Salary</span>
                  <span className="font-mono font-bold text-[#0B3D2E] dark:text-[#D4AF37]">
                    PKR {viewingEmp.baseSalary.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Employment Status</span>
                  <span className="font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {viewingEmp.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Work Email</span>
                  <span className="text-slate-800 dark:text-slate-200">{viewingEmp.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{viewingEmp.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block text-[10px] uppercase">Leave Balances</span>
                <div className="flex gap-4 mt-1 font-mono font-bold">
                  <span>Annual: {viewingEmp.leaveBalance?.annual ?? 14}d</span>
                  <span>Casual: {viewingEmp.leaveBalance?.casual ?? 10}d</span>
                  <span>Sick: {viewingEmp.leaveBalance?.sick ?? 8}d</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setViewingEmp(null)}
                className="px-4 py-1.5 text-xs text-slate-600 rounded-xl hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingEmp;
                  setViewingEmp(null);
                  openEditEmployee(target);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B3D2E] dark:bg-[#146C43] rounded-xl hover:opacity-95"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#071F17] border border-[#146C43]/30 dark:border-[#D4AF37]/30 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#146C43] dark:text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-[#0B3D2E] dark:text-white">Bulk Employee CSV Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500 mt-2">
              Paste standard CSV rows below. Header columns must be: <br />
              <code className="text-[11px] font-mono text-[#0B3D2E] dark:text-[#D4AF37] font-semibold">
                fullName, email, department, designation, baseSalary, phone
              </code>
            </p>

            <textarea
              rows={6}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="fullName, email, department, designation, baseSalary, phone&#10;Muhammad Ali, ali@company.com, Software Engineering, Frontend Engineer, 90000, +923001112223"
              className="mt-3 w-full p-3 font-mono text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F5F8F5] dark:bg-[#0B3D2E]/20 text-slate-900 dark:text-slate-100 focus:outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSVSubmit}
                disabled={importLoading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B3D2E] to-[#146C43] rounded-xl disabled:opacity-50"
              >
                {importLoading ? 'Processing Rows...' : 'Execute Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
