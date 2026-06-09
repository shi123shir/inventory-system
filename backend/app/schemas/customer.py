from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CustomerCreate(BaseModel):
    full_name: str
    email: str  # Would use EmailStr in production with email-validator installed
    phone: str


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
