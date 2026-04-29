from pydantic import BaseModel
from typing import List, Optional
import uuid


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


class SurveyBeerDTO(BaseModel):
    surveyBeerId: uuid.UUID
    name: str
    style: Optional[str] = None
    styleFamily: Optional[str] = None
    abv: Optional[float] = None
    ibu: Optional[float] = None
    imageUrl: Optional[str] = None
    flavorTags: List[str] = []


class ComparisonSubmission(BaseModel):
    beerAId: uuid.UUID
    beerBId: uuid.UUID
    winnerId: uuid.UUID
    context: str = "survey"


class MatchupResponse(BaseModel):
    beerA: SurveyBeerDTO
    beerB: SurveyBeerDTO
