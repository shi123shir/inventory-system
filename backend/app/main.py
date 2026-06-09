from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routes import products, customers, orders

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for managing products, customers, and orders",
    version="1.0.0"
)

# CORS - allows the React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Inventory API is running"}

@app.get("/dashboard", tags=["Dashboard"])
def dashboard_summary():
    """Returns aggregated counts for the frontend dashboard."""
    from app.core.database import SessionLocal
    from app.models.product import Product
    from app.models.customer import Customer
    from app.models.order import Order
    db = SessionLocal()
    try:
        total_products = db.query(Product).count()
        total_customers = db.query(Customer).count()
        total_orders = db.query(Order).count()
        low_stock = db.query(Product).filter(Product.quantity <= 5).all()
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": [
                {"id": p.id, "name": p.name, "quantity": p.quantity}
                for p in low_stock
            ]
        }
    finally:
        db.close()
