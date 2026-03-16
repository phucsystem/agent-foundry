"""Quality scorer — LLM-as-Judge using Haiku via Bedrock."""

import json
import logging
import os

import boto3

from ..models.brand_voice import BrandVoiceConfig
from ..models.quality_score import QualityScore

logger = logging.getLogger(__name__)

HAIKU_MODEL = "anthropic.claude-3-5-haiku-20241022-v1:0"

QUALITY_RUBRIC_PROMPT = """You are a content quality assessor. Score the following article on 5 dimensions (0.0 to 1.0 each):

1. **clarity** - Is the writing clear, well-structured, and easy to follow?
2. **data_accuracy** - Are claims supported by data? Are sources credible?
3. **brand_voice** - Does the writing match the specified brand voice guidelines?
4. **seo_optimization** - Are keywords used naturally? Is the title/meta SEO-friendly?
5. **engagement** - Is the content compelling? Does it have a strong hook and CTA?

Brand voice guidelines:
{brand_context}

Article to evaluate:
{content}

Respond ONLY with a JSON object (no markdown, no explanation):
{{"clarity": 0.0, "data_accuracy": 0.0, "brand_voice": 0.0, "seo_optimization": 0.0, "engagement": 0.0}}"""


class QualityScorer:
    """Score content quality using LLM-as-Judge pattern."""

    def __init__(self) -> None:
        self._region = os.environ.get("AWS_REGION", "us-east-1")
        self._client = boto3.client("bedrock-runtime", region_name=self._region)

    def score(self, content: str, brand_config: BrandVoiceConfig) -> QualityScore:
        """Score content against quality rubric using Haiku."""
        prompt = QUALITY_RUBRIC_PROMPT.format(
            brand_context=brand_config.to_prompt_context(),
            content=content[:8000],  # Limit content to avoid token overflow
        )

        try:
            response = self._client.invoke_model(
                modelId=HAIKU_MODEL,
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 200,
                    "temperature": 0.1,
                    "messages": [{"role": "user", "content": prompt}],
                }),
            )

            result = json.loads(response["body"].read())
            response_text = result["content"][0]["text"]

            scores = json.loads(response_text)
            quality = QualityScore(**scores)
            quality.compute_weighted_total()

            logger.info(
                "Quality score: %.2f (clarity=%.2f, accuracy=%.2f, voice=%.2f, seo=%.2f, engage=%.2f)",
                quality.weighted_total,
                quality.clarity,
                quality.data_accuracy,
                quality.brand_voice,
                quality.seo_optimization,
                quality.engagement,
            )

            return quality

        except Exception as error:
            logger.error("Quality scoring failed: %s", error)
            return QualityScore()
