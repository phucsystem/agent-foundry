"""AgentCore entrypoint for Content Editor agent."""

import logging
import uuid

from bedrock_agentcore import BedrockAgentCoreApp

from models import ContentTaskInput, ContentOutput
from crews import run_content_crew
from services import BrandVoiceLoader, QualityScorer, MemoryManager

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = BedrockAgentCoreApp()

brand_loader = BrandVoiceLoader()
quality_scorer = QualityScorer()
memory_manager = MemoryManager()


@app.entrypoint
def invoke(payload: dict, context: dict | None = None) -> dict:
    """Content Editor agent entrypoint.

    Args:
        payload: {"prompt": str, "context": {"brand_config_id": str, "user_id": str, ...}}
        context: Optional AgentCore runtime context

    Returns:
        ContentOutput as dict
    """
    prompt = payload.get("prompt", "")
    task_context = payload.get("context", {})
    brand_config_id = task_context.get("brand_config_id", "")
    user_id = task_context.get("user_id", "")
    session_id = task_context.get("session_id", str(uuid.uuid4()))

    logger.info("Content Editor invoked: topic=%s, brand=%s, user=%s", prompt[:50], brand_config_id, user_id)

    try:
        brand_config = brand_loader.load(brand_config_id)
    except Exception as error:
        logger.warning("Brand config load failed, using default: %s", error)
        brand_config = brand_loader.get_default()

    past_context = memory_manager.retrieve_brand_context(user_id)
    brand_context = brand_config.to_prompt_context()
    if past_context:
        brand_context += "\n\nPrevious session insights:\n"
        for memory in past_context[:3]:
            fact = memory.get("fact", "")
            if fact:
                brand_context += f"- {fact}\n"

    task_input = ContentTaskInput(
        topic=prompt,
        content_type=task_context.get("content_type", "blog"),
        brand_config_id=brand_config_id,
        user_id=user_id,
        target_word_count=task_context.get("target_word_count", 2000),
        keywords=task_context.get("keywords", []),
        competitor_urls=task_context.get("competitor_urls", []),
        additional_context=task_context.get("additional_context"),
    )

    output = run_content_crew(task_input, brand_context)

    quality = quality_scorer.score(output.content, brand_config)
    output.quality_score = quality.weighted_total
    output.publish_ready = quality.is_publish_ready

    memory_manager.store_session_summary(
        user_id=user_id,
        session_id=session_id,
        content_type=task_input.content_type,
        quality_score=quality.weighted_total,
        topic=prompt,
    )

    result = output.model_dump()
    result["success"] = True
    result["quality_details"] = quality.model_dump()

    logger.info(
        "Content generation complete: title=%s, quality=%.2f, publish_ready=%s",
        output.title[:50],
        quality.weighted_total,
        output.publish_ready,
    )

    return result


if __name__ == "__main__":
    app.run()
