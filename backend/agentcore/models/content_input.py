"""Input model for content generation tasks."""

from typing import Literal

from pydantic import BaseModel, Field


class ContentTaskInput(BaseModel):
    """Input contract for content generation task."""

    topic: str = Field(..., min_length=3, max_length=500, description="Content topic or title")
    content_type: Literal["blog", "email", "social"] = Field(
        default="blog", description="Type of content to generate"
    )
    brand_config_id: str = Field(..., description="Brand voice configuration ID")
    user_id: str = Field(..., description="User ID for billing and memory")
    target_word_count: int = Field(default=2000, ge=200, le=10000)
    keywords: list[str] = Field(default_factory=list, max_length=20)
    competitor_urls: list[str] = Field(default_factory=list, max_length=5)
    additional_context: str | None = Field(
        default=None, max_length=2000, description="Extra instructions or context"
    )
