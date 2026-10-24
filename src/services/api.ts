const BASE_URL = '';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('hcm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errMessage = 'An unexpected server error occurred';
    try {
      const data = await res.json();
      if (data && data.error) errMessage = data.error;
      else if (data && data.detail) errMessage = data.detail;
    } catch {
      errMessage = res.statusText || errMessage;
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // System
  async getSystemStatus() {
    const res = await fetch(`${BASE_URL}/api/system/status`);
    return handleResponse(res);
  },
  async setupFirstAdmin(data: { fullName: string; email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/api/system/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async seedDemo() {
    const res = await fetch(`${BASE_URL}/api/system/seed-demo`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
  async resetDatabase() {
    const res = await fetch(`${BASE_URL}/api/system/reset-clean`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },
  async getMe() {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async changePassword(data: { newPassword: string; currentPassword?: string }) {
    const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Employees
  async getEmployees(params?: { search?: string; department?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.status) query.append('status', params.status);
    const res = await fetch(`${BASE_URL}/api/employees?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async createEmployee(data: any) {
    const res = await fetch(`${BASE_URL}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async updateEmployee(id: string, data: any) {
    const res = await fetch(`${BASE_URL}/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async updateEmployeeSecurity(id: string, data: { newPassword: string; currentPassword?: string }) {
    const res = await fetch(`${BASE_URL}/api/employees/${id}/security`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteEmployee(id: string) {
    const res = await fetch(`${BASE_URL}/api/employees/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async bulkImportEmployees(employees: any[]) {
    const res = await fetch(`${BASE_URL}/api/employees/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ employees }),
    });
    return handleResponse(res);
  },

  // Attendance
  async getAttendance(params?: { date?: string; employeeId?: string; department?: string }) {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.department) query.append('department', params.department);
    const res = await fetch(`${BASE_URL}/api/attendance?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async getTodayAttendance() {
    const res = await fetch(`${BASE_URL}/api/attendance/today`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async checkIn() {
    const res = await fetch(`${BASE_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async checkOut() {
    const res = await fetch(`${BASE_URL}/api/attendance/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async adjustAttendance(data: any) {
    const res = await fetch(`${BASE_URL}/api/attendance/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Leaves
  async getLeaves(params?: { status?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    const res = await fetch(`${BASE_URL}/api/leaves?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async applyLeave(data: { leaveType: string; startDate: string; endDate: string; reason: string }) {
    const res = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async reviewLeave(id: string, data: { status: 'Approved' | 'Rejected'; reviewComment?: string }) {
    const res = await fetch(`${BASE_URL}/api/leaves/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Payroll
  async getPayroll(params?: { month?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.month) query.append('month', params.month);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    const res = await fetch(`${BASE_URL}/api/payroll?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async runPayroll(payrollMonth: string) {
    const res = await fetch(`${BASE_URL}/api/payroll/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ payrollMonth }),
    });
    return handleResponse(res);
  },

  // Announcements
  async getAnnouncements() {
    const res = await fetch(`${BASE_URL}/api/announcements`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async postAnnouncement(data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    isPinned: boolean;
  }) {
    const res = await fetch(`${BASE_URL}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async deleteAnnouncement(id: string) {
    const res = await fetch(`${BASE_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Audit Logs
  async getAuditLogs(params?: { action?: string; entityType?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${BASE_URL}/api/audit-logs?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // AI Assistant
  async askAIAssistant(message: string, conversationHistory?: any[]) {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, conversationHistory }),
    });
    return handleResponse(res);
  },
};
