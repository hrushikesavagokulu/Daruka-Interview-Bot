"""
Daruka Interview Bot — Authentication Router
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email import send_otp_email
from app.core.security import (
    create_access_token,
    delete_otp,
    generate_otp,
    get_otp,
    hash_password,
    store_otp,
    verify_password,
    verify_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    OTPVerifyRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()
security_scheme = HTTPBearer(auto_error=False)


# ─── Dependencies ─────────────────────────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency to authenticate the user using JWT.
    Decodes the token, checks the token type, and verifies the user is active in the database.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure this is an access token, not a temporary login OTP token
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return user


# ─── Auth Endpoints ───────────────────────────────────────────────────────────
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user as inactive and sends a 6-digit OTP code to their email.
    """
    # Check if the email already exists
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password and create the user
    hashed_password = hash_password(payload.password)
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hashed_password,
        role="candidate",
        is_active=0,  # Starts inactive, set to 0 explicitly
    )
    db.add(new_user)
    await db.commit()

    # Generate and store OTP in Redis
    otp = generate_otp()
    await store_otp(payload.email, otp)

    # Send the OTP via email/console
    await send_otp_email(payload.email, otp)

    return {"message": "User registered successfully. Verification OTP has been sent."}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Verifies the registration OTP, activates the user, and returns a JWT access token.
    """
    stored_otp = await get_otp(payload.email)
    if not stored_otp or stored_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Activate user
    user.is_active = 1
    await db.commit()

    # Clean up Redis OTP
    await delete_otp(payload.email)

    # Generate the access token
    access_token = create_access_token(data={"sub": user.email, "type": "access"})
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Validates user credentials, generates a login OTP, and returns a temporary token.
    """
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate and store OTP in Redis
    otp = generate_otp()
    await store_otp(payload.email, otp)

    # Send OTP
    await send_otp_email(payload.email, otp)

    # Create temporary token (10 minutes expiry)
    temp_token = create_access_token(
        data={"sub": user.email, "type": "temp"},
        expires_delta=timedelta(minutes=10),
    )
    return TokenResponse(access_token=temp_token)


@router.post("/verify-login-otp", response_model=TokenResponse)
async def verify_login_otp(
    payload: OTPVerifyRequest, db: AsyncSession = Depends(get_db)
):
    """
    Verifies the login OTP and returns the final JWT access token.
    """
    stored_otp = await get_otp(payload.email)
    if not stored_otp or stored_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please complete registration verification first.",
        )

    # Clean up Redis OTP
    await delete_otp(payload.email)

    # Generate the final access token
    access_token = create_access_token(data={"sub": user.email, "type": "access"})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile information of the currently authenticated user.
    """
    return current_user
