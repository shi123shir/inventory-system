from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


# --- Product Schemas ---

class ProductCreate(BaseModel):
    """Used for POST /products - what the client sends"""
    name: str
    sku: str
    price: float
    quantity: int = 0

    @validator("price")
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be positive")
        return v

    @validator("quantity")
    def quantity_not_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductUpdate(BaseModel):
    """Used for PUT /products/{id} - all fields optional"""
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None


class ProductResponse(BaseModel):
    """Used for responses - what the API returns"""
    id: int
    name: str
    sku: str
    price: float
    quantity: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy model → Pydantic schema
