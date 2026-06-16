# ─── Java Sandbox Dockerfile ─────────────────
# Minimal, locked-down Java execution environment.
# Run with: --network none --memory 256m --cpus 0.5
#           --ulimit nproc=50 --read-only --tmpfs /tmp:size=50m
# ─────────────────────────────────────────────
FROM openjdk:21-jdk-slim

# Create non-root sandbox user (UID 1001)
RUN useradd -m -u 1001 sandbox

USER sandbox
WORKDIR /code
