from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import require_roles
from app.models.db_models import Category, Note
from app.schemas.notes import NoteCreate, NoteResponse, NoteUpdate
from app.services.ai import ai_service

router = APIRouter(prefix="/notes", tags=["notes"])


def _note_response(note: Note, similarity: Optional[float] = None) -> dict:
    response = NoteResponse.model_validate(note)
    if similarity is not None:
        response.similarityScore = round(similarity, 4)
    return response.model_dump()


def _get_note_or_404(note_id: int, db: Session) -> Note:
    note = db.query(Note).options(joinedload(Note.category)).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail=f"Note with ID {note_id} not found")
    return note


def _filter_notes(query, archived_value: Optional[str], category_value: Optional[str], db: Session):
    if archived_value is not None:
        normalized = archived_value.lower()
        if normalized in {"true", "false"}:
            query = query.filter(Note.archived.is_(normalized == "true"))

    if category_value is not None:
        if category_value == "-1":
            query = query.filter(Note.category_id.is_(None))
        else:
            try:
                category_id = int(category_value)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Invalid category value") from exc
            exists = db.query(Category).filter(Category.id == category_id).first()
            if not exists:
                return query.filter(False)  # yields empty result
            query = query.filter(Note.category_id == category_id)
    return query


@router.get("/", dependencies=[Depends(require_roles(["USER"]))])
def list_notes(
    archived: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Note).options(joinedload(Note.category))
    query = _filter_notes(query, archived, category, db)
    notes = query.all()
    return {"status": "success", "payload": [_note_response(note) for note in notes]}


@router.get("/{note_id}", dependencies=[Depends(require_roles(["USER"]))])
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = _get_note_or_404(note_id, db)
    return {"status": "success", "payload": _note_response(note)}


@router.post("/", dependencies=[Depends(require_roles(["USER"]))])
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title is required and must be a non-empty string")
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Content is required and must be a non-empty string")

    category_obj = None
    if payload.category is not None:
        category_obj = db.query(Category).filter(Category.id == payload.category).first()
        if not category_obj:
            raise HTTPException(status_code=400, detail="Category does not exist")

    embedding = ai_service.generate_embedding(f"{payload.title}\n\n{payload.content}")

    note = Note(
        title=payload.title.strip(),
        content=payload.content.strip(),
        category_id=payload.category,
        archived=payload.archived,
        createdAt=datetime.utcnow(),
        embedding=embedding,
    )
    if category_obj:
        note.category = category_obj
    db.add(note)
    db.commit()
    db.refresh(note)

    return {"status": "success", "payload": _note_response(note)}


@router.patch("/{note_id}", dependencies=[Depends(require_roles(["USER"]))])
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = _get_note_or_404(note_id, db)

    modified = False

    if payload.title is not None:
        if not payload.title.strip():
            raise HTTPException(status_code=400, detail="Title must be a non-empty string")
        note.title = payload.title.strip()
        modified = True

    if payload.content is not None:
        if not payload.content.strip():
            raise HTTPException(status_code=400, detail="Content must be a non-empty string")
        note.content = payload.content.strip()
        modified = True

    if payload.category is not None:
        category_obj = db.query(Category).filter(Category.id == payload.category).first()
        if not category_obj:
            raise HTTPException(status_code=400, detail="Category does not exist")
        note.category = category_obj
        note.category_id = category_obj.id
        modified = True

    if payload.archived is not None:
        note.archived = bool(payload.archived)
        modified = True

    if modified:
        note.modifiedAt = datetime.utcnow()

    if payload.title is not None or payload.content is not None:
        note.embedding = ai_service.generate_embedding(f"{note.title}\n\n{note.content}")

    db.commit()
    db.refresh(note)
    return {"status": "success", "payload": _note_response(note)}


@router.delete("/{note_id}", dependencies=[Depends(require_roles(["USER"]))])
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = _get_note_or_404(note_id, db)
    db.delete(note)
    db.commit()
    return {"status": "success", "payload": _note_response(note)}


def _cosine_similarity(vector_a: List[float], vector_b: List[float]) -> float:
    length = min(len(vector_a or []), len(vector_b or []))
    if length == 0:
        return 0.0

    dot_product = 0.0
    magnitude_a = 0.0
    magnitude_b = 0.0

    for i in range(length):
        a = vector_a[i]
        b = vector_b[i]
        dot_product += a * b
        magnitude_a += a * a
        magnitude_b += b * b

    denominator = (magnitude_a ** 0.5) * (magnitude_b ** 0.5)
    return 0.0 if denominator == 0 else dot_product / denominator


@router.post("/search", dependencies=[Depends(require_roles(["USER"]))])
def semantic_search(body: dict, db: Session = Depends(get_db)):
    query = (body or {}).get("query", "")
    if not isinstance(query, str) or not query.strip():
        return {"status": "success", "payload": []}

    query_embedding = ai_service.generate_embedding(query)

    notes = db.query(Note).options(joinedload(Note.category)).all()
    results = []

    for note in notes:
        embedding = note.embedding or []
        if not embedding:
            embedding = ai_service.generate_embedding(f"{note.title}\n\n{note.content}")
            note.embedding = embedding
            db.add(note)
        similarity = _cosine_similarity(query_embedding, embedding)
        results.append(_note_response(note, similarity))

    db.commit()

    sorted_results = sorted(results, key=lambda item: item.get("similarityScore", 0), reverse=True)[:10]
    return {"status": "success", "payload": sorted_results}


@router.post("/{note_id}/summarize", dependencies=[Depends(require_roles(["USER"]))])
def summarize(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail=f"Note with ID {note_id} not found")

    summary = ai_service.summarize_content(note.title, note.content)
    return {"status": "success", "payload": {"summary": summary}}
