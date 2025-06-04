from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict
from enum import Enum
from pydantic import BaseModel

class Direction(Enum):
    HORIZONTAL = "horizontal"
    VERTICAL = "vertical"

@dataclass
class WordPlacement:
    word: str
    start_row: int
    start_col: int
    direction: Direction
    clue: str = ""
    number: int = 0

@dataclass
class CrosswordGrid:
    grid: List[List[Optional[str]]]
    width: int
    height: int
    word_placements: List[WordPlacement]

class TopicRequest(BaseModel):
    topic: str

class WordListRequest(BaseModel):
    words: List[str]
    crossword_id: Optional[str] = None

class TopicWordsResponse(BaseModel):
    words: List[str]
    crossword_id: str

class CrosswordResponse(BaseModel):
    grid: List[List[Optional[str]]]
    word_placements: List[Dict]
    width: int
    height: int

class CluesResponse(BaseModel):
    clues: Dict[str, str]