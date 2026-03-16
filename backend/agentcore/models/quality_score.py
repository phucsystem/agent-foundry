"""Quality scoring model for LLM-as-Judge evaluation."""

from pydantic import BaseModel, Field

QUALITY_WEIGHTS = {
    "clarity": 0.20,
    "data_accuracy": 0.20,
    "brand_voice": 0.25,
    "seo_optimization": 0.15,
    "engagement": 0.20,
}


class QualityScore(BaseModel):
    """Quality assessment from LLM-as-Judge."""

    clarity: float = Field(default=0.0, ge=0.0, le=1.0)
    data_accuracy: float = Field(default=0.0, ge=0.0, le=1.0)
    brand_voice: float = Field(default=0.0, ge=0.0, le=1.0)
    seo_optimization: float = Field(default=0.0, ge=0.0, le=1.0)
    engagement: float = Field(default=0.0, ge=0.0, le=1.0)
    weighted_total: float = Field(default=0.0, ge=0.0, le=1.0)

    def compute_weighted_total(self) -> float:
        """Calculate weighted total from individual dimensions."""
        total = (
            self.clarity * QUALITY_WEIGHTS["clarity"]
            + self.data_accuracy * QUALITY_WEIGHTS["data_accuracy"]
            + self.brand_voice * QUALITY_WEIGHTS["brand_voice"]
            + self.seo_optimization * QUALITY_WEIGHTS["seo_optimization"]
            + self.engagement * QUALITY_WEIGHTS["engagement"]
        )
        self.weighted_total = round(total, 3)
        return self.weighted_total

    @property
    def is_publish_ready(self) -> bool:
        return self.weighted_total >= 0.7
