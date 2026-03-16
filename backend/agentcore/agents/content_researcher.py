"""Content Researcher agent — finds sources, competitor insights, trending angles."""

from crewai import Agent, LLM

from ..tools import create_web_search_tool, create_url_reader_tool

DEEPSEEK_MODEL = "bedrock/us.deepseek.r1-v1:0"


def create_researcher_agent(brand_context: str = "") -> Agent:
    """Create Content Researcher agent with web search tools.

    Uses DeepSeek V3 via Bedrock for cost-efficient factual extraction.
    """
    backstory = (
        "You are an expert content researcher with a keen eye for credible sources, "
        "trending angles, and competitor insights. You thoroughly research topics to "
        "provide comprehensive briefs that writers can use to create engaging content."
    )
    if brand_context:
        backstory += f"\n\nBrand context for this project:\n{brand_context}"

    return Agent(
        role="Content Researcher",
        goal=(
            "Research the given topic thoroughly. Find 5+ credible sources, "
            "identify trending angles, analyze competitor content, and compile "
            "a comprehensive research brief with key statistics and quotes."
        ),
        backstory=backstory,
        llm=LLM(model=DEEPSEEK_MODEL),
        tools=[create_web_search_tool(), create_url_reader_tool()],
        verbose=True,
        max_iter=10,
    )
