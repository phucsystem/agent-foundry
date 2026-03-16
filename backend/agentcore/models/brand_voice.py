"""Brand voice configuration model."""

from pydantic import BaseModel, Field


class BrandVoiceConfig(BaseModel):
    """Brand voice configuration loaded from RDS (stored as YAML)."""

    name: str
    core_values: list[str] = Field(default_factory=list)
    tone: str = "professional"
    audience: str = "general"
    avoid_words: list[str] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    sentence_length_avg: int = Field(default=15, ge=5, le=40)

    def to_prompt_context(self) -> str:
        """Format brand voice as system prompt injection."""
        sections = [
            f"Brand: {self.name}",
            f"Tone: {self.tone}",
            f"Target Audience: {self.audience}",
        ]
        if self.core_values:
            sections.append(f"Core Values: {', '.join(self.core_values)}")
        if self.avoid_words:
            sections.append(f"Avoid these words/phrases: {', '.join(self.avoid_words)}")
        if self.examples:
            sections.append("Writing style examples:")
            for example in self.examples[:3]:
                sections.append(f"  - \"{example}\"")
        sections.append(f"Average sentence length: ~{self.sentence_length_avg} words")
        return "\n".join(sections)
