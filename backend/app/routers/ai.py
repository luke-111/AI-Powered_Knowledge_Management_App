from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_roles
from app.services.ai import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate", dependencies=[Depends(require_roles(["USER"]))])
def generate(body: dict):
    prompt = (body or {}).get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="'prompt' is required in the request body.")

    generated_text = ai_service.generate_content(prompt)
    return {"status": "success", "payload": {"content": generated_text}}
