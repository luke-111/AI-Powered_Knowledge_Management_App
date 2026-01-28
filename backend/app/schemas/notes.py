from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    title: str
    content: str
    category: Optional[int] = Field(default=None)
    archived: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[int] = Field(default=None)
    archived: Optional[bool] = None
    modifiedAt: Optional[datetime] = None


class CategoryInNote(BaseModel):
    id: int
    name: str
    createdAt: datetime
    modifiedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    category: Optional[int] = None
    Category: Optional[CategoryInNote] = None
    archived: bool
    createdAt: datetime
    modifiedAt: Optional[datetime] = None
    similarityScore: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
