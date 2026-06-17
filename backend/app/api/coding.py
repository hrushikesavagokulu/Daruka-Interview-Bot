from fastapi import APIRouter, Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.coding import CodingRunRequest, CodingRunResponse
from app.services.coding_service import run_code

router = APIRouter()

@router.post("/run", response_model=CodingRunResponse)
async def execute_coding_run(
    payload: CodingRunRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes user-supplied Python or Java code in a secure, resource-limited sandbox environment.
    """
    try:
        result = await run_code(
            language=payload.language,
            code=payload.code,
            stdin=payload.stdin
        )
        return result
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sandbox execution failed: {str(err)}"
        )
