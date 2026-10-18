"""
Supabase JWT auth for user-scoped endpoints.

Tokens are verified like the Spring Boot backend does: ES256 signatures checked
against the project's public JWKS (SUPABASE_URL/auth/v1/.well-known/jwks.json).
"""
import os
from dataclasses import dataclass

import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException
from jwt import PyJWKClient

load_dotenv()

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not set; it's required to verify user tokens")

_ISSUER = f"{SUPABASE_URL}/auth/v1"
_jwks = PyJWKClient(f"{_ISSUER}/.well-known/jwks.json", cache_keys=True, lifespan=3600)


@dataclass
class AuthUser:
    user_id: str
    token: str  # forwarded to the backend on calls made for this user


def get_current_user(authorization: str | None = Header(default=None)) -> AuthUser:
    """FastAPI dependency: verify the Bearer token and return its user. 401 if invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[len("Bearer "):]
    try:
        key = _jwks.get_signing_key_from_jwt(token).key
        claims = jwt.decode(token, key, algorithms=["ES256"], audience="authenticated", issuer=_ISSUER)
    except (jwt.PyJWTError, jwt.PyJWKClientError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return AuthUser(user_id=claims["sub"], token=token)


def require_same_user(path_user_id, auth: AuthUser) -> None:
    """403 unless the {user_id} in the path belongs to the caller."""
    if str(path_user_id) != auth.user_id:
        raise HTTPException(status_code=403, detail="Not allowed to access another user's data")


def debug_endpoints_enabled() -> None:
    """FastAPI dependency: 404 unless ENABLE_DEBUG_ENDPOINTS=true (off in production)."""
    if os.getenv("ENABLE_DEBUG_ENDPOINTS", "").lower() != "true":
        raise HTTPException(status_code=404, detail="Not Found")
