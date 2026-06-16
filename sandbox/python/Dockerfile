# ─── Python Sandbox Dockerfile ───────────────
# Minimal, locked-down execution environment.
# NO external pip packages — stdlib only.
# Run with: --network none --memory 256m --cpus 0.5
#           --ulimit nproc=50 --read-only --tmpfs /tmp:size=50m
# ─────────────────────────────────────────────
FROM python:3.11-slim

# Create non-root sandbox user (UID 1001)
RUN useradd -m -u 1001 sandbox

USER sandbox
WORKDIR /code

# No packages installed — standard library only for security
