"""
Database models and connection for PostgreSQL
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, JSON, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - can be set via environment variable or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/medilink"
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    icu_beds_available = Column(Integer, default=0)
    icu_beds_total = Column(Integer, default=0)
    has_trauma = Column(Boolean, default=False)
    blood_stock = Column(JSON, default={})  # Store as JSON: {"O+": 8, "O-": 3, ...}


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    blood_type = Column(String, nullable=False)
    photo = Column(String, nullable=True)
    medical_history = Column(JSON, default={})  # Store as JSON
    face_descriptor = Column(JSON, nullable=True)  # Store 128-d array as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("[database] Database tables created/verified")


def seed_initial_data(db: Session):
    """Seed database with initial demo data if tables are empty"""
    # Check if hospitals exist
    if db.query(Hospital).count() == 0:
        print("[database] Seeding initial hospitals...")
        hospitals_data = [
            {
                "id": 1,
                "name": "Rashid Hospital",
                "latitude": 25.2654,
                "longitude": 55.3089,
                "icu_beds_available": 12,
                "icu_beds_total": 20,
                "has_trauma": True,
                "blood_stock": {"O+": 8, "O-": 3, "A+": 5, "B+": 4, "AB+": 2}
            },
            {
                "id": 2,
                "name": "Dubai Hospital",
                "latitude": 25.2631,
                "longitude": 55.3376,
                "icu_beds_available": 8,
                "icu_beds_total": 15,
                "has_trauma": True,
                "blood_stock": {"O+": 6, "O-": 2, "A+": 7, "B+": 3, "AB+": 1}
            },
            {
                "id": 3,
                "name": "American Hospital",
                "latitude": 25.1571,
                "longitude": 55.2560,
                "icu_beds_available": 10,
                "icu_beds_total": 12,
                "has_trauma": False,
                "blood_stock": {"O+": 10, "O-": 5, "A+": 8, "B+": 6, "AB+": 3}
            },
            {
                "id": 4,
                "name": "Saudi German Hospital",
                "latitude": 25.1121,
                "longitude": 55.1389,
                "icu_beds_available": 5,
                "icu_beds_total": 18,
                "has_trauma": True,
                "blood_stock": {"O+": 4, "O-": 1, "A+": 3, "B+": 2, "AB+": 1}
            },
            {
                "id": 5,
                "name": "Mediclinic City",
                "latitude": 25.1865,
                "longitude": 55.2843,
                "icu_beds_available": 7,
                "icu_beds_total": 10,
                "has_trauma": False,
                "blood_stock": {"O+": 9, "O-": 4, "A+": 6, "B+": 5, "AB+": 2}
            }
        ]
        
        for h_data in hospitals_data:
            hospital = Hospital(**h_data)
            db.add(hospital)
        
        db.commit()
        print(f"[database] Seeded {len(hospitals_data)} hospitals")
    
    # Check if patients exist
    if db.query(Patient).count() == 0:
        print("[database] Seeding initial patients...")
        import numpy as np
        
        def generate_demo_descriptor(patient_id: int):
            np.random.seed(patient_id * 12345)
            return np.random.randn(128).tolist()
        
        patients_data = [
            {
                "id": 1,
                "name": "Rajesh Kumar",
                "age": 32,
                "blood_type": "B+",
                "photo": "patient1.jpg",
                "medical_history": {
                    "allergies": ["Penicillin", "Aspirin"],
                    "chronic_conditions": ["Hypertension"],
                    "medications": ["Lisinopril 10mg daily"],
                    "emergency_contact": {"name": "Priya Kumar", "phone": "+971-50-123-4567"},
                    "last_checkup": "2024-10-15"
                },
                "face_descriptor": generate_demo_descriptor(1)
            },
            {
                "id": 2,
                "name": "Fatima Ali",
                "age": 45,
                "blood_type": "O+",
                "photo": "patient2.jpg",
                "medical_history": {
                    "allergies": ["Latex"],
                    "chronic_conditions": ["Type 2 Diabetes"],
                    "medications": ["Metformin 500mg twice daily", "Insulin glargine"],
                    "emergency_contact": {"name": "Ahmed Ali", "phone": "+971-55-987-6543"},
                    "last_checkup": "2024-11-01"
                },
                "face_descriptor": generate_demo_descriptor(2)
            },
            {
                "id": 3,
                "name": "John Smith",
                "age": 28,
                "blood_type": "A+",
                "photo": "patient3.jpg",
                "medical_history": {
                    "allergies": [],
                    "chronic_conditions": [],
                    "medications": [],
                    "emergency_contact": {"name": "Sarah Smith", "phone": "+971-52-111-2222"},
                    "last_checkup": "2024-09-20"
                },
                "face_descriptor": generate_demo_descriptor(3)
            },
            {
                "id": 4,
                "name": "Demo Patient",
                "age": 30,
                "blood_type": "O+",
                "photo": "demo.jpg",
                "medical_history": {
                    "allergies": ["Iodine contrast", "Shellfish"],
                    "chronic_conditions": ["Asthma", "Mild Hypertension"],
                    "medications": ["Albuterol inhaler (as needed)", "Losartan 25mg daily"],
                    "emergency_contact": {"name": "Emergency Contact", "phone": "+971-50-999-8888"},
                    "last_checkup": "2024-11-15",
                    "recent_procedures": ["Chest X-ray (2024-10-10)"],
                    "vaccinations": ["COVID-19 (3 doses)", "Flu 2024"],
                    "blood_donor_status": "Regular donor (last: 2024-08-20)"
                },
                "face_descriptor": generate_demo_descriptor(4)
            }
        ]
        
        for p_data in patients_data:
            patient = Patient(**p_data)
            db.add(patient)
        
        db.commit()
        print(f"[database] Seeded {len(patients_data)} patients with face descriptors")

