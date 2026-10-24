from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="employee", nullable=False) # admin, hr, employee
    employee_id = Column(String, nullable=True)
    is_first_sign_in = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True) # e.g. EMP-1001
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    salary_grade = Column(String, default="L2-Associate")
    base_salary = Column(Float, default=50000.0)
    date_of_joining = Column(String, nullable=False)
    phone = Column(String, default="")
    address = Column(Text, default="")
    role = Column(String, default="employee")
    status = Column(String, default="active") # active, on_leave, terminated
    annual_leave_balance = Column(Integer, default=14)
    casual_leave_balance = Column(Integer, default=10)
    sick_leave_balance = Column(Integer, default=8)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False, index=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True) # YYYY-MM-DD
    check_in_time = Column(String, nullable=True) # HH:mm
    check_out_time = Column(String, nullable=True) # HH:mm
    total_hours = Column(Float, default=0.0)
    status = Column(String, default="Present") # Present, Late, Half-day, Absent
    notes = Column(Text, default="")
    adjusted_by = Column(String, nullable=True)

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False, index=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    leave_type = Column(String, nullable=False) # Annual, Casual, Sick, Unpaid
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    total_days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(String, nullable=True)
    review_comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(String, primary_key=True, index=True)
    payroll_month = Column(String, nullable=False, index=True) # YYYY-MM
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    base_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0.0)
    overtime_bonus = Column(Float, default=0.0)
    tax_deduction = Column(Float, default=0.0)
    provident_fund = Column(Float, default=0.0)
    other_deductions = Column(Float, default=0.0)
    net_salary = Column(Float, nullable=False)
    payment_status = Column(String, default="Processed")
    processed_at = Column(DateTime, default=datetime.utcnow)
    processed_by = Column(String, nullable=False)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="General") # Policy, Event, Alert, General
    priority = Column(String, default="Normal") # Normal, Important, Urgent
    is_pinned = Column(Boolean, default=False)
    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String, default="127.0.0.1")
