from fastapi import Header, HTTPException

from app.supabase_client import supabase


async def verify_supabase_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1].strip()

    try:
        response = supabase.auth.get_user(token)
        user = getattr(response, "user", None)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
