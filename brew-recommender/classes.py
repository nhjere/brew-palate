from pydantic import BaseModel
from typing import List, Optional
import uuid;

class ReviewMinimalDTO(BaseModel):
    userId: uuid.UUID
    beerId: uuid.UUID
    overallEnjoyment: int
    flavorTags: List[str]

class Beer(BaseModel):
    beerId: uuid.UUID
    id: str
    name: str
    style: str
    abv: Optional[float]
    ibu: Optional[float]
    ounces: Optional[float]
    breweryId: Optional[str]
    flavorTags: List[str]