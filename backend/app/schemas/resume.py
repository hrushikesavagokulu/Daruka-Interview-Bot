from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    name: str
    file_path: str
    parse_status: str
    parsed_data: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
