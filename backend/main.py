import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HCM Lite - Human Resource Management System",
    description="Backend API developed by M. Atta ur Rehman Khan (Roll No: 777760) under SMIT mentorship with Sir Azeem.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/system/status")
def system_status(db: Session = Depends(get_db)):
    admin_exists = db.query(models.User).filter(models.User.role == "admin").first() is not None
    user_count = db.query(models.User).count()
    emp_count = db.query(models.Employee).count()

    return {
        "initialized": admin_exists,
        "user_count": user_count,
        "employee_count": emp_count,
        "developer": "M. Atta ur Rehman Khan",
        "roll_no": "777760",
        "institution_acknowledgment": (
            "I am deeply thankful to my institution SMIT (Saylani Mass IT Training) "
            "and my instructor Sir Azeem, because of whom I am at this position today."
        ),
    }

@app.post("/api/system/setup-admin")
def setup_first_admin(payload: schemas.FirstAdminSetup, db: Session = Depends(get_db)):
    admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
    if admin_exists:
        raise HTTPException(status_code=400, detail="Initial administrator already exists")

    admin_user = models.User(
        id=f"USR-ADMIN-{int(os.times().system)}",
        email=payload.email.lower().strip(),
        password_hash=auth.get_password_hash(payload.password),
        full_name=payload.full_name.strip(),
        role="admin",
        is_first_sign_in=False,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    token = auth.create_access_token({
        "id": admin_user.id,
        "email": admin_user.email,
        "role": admin_user.role,
        "full_name": admin_user.full_name,
        "is_first_sign_in": False,
    })

    return {
        "message": "Admin user created successfully",
        "token": token,
        "user": {
            "id": admin_user.id,
            "email": admin_user.email,
            "full_name": admin_user.full_name,
            "role": admin_user.role,
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
