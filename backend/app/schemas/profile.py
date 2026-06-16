from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ProfileResponse(BaseModel):
    mobile: Optional[str] = None
    about: Optional[str] = None
    skills: List[str] = []
    years_experience: int = 0
    target_role: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    mobile: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[List[str]] = None
    years_experience: Optional[int] = None
    target_role: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
