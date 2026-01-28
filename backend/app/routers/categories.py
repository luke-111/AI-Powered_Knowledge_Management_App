from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models.db_models import Category, Note
from app.schemas.categories import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.notes import NoteResponse

router = APIRouter(prefix="/categories", tags=["categories"])


def _category_response(category: Category, include_notes: bool = False) -> dict:
    payload = CategoryResponse.model_validate(category).model_dump()
    if include_notes and category.notes:
        payload["Notes"] = [NoteResponse.model_validate(note).model_dump() for note in category.notes]
    return payload


@router.get("/", dependencies=[Depends(require_roles(["USER"]))])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    payload = [_category_response(cat) for cat in categories]
    return {"status": "success", "payload": payload}


@router.get("/{category_id}", dependencies=[Depends(require_roles(["USER"]))])
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with ID {category_id} not found")
    return {"status": "success", "payload": _category_response(category, include_notes=True)}


@router.post("/", dependencies=[Depends(require_roles(["USER"]))])
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Name is required and must be a non-empty string")

    category = Category(name=payload.name.strip(), createdAt=datetime.utcnow())
    db.add(category)
    db.commit()
    db.refresh(category)

    return {"status": "success", "payload": _category_response(category)}


@router.patch("/{category_id}", dependencies=[Depends(require_roles(["USER"]))])
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with ID {category_id} not found")

    if payload.name is not None:
        if not payload.name.strip():
            raise HTTPException(status_code=400, detail="Name must be a non-empty string")
        category.name = payload.name.strip()
        category.modifiedAt = datetime.utcnow()

    db.commit()
    db.refresh(category)
    return {"status": "success", "payload": _category_response(category)}


@router.delete("/{category_id}", dependencies=[Depends(require_roles(["USER"]))])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with ID {category_id} not found")

    db.query(Note).filter(Note.category_id == category_id).update({"category_id": None})
    db.delete(category)
    db.commit()

    return {"status": "success", "payload": _category_response(category)}
