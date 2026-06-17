from pydantic import BaseModel
from typing import Optional, Literal

class CodingRunRequest(BaseModel):
    language: Literal["python", "java"]
    code: str
    stdin: Optional[str] = None

class CodingRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: Optional[int]
    timed_out: bool
