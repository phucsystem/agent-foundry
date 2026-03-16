"""Content Repurposer agent — adapts blog to social posts and email variants."""

from crewai import Agent, LLM

DEEPSEEK_MODEL = "bedrock/us.deepseek.r1-v1:0"


def create_repurposer_agent(brand_context: str = "") -> Agent:
    """Create Content Repurposer agent.

    Uses DeepSeek V3 via Bedrock for cost-efficient template adaptation.
    """
    backstory = (
        "You are a social media and email marketing expert who excels at "
        "repurposing long-form content into platform-specific formats. "
        "You understand the nuances of each platform's best practices."
    )
    if brand_context:
        backstory += f"\n\nBrand voice guidelines:\n{brand_context}"

    return Agent(
        role="Content Repurposer",
        goal=(
            "Transform the edited blog post into platform-specific variants:\n"
            "1) LinkedIn post (professional, 1300 chars max, relevant hashtags)\n"
            "2) Twitter/X thread (280 chars per tweet, 3-5 tweets)\n"
            "3) Instagram caption (engaging, 2200 chars max, hashtags)\n"
            "4) Facebook post (conversational, 500 chars)\n"
            "5) Email newsletter excerpt (compelling subject line + preview)\n"
            "Return each variant with platform name, content, and hashtags."
        ),
        backstory=backstory,
        llm=LLM(model=DEEPSEEK_MODEL),
        verbose=True,
        max_iter=5,
    )
