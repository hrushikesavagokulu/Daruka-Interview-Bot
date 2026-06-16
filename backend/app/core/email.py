"""
Daruka Interview Bot — Async Email Utilities
"""
import logging
from email.message import EmailMessage
import aiosmtplib

from app.core.config import settings

logger = logging.getLogger("app.email")


async def send_otp_email(email: str, otp: str) -> None:
    """
    Sends a verification email with a 6-digit OTP.
    Falls back to console logs if SMTP credentials are not configured.
    """
    # ─── Developer Log / Stdout Fallback ──────────────────────────────────────
    border = "=" * 80
    otp_log_message = (
        f"\n{border}\n"
        f"  [DEVELOPER MAIL LOG]\n"
        f"  To: {email}\n"
        f"  Verification Code: {otp}\n"
        f"  Note: Copy this code to verify your signup or login.\n"
        f"{border}\n"
    )
    print(otp_log_message, flush=True)
    logger.info(f"Generated OTP code {otp} for {email}")

    # ─── SMTP Transmission ──────────────────────────────────────────────────
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.info("SMTP_USER or SMTP_PASS not set; skipping email transmission.")
        return

    message = EmailMessage()
    message["Subject"] = "Daruka Interview Bot — Verification OTP"
    message["From"] = settings.SMTP_USER
    message["To"] = email

    body = (
        f"Hello,\n\n"
        f"Your verification code for Daruka Interview Bot is: {otp}\n\n"
        f"This code is valid for 10 minutes.\n\n"
        f"If you did not make this request, please ignore this email.\n\n"
        f"Best regards,\n"
        f"Daruka Support Team"
    )
    message.set_content(body)

    try:
        # standard SMTP configuration settings
        use_tls = settings.SMTP_PORT == 465
        start_tls = settings.SMTP_PORT == 587 or settings.SMTP_PORT == 25

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            use_tls=use_tls,
            start_tls=start_tls,
        )
        logger.info(f"OTP verification email successfully sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send email to {email} via SMTP: {e}")
