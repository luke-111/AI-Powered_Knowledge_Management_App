from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    modifiedAt: Optional[datetime] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    createdAt: datetime
    modifiedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
