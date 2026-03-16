"""Content Editor crew — sequential orchestration of research, write, edit, repurpose."""

import json
import logging
import re

from crewai import Crew, Task, Process

from ..agents import (
    create_researcher_agent,
    create_writer_agent,
    create_editor_agent,
    create_repurposer_agent,
)
from ..models import ContentTaskInput, ContentOutput, SocialVariant, TokenUsage

logger = logging.getLogger(__name__)


def _parse_social_variants(raw_output: str) -> list[SocialVariant]:
    """Extract social variants from repurposer output."""
    variants = []
    platforms = ["linkedin", "twitter", "instagram", "facebook", "email"]

    for platform in platforms:
        pattern = rf"(?i)\*?\*?{platform}\*?\*?[:\s]+(.*?)(?=(?:\*?\*?(?:{'|'.join(platforms)})\*?\*?[:\s])|$)"
        match = re.search(pattern, raw_output, re.DOTALL)
        if match:
            content = match.group(1).strip()
            hashtags = re.findall(r"#\w+", content)
            variants.append(
                SocialVariant(
                    platform=platform,
                    content=content[:2200],
                    hashtags=hashtags[:10],
                    character_count=len(content),
                )
            )

    return variants


def _parse_metadata(edited_output: str) -> dict:
    """Extract title, slug, meta_description, keywords from edited output."""
    metadata = {
        "title": "",
        "slug": "",
        "meta_description": "",
        "keywords": [],
        "content": edited_output,
    }

    title_match = re.search(r"^#\s+(.+)$", edited_output, re.MULTILINE)
    if title_match:
        metadata["title"] = title_match.group(1).strip()

    slug_match = re.search(r"(?i)slug[:\s]+(.+?)$", edited_output, re.MULTILINE)
    if slug_match:
        metadata["slug"] = slug_match.group(1).strip().lower().replace(" ", "-")[:80]

    meta_match = re.search(r"(?i)meta[_ ]description[:\s]+(.+?)$", edited_output, re.MULTILINE)
    if meta_match:
        metadata["meta_description"] = meta_match.group(1).strip()[:160]

    keywords_match = re.search(r"(?i)keywords?[:\s]+(.+?)$", edited_output, re.MULTILINE)
    if keywords_match:
        raw_keywords = keywords_match.group(1).strip()
        metadata["keywords"] = [kw.strip() for kw in raw_keywords.split(",") if kw.strip()]

    return metadata


def run_content_crew(task_input: ContentTaskInput, brand_context: str = "") -> ContentOutput:
    """Run the full content generation crew.

    Sequential process: research -> outline+draft -> edit -> repurpose
    """
    researcher = create_researcher_agent(brand_context)
    writer = create_writer_agent(brand_context)
    editor = create_editor_agent(brand_context)
    repurposer = create_repurposer_agent(brand_context)

    keywords_str = ", ".join(task_input.keywords) if task_input.keywords else "none specified"
    competitor_str = ", ".join(task_input.competitor_urls) if task_input.competitor_urls else "none"

    research_task = Task(
        description=(
            f"Research the topic: '{task_input.topic}'\n"
            f"Content type: {task_input.content_type}\n"
            f"Target keywords: {keywords_str}\n"
            f"Competitor URLs to analyze: {competitor_str}\n"
            f"Additional context: {task_input.additional_context or 'none'}\n\n"
            "Deliver a comprehensive research brief with:\n"
            "- 5+ credible sources with URLs\n"
            "- Key statistics and data points\n"
            "- Competitor content analysis\n"
            "- Trending angles and unique hooks\n"
            "- Target audience insights"
        ),
        expected_output="A detailed research brief with sources, statistics, and insights",
        agent=researcher,
    )

    writing_task = Task(
        description=(
            f"Using the research brief, write a {task_input.content_type} article "
            f"of approximately {task_input.target_word_count} words on: '{task_input.topic}'\n\n"
            "Requirements:\n"
            "- Compelling headline/title\n"
            "- Engaging introduction with a hook\n"
            "- Well-structured body with H2/H3 headings\n"
            "- Data points from the research brief\n"
            "- Actionable conclusion with CTA\n"
            "- Write in markdown format"
        ),
        expected_output="A complete article in markdown format",
        agent=writer,
        context=[research_task],
    )

    editing_task = Task(
        description=(
            "Edit and polish the article. At the end, include metadata:\n"
            "- Title: (compelling, SEO-friendly)\n"
            "- Slug: (url-friendly version of title)\n"
            "- Meta Description: (under 160 characters, includes primary keyword)\n"
            "- Keywords: (comma-separated list of 5-10 keywords)\n\n"
            "Check for:\n"
            "1. Brand voice consistency\n"
            "2. Grammar, spelling, punctuation\n"
            "3. SEO: keywords in headings, meta description\n"
            "4. Factual claims are sourced\n"
            "5. Readability and flow"
        ),
        expected_output="Polished article in markdown with title, slug, meta_description, keywords metadata",
        agent=editor,
        context=[writing_task],
    )

    repurpose_task = Task(
        description=(
            "Repurpose the edited article into social media variants:\n"
            "1. LinkedIn post (professional, 1300 chars max)\n"
            "2. Twitter/X thread (3-5 tweets, 280 chars each)\n"
            "3. Instagram caption (engaging, relevant hashtags)\n"
            "4. Facebook post (conversational, 500 chars)\n"
            "5. Email newsletter excerpt (subject line + preview text)\n\n"
            "Label each variant clearly with the platform name."
        ),
        expected_output="5 platform-specific content variants labeled by platform",
        agent=repurposer,
        context=[editing_task],
    )

    crew = Crew(
        agents=[researcher, writer, editor, repurposer],
        tasks=[research_task, writing_task, editing_task, repurpose_task],
        process=Process.sequential,
        verbose=True,
    )

    logger.info("Starting content crew for topic: %s", task_input.topic[:50])
    result = crew.kickoff()

    edited_output = editing_task.output.raw if editing_task.output else ""
    repurpose_output = result.raw if result else ""

    metadata = _parse_metadata(edited_output)
    social_variants = _parse_social_variants(repurpose_output)

    token_usage_data = result.token_usage if hasattr(result, "token_usage") else {}
    total_input = getattr(token_usage_data, "prompt_tokens", 0) if token_usage_data else 0
    total_output = getattr(token_usage_data, "completion_tokens", 0) if token_usage_data else 0

    if not metadata["title"]:
        metadata["title"] = task_input.topic
    if not metadata["slug"]:
        metadata["slug"] = task_input.topic.lower().replace(" ", "-")[:80]

    return ContentOutput(
        title=metadata["title"],
        slug=metadata["slug"],
        meta_description=metadata.get("meta_description", ""),
        content=metadata.get("content", edited_output),
        keywords=metadata.get("keywords", task_input.keywords),
        publish_ready=False,  # quality scorer determines this
        quality_score=0.0,  # filled by quality scorer
        social_variants=social_variants,
        token_usage=TokenUsage(input_tokens=total_input, output_tokens=total_output),
        cost_usd=0.0,  # calculated after token usage
    )
