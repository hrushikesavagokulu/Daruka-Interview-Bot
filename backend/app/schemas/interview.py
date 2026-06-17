from pydantic import BaseModel
from typing import Literal

class SessionStartRequest(BaseModel):
    resume_id: int
    role: str
    experience: Literal["junior", "mid", "senior"]

class SessionStartResponse(BaseModel):
    session_id: int
