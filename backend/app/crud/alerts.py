from sqlalchemy.orm import Session
from app.models.alerts import Alert, AlertType, AlertSeverity
from app.schema.alerts import AlertCreate, AlertUpdate, AlertFilter
from typing import List, Optional

def create_alert(db: Session, alert: AlertCreate, user_id: Optional[str] = None) -> Alert:
    db_alert = Alert(
        type=alert.type,
        severity=alert.severity,
        message=alert.message,
        chemical_id=alert.chemical_id,
        user_id=user_id
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_alerts(db: Session, skip: int = 0, limit: int = 100, filters: Optional[AlertFilter] = None) -> List[Alert]:
    query = db.query(Alert)
    
    # Apply filters
    if filters:
        if filters.type:
            query = query.filter(Alert.type == filters.type)
        if filters.severity:
            query = query.filter(Alert.severity == filters.severity)
        if filters.is_read is not None:
            query = query.filter(Alert.is_read == filters.is_read)
        if filters.is_dismissed is not None:
            query = query.filter(Alert.is_dismissed == filters.is_dismissed)
        if filters.chemical_id:
            query = query.filter(Alert.chemical_id == filters.chemical_id)
    
    return query.order_by(Alert.timestamp.desc()).offset(skip).limit(limit).all()

def get_alert(db: Session, alert_id: int) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == alert_id).first()

def update_alert(db: Session, alert_id: int, alert_update: AlertUpdate) -> Optional[Alert]:
    db_alert = get_alert(db, alert_id)
    if db_alert:
        update_data = alert_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_alert, field, value)
        db.commit()
        db.refresh(db_alert)
    return db_alert

def delete_alert(db: Session, alert_id: int) -> bool:
    db_alert = get_alert(db, alert_id)
    if not db_alert:
        return False
    db.delete(db_alert)
    db.commit()
    return True

def dismiss_alert(db: Session, alert_id: int) -> Optional[Alert]:
    return update_alert(db, alert_id, AlertUpdate(is_dismissed=True))

def mark_alert_read(db: Session, alert_id: int) -> Optional[Alert]:
    return update_alert(db, alert_id, AlertUpdate(is_read=True))

def get_unread_alerts(db: Session) -> List[Alert]:
    return db.query(Alert).filter(Alert.is_read == False).order_by(Alert.timestamp.desc()).all()

def get_active_alerts(db: Session) -> List[Alert]:
    return db.query(Alert).filter(Alert.is_dismissed == False).order_by(Alert.timestamp.desc()).all()

def get_alerts_by_chemical(db: Session, chemical_id: int) -> List[Alert]:
    return db.query(Alert).filter(Alert.chemical_id == chemical_id).order_by(Alert.timestamp.desc()).all()

def get_alerts_by_type(db: Session, alert_type: AlertType) -> List[Alert]:
    return db.query(Alert).filter(Alert.type == alert_type).order_by(Alert.timestamp.desc()).all()

def get_alerts_by_severity(db: Session, severity: AlertSeverity) -> List[Alert]:
    return db.query(Alert).filter(Alert.severity == severity).order_by(Alert.timestamp.desc()).all()

def create_low_stock_alert(db: Session, chemical_id: int, chemical_name: str, quantity: float, unit: str, threshold: float) -> Alert:
    alert = AlertCreate(
        type=AlertType.LOW_STOCK,
        severity=AlertSeverity.WARNING,
        message=f"Low stock alert: {chemical_name} has only {quantity} {unit} remaining (threshold: {threshold} {unit})",
        chemical_id=chemical_id
    )
    return create_alert(db, alert)

def create_out_of_stock_alert(db: Session, chemical_id: int, chemical_name: str) -> Alert:
    alert = AlertCreate(
        type=AlertType.OUT_OF_STOCK,
        severity=AlertSeverity.CRITICAL,
        message=f"Out of stock: {chemical_name} is completely depleted",
        chemical_id=chemical_id
    )
    return create_alert(db, alert) 