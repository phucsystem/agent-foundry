"""Content Writer agent — creates outlines and drafts with brand voice."""

from crewai import Agent, LLM

SONNET_MODEL = "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"


def create_writer_agent(brand_context: str = "") -> Agent:
    """Create Content Writer agent.

    Uses Sonnet via Bedrock for highest writing quality.
    """
    backstory = (
        "You are a skilled content writer who creates engaging, data-backed articles. "
        "You excel at structuring content with clear headings, compelling introductions, "
        "and actionable conclusions. You adapt your writing style to match brand voice."
    )
    if brand_context:
        backstory += f"\n\nBrand voice guidelines:\n{brand_context}"

    return Agent(
        role="Content Writer",
        goal=(
            "Create a well-structured, engaging article based on the research brief. "
            "Write with clear headings (H2, H3), include relevant data points, "
            "and maintain the specified brand voice throughout. Target the requested word count."
        ),
        backstory=backstory,
        llm=LLM(model=SONNET_MODEL),
        verbose=True,
        max_iter=5,
    )
