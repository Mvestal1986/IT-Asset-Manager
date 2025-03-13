from sqlalchemy.orm import Session
import models
import schemas

# Purchase CRUD operations
def get_purchase(db: Session, purchase_id: int):
    return db.query(models.Purchase).filter(models.Purchase.purchase_id == purchase_id).first()

def get_purchase_by_po(db: Session, purchase_order: str):
    return db.query(models.Purchase).filter(models.Purchase.purchase_order == purchase_order).first()

def get_purchases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Purchase).order_by(models.Purchase.purchase_date.desc()).offset(skip).limit(limit).all()

def create_purchase(db: Session, purchase: schemas.PurchaseCreate):
    db_purchase = models.Purchase(
        purchase_order=purchase.purchase_order,
        purchase_date=purchase.purchase_date,
        vendor=purchase.vendor,
        total_amount=purchase.total_amount,
        notes=purchase.notes
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

def update_purchase(db: Session, purchase_id: int, purchase: schemas.PurchaseUpdate):
    db_purchase = get_purchase(db, purchase_id)
    
    if purchase.purchase_order is not None:
        db_purchase.purchase_order = purchase.purchase_order
    if purchase.purchase_date is not None:
        db_purchase.purchase_date = purchase.purchase_date
    if purchase.vendor is not None:
        db_purchase.vendor = purchase.vendor
    if purchase.total_amount is not None:
        db_purchase.total_amount = purchase.total_amount
    if purchase.notes is not None:
        db_purchase.notes = purchase.notes
    
    db.commit()
    db.refresh(db_purchase)
    return db_purchase