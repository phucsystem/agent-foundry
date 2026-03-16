"""Content Editor agent — ensures brand voice, grammar, SEO consistency."""

from crewai import Agent, LLM

DEEPSEEK_MODEL = "bedrock/us.deepseek.r1-v1:0"


def create_editor_agent(brand_context: str = "") -> Agent:
    """Create Content Editor agent.

    Uses DeepSeek V3 via Bedrock for cost-efficient rule-following.
    """
    backstory = (
        "You are a meticulous content editor specializing in brand voice consistency, "
        "SEO optimization, and grammatical precision. You ensure every piece of content "
        "meets publication standards while maintaining the unique brand personality."
    )
    if brand_context:
        backstory += f"\n\nBrand voice guidelines to enforce:\n{brand_context}"

    return Agent(
        role="Content Editor",
        goal=(
            "Review and polish the draft article. Check for: "
            "1) Brand voice consistency, "
            "2) Grammar and spelling errors, "
            "3) SEO optimization (keywords in headings, meta description), "
            "4) Factual accuracy of claims, "
            "5) Readability and flow. "
            "Output the final polished article in markdown format with "
            "title, slug, meta_description, and keywords."
        ),
        backstory=backstory,
        llm=LLM(model=DEEPSEEK_MODEL),
        verbose=True,
        max_iter=5,
    )
