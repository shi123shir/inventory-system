from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Key business logic here:
    1. Validate customer exists
    2. Validate all products exist
    3. Check sufficient inventory for each product
    4. Deduct stock (atomic - all or nothing)
    5. Calculate total amount automatically
    6. Create the order
    """
    # Step 1: Validate customer
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    order_items_data = []

    # Step 2 & 3: Validate products and check inventory
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )

        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })
        total_amount += product.price * item.quantity  # Step 5: Auto-calculate total

    # Step 4: Deduct inventory (only after ALL validations pass — all-or-nothing)
    for item_data in order_items_data:
        item_data["product"].quantity -= item_data["quantity"]

    # Step 6: Create order record
    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing yet

    # Create order line items
    for item_data in order_items_data:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)

    db.commit()  # Single atomic commit - if anything fails, everything rolls back
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancelling an order restores the inventory"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock
    for item in order.items:
        item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return None
