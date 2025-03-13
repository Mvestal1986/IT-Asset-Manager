from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Purchase)
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    if purchase.purchase_order:
        db_purchase = crud.get_purchase_by_po(db, purchase_order=purchase.purchase_order)
        if db_purchase:
            raise HTTPException(status_code=400, detail="Purchase order already exists")
    return crud.create_purchase(db=db, purchase=purchase)

@router.get("/", response_model=List[schemas.Purchase])
def read_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    purchases = crud.get_purchases(db, skip=skip, limit=limit)
    return purchases

@router.get("/{purchase_id}", response_model=schemas.PurchaseDetail)
def read_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = crud.get_purchase(db, purchase_id=purchase_id)
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return db_purchase

@router.put("/{purchase_id}", response_model=schemas.Purchase)
def update_purchase(purchase_id: int, purchase: schemas.PurchaseUpdate, db: Session = Depends(get_db)):
    db_purchase = crud.get_purchase(db, purchase_id=purchase_id)
    if db_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    # Check if updated purchase order exists for another purchase
    if purchase.purchase_order is not None:
        db_purchase_by_po = crud.get_purchase_by_po(db, purchase_order=purchase.purchase_order)
        if db_purchase_by_po and db_purchase_by_po.purchase_id != purchase_id:
            raise HTTPException(status_code=400, detail="Purchase order already exists")
            
    return crud.update_purchase(db=db, purchase_id=purchase_id, purchase=purchase)