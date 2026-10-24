from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FirstAdminSetup(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    current_password: Optional[str] = None
    new_password: str

class LeaveBalanceSchema(BaseModel):
    annual: int = 14
    casual: int = 10
    sick: int = 8

class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    department: str
    designation: str
    salary_grade: Optional[str] = "L2-Associate"
    base_salary: Optional[float] = 50000.0
    date_of_joining: Optional[str] = None
    phone: Optional[str] = ""
    address: Optional[str] = ""
    role: Optional[str] = "employee"
    default_password: Optional[str] = "Password123!"

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    salary_grade: Optional[str] = None
    base_salary: Optional[float] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None

class AttendanceCheckIn(BaseModel):
    notes: Optional[str] = None

class AttendanceAdjustment(BaseModel):
    employee_id: str
    date: str
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class LeaveApply(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: str

class LeaveReview(BaseModel):
    status: str # Approved, Rejected
    review_comment: Optional[str] = None

class PayrollRunRequest(BaseModel):
    payroll_month: str # YYYY-MM

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    priority: Optional[str] = "Normal"
    is_pinned: Optional[bool] = False

class AIChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []
