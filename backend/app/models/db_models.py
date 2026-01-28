from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "Categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    modifiedAt = Column(DateTime, nullable=True)

    notes = relationship("Note", back_populates="category", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "Notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("Categories.id"), nullable=True)
    embedding = Column(JSON, nullable=True)
    archived = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    modifiedAt = Column(DateTime, nullable=True)

    category = relationship("Category", back_populates="notes")


class User(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False)
