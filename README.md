# HCM Lite &bull; AI-Assisted Human Resource Management System

A production-grade, complete, and enterprise-architected Human Capital Management (HCM Lite) platform featuring strict Role-Based Access Control (RBAC), multi-level leave approvals, digital punch clock attendance tracking, automated payroll calculations with instant PDF payslip generation, system-wide compliance audit logging, and an integrated Gemini 3.8 Flash AI HR Assistant with server-side tool calling.

---

## Developer & Institutional Credentials

- **Principal Software Architect & Developer:** M. Atta ur Rehman Khan
- **Roll Number:** 777760
- **Academy & Institution:** Saylani Mass IT Training (SMIT)
- **Course Instructor & Mentor:** Sir Azeem

### Mandatory Institutional Acknowledgment
> *"I am deeply thankful to my institution SMIT (Saylani Mass IT Training) and my instructor Sir Azeem, because of whom I am at this position today."*

---

## Key Architectural Principles

1. **Clean Empty Start (Zero Dummy Data on Fresh Launch):**
   - The platform begins in a pristine, unseeded state.
   - On the first run, the system opens the **Organization Setup Wizard** allowing the creation of the primary Super Administrator account.
   - For rapid assessment, an on-demand demo seeding mechanism is also accessible, while preserving clean slate compliance.

2. **Strict Server-Side Role-Based Access Control (RBAC):**
   - **Admin:** Master system controls, employee management, attendance overrides, leave approvals, payroll execution, announcements, and immutable audit logs.
   - **HR Specialist:** Employee directory management, CSV bulk import/export, leave reviews, attendance adjustments, and payroll processing.
   - **Employee:** Self-service digital punch clock, leave application submission, balance monitoring, payslip viewing and PDF download, company announcements board, and AI assistant self-queries.

3. **First-Sign-In Password Enforcement:**
   - Accounts provisioned by HR or Admin require mandatory first-login password changes before accessing the workspace.

4. **AI Assistant with Gemini 3.8 Flash Tool Calling:**
   - Real-time conversational agent capable of autonomously executing database tools:
     - `query_employee_leave_status`
     - `get_attendance_metrics`
     - `summarize_payroll`
     - `list_company_announcements`

---

## 9 Certified Modules & 25 Core Functionalities

### Module 1: Authentication & Session Management
- **01. Secure JWT Token Authentication:** High-entropy token exchange with 7-day expiration.
- **02. First-Sign-In Password Change Workflow:** Security compliance modal for provisioned accounts.
- **03. Role-Based Component & Route Guards:** Strict server and client-side privilege scoping.
- **04. User Profile & Credentials Management:** Personal info viewing and password updating.
- **05. Token Expiry & Session Invalidation:** Clean logout with security audit recording.

### Module 2: User & Employee Directory
- **06. Comprehensive Employee Profiles:** IDs (`EMP-1001`), salary grades, departments, designations.
- **07. Profile CRUD Operations:** Full management with data sanitization and email uniqueness.
- **08. Account Deactivation & Archival:** Admin-restricted employee removal with audit trail.
- **09. CSV Directory Export:** One-click CSV export of active directory records.
- **10. Bulk CSV Import Engine:** Column parser with error detection and automated user provisioning.

### Module 3: Attendance Management
- **11. Digital Punch Clock:** Live ticking system clock with instant Check-In and Check-Out.
- **12. Shift Classifier:** Automated categorization into On-Time, Late (post 09:30 AM), and Half-Day (< 4h).
- **13. Attendance Ledger Table:** Date and department filtering with calculated working hours.
- **14. Administrative Shift Adjustment:** HR override tool with mandatory reason logging.

### Module 4: Leave Management
- **15. Multi-Category Leave Applications:** Annual, Casual, Medical/Sick, and Unpaid leaves.
- **16. Real-Time Leave Quota Tracking:** Visual balance bars and automated limit enforcement.
- **17. Multi-Tier Review Workflow:** Pending requests reviewable by HR/Admin with approval notes.
- **18. Automatic Quota Deduction:** Instant deduction of days upon application approval.

### Module 5: Payroll & Compensation Engine
- **19. Payroll Cycle Execution Engine:** Select any cycle month (e.g. `2026-10`) to compute gross, allowances, progressive tax, and 5% provident fund.
- **20. Automated Payslip PDF Generator:** Instant client-side PDF compilation via `jsPDF` with company header, earnings, deductions, net pay in numbers and words, and authorized signature lines.
- **21. Historical Payslips Ledger:** Search and reprint past salary statements.

### Module 6: Executive Dashboards & KPIs
- **22. Real-Time Workforce Metrics:** Total employees, today's attendance rate, pending leaves, and monthly payroll expenditure.
- **23. Department Headcount Analytics:** Visual distribution bars across corporate divisions.

### Module 7: AI HR Assistant (Gemini 3.8 Flash)
- **24. Server-Side Function Calling:** Live LLM chat invoking backend tools to query leaves, attendance, and payroll metrics directly.

### Module 8: Company Announcements
- **25. Broadcast Bulletins:** Prioritized company-wide notices (Normal, Important, Urgent) with top pinning and category tagging.

### Module 9: Compliance Audit Trail
- **26. Immutable System Audit Log:** Timestamped event ledger recording Actor, Action, Entity, and Details.

---

## Tech Stack

### Web Client & Application Server
- **Frontend Framework:** React 19 + TypeScript + Vite 8
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Modern Clean Slate Theme (Light/Dark)
- **PDF Engine:** jsPDF with corporate styling and institutional watermarks
- **Dev & API Server:** Node.js Express server running `tsx server.ts` mounted with Vite SPA middleware
- **AI Integration:** `@google/genai` (v2.4.0) with model `gemini-3.8-flash`

### Python FastAPI Codebase (`/backend`)
- **Web Framework:** FastAPI (Python 3.10+)
- **ORM & Database:** SQLAlchemy with SQLite / PostgreSQL support
- **Data Validation:** Pydantic v2
- **Auth:** python-jose (JWT) + passlib (bcrypt)

---

## Setup & Running Instructions

### Running the Live Applet (Vite + Express)
The applet dev server runs on port 3000:
```bash
# Install dependencies
npm install

# Start full-stack server
npm run dev
```
Open `http://localhost:3000` in your browser.

### Running the Python FastAPI Backend (Alternative Standalone)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

---

## Institutional Dedication

Special thanks to **Saylani Mass IT Training (SMIT)** and **Sir Azeem** for fostering technical excellence, professional software architecture standards, and dedicated mentorship.
