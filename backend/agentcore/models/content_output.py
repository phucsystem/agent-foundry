"""Output models for content generation tasks."""

from typing import Literal

from pydantic import BaseModel, Field


class TokenUsage(BaseModel):
    """Token usage breakdown."""

    input_tokens: int = 0
    output_tokens: int = 0

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


class SocialVariant(BaseModel):
    """Social media content variant."""

    platform: Literal["linkedin", "twitter", "instagram", "facebook", "email"]
    content: str
    hashtags: list[str] = Field(default_factory=list)
    character_count: int = 0


class ContentOutput(BaseModel):
    """Structured output from content generation crew."""

    title: str
    slug: str = Field(max_length=80)
    meta_description: str = Field(max_length=160)
    content: str  # Markdown
    keywords: list[str] = Field(default_factory=list)
    publish_ready: bool = False
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    social_variants: list[SocialVariant] = Field(default_factory=list)
    token_usage: TokenUsage = Field(default_factory=TokenUsage)
    cost_usd: float = Field(default=0.0, ge=0.0)
