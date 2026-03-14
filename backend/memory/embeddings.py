"""Embedding generation via LiteLLM proxy."""

import logging
import os

import litellm

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL", "http://litellm.localhost/v1")


class EmbeddingService:
    """Generate text embeddings via the LiteLLM proxy."""

    async def embed(self, text: str) -> list[float]:
        """Generate embedding vector for a single text string."""
        try:
            response = await litellm.aembedding(
                model=EMBEDDING_MODEL,
                input=[text],
                api_base=LITELLM_BASE_URL,
            )
            return response.data[0]["embedding"]
        except Exception as error:
            logger.error("Embedding failed for text (len=%d): %s", len(text), error)
            raise

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for multiple texts in one request."""
        if not texts:
            return []
        try:
            response = await litellm.aembedding(
                model=EMBEDDING_MODEL,
                input=texts,
                api_base=LITELLM_BASE_URL,
            )
            return [item["embedding"] for item in response.data]
        except Exception as error:
            logger.error("Batch embedding failed (count=%d): %s", len(texts), error)
            raise


embedding_service = EmbeddingService()
