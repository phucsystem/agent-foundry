"""AgentCore Runtime invoker — boto3 wrapper for agent invocation."""

import json
import logging

import boto3

from gateway.config import settings

logger = logging.getLogger(__name__)


class AgentCoreInvoker:
    """Invoke Content Editor agent on AgentCore Runtime."""

    def __init__(self) -> None:
        self._client = boto3.client("bedrock-agentcore", region_name=settings.aws_region)

    def invoke_content_agent(
        self,
        task_id: str,
        topic: str,
        brand_config_id: str,
        user_id: str,
        content_type: str = "blog",
        target_word_count: int = 2000,
        keywords: list[str] | None = None,
        competitor_urls: list[str] | None = None,
        additional_context: str | None = None,
    ) -> dict:
        """Invoke the content editor agent synchronously.

        For MVP: synchronous invocation (Lambda timeout 5 min).
        Post-MVP: switch to async with callback.
        """
        payload = {
            "prompt": topic,
            "context": {
                "brand_config_id": brand_config_id,
                "user_id": user_id,
                "content_type": content_type,
                "target_word_count": target_word_count,
                "keywords": keywords or [],
                "competitor_urls": competitor_urls or [],
                "additional_context": additional_context,
                "session_id": f"task-{task_id}",
            },
        }

        logger.info("Invoking AgentCore Runtime: task=%s, topic=%s", task_id, topic[:50])

        response = self._client.invoke_agent_runtime(
            agentRuntimeArn=settings.agentcore_runtime_arn,
            runtimeSessionId=f"task-{task_id}",
            payload=json.dumps(payload).encode(),
        )

        result = json.loads(response["payload"].read())
        logger.info("AgentCore response received: success=%s", result.get("success"))
        return result


agentcore_invoker = AgentCoreInvoker()
