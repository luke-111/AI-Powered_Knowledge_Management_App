import logging

from fastapi import HTTPException
from google import genai
from google.genai import types

from app.core.config import get_settings

settings = get_settings()

KNOWLEDGE_ASSISTANT_PROMPT = (
    "You are an assistant helping knowledge workers capture concise, structured knowledge."
)

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self) -> None:
        if not settings.google_api_key:
            raise RuntimeError("Google API key not found. Please set GOOGLE_API_KEY in your environment.")

        self.client = genai.Client(api_key=settings.google_api_key)
        self.text_model = settings.google_completion_model
        self.embedding_model = settings.google_embedding_model

    def _extract_text(self, result) -> str:
        if not result:
            return ""

        if hasattr(result, "text") and callable(getattr(result, "text")):
            text_value = result.text()
            if text_value:
                return text_value.strip()

        if hasattr(result, "text") and isinstance(result.text, str):
            return result.text.strip()

        candidate = getattr(result, "candidates", None)
        if candidate:
            parts = candidate[0].content.parts if hasattr(candidate[0], "content") else None
            if parts:
                merged = "".join([getattr(part, "text", "") for part in parts]).strip()
                if merged:
                    return merged
        return ""

    def generate_content(self, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.text_model,
                contents=[KNOWLEDGE_ASSISTANT_PROMPT, prompt],
            )
            text = self._extract_text(response)
            if not text:
                raise ValueError("No text returned from Google Generative AI.")
            return text
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("AI content generation failed")
            raise HTTPException(status_code=500, detail="Failed to generate content from Google Generative AI service.") from exc

    def summarize_content(self, title: str, content: str) -> str:
        prompt = (
            "Summarize the following knowledge entry in 3-4 concise bullet points.\n\n"
            f"Title: {title}\n"
            f"Content:\n{content}\n\n"
            "Focus on actionable ideas and key takeaways."
        )
        return self.generate_content(prompt)

    def _parse_embedding(self, response) -> list[float] | None:
        embedding = getattr(response, "embedding", None)
        if embedding is not None:
            values = getattr(embedding, "values", None)
            if values:
                return [float(value) for value in values]

        raw_values = getattr(response, "values", None)
        if raw_values:
            return [float(value) for value in raw_values]

        if isinstance(response, dict):
            embed_payload = response.get("embedding") or response.get("values")
            if embed_payload:
                values = embed_payload.get("values") if isinstance(embed_payload, dict) else embed_payload
                if values:
                    return [float(value) for value in values]

        return None

    def generate_embedding(self, text: str) -> list[float]:
        try:
            response = self.client.models.embed_content(
                model=self.embedding_model,
                contents=text,
            )
            vector = self._parse_embedding(response)
            if vector is None:
                logger.warning("Embedding response did not include values; returning empty vector")
                return []
            return vector
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("AI embedding generation failed")
            raise HTTPException(status_code=500, detail="Failed to generate embedding from Google Generative AI service.") from exc


ai_service = AIService()
