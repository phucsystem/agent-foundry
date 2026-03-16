"""Brand voice loader — reads brand configs from RDS PostgreSQL."""

import logging
import os
import time

import psycopg2
import yaml

from ..models.brand_voice import BrandVoiceConfig

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 300  # 5 minutes


class BrandVoiceLoader:
    """Load and cache brand voice configurations from RDS."""

    def __init__(self) -> None:
        self._cache: dict[str, tuple[BrandVoiceConfig, float]] = {}
        self._db_url = os.environ.get("DATABASE_URL", "")

    def _get_connection(self):
        """Create database connection from DATABASE_URL or Secrets Manager."""
        if not self._db_url:
            raise ValueError("DATABASE_URL environment variable not set")
        return psycopg2.connect(self._db_url)

    def load(self, brand_config_id: str) -> BrandVoiceConfig:
        """Load brand voice config by ID, with in-memory caching."""
        cached = self._cache.get(brand_config_id)
        if cached:
            config, timestamp = cached
            if time.time() - timestamp < CACHE_TTL_SECONDS:
                logger.debug("Cache hit for brand config: %s", brand_config_id)
                return config

        logger.info("Loading brand config from RDS: %s", brand_config_id)
        connection = self._get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT name, voice_yaml FROM brand_configs WHERE id = %s",
                    (brand_config_id,),
                )
                row = cursor.fetchone()
                if not row:
                    raise ValueError(f"Brand config not found: {brand_config_id}")

                name, voice_yaml = row
                voice_data = yaml.safe_load(voice_yaml)
                voice_data["name"] = name
                config = BrandVoiceConfig(**voice_data)

                self._cache[brand_config_id] = (config, time.time())
                return config
        finally:
            connection.close()

    def get_default(self) -> BrandVoiceConfig:
        """Return a default brand voice config for testing."""
        return BrandVoiceConfig(
            name="Default",
            core_values=["clarity", "accuracy", "helpfulness"],
            tone="professional yet approachable",
            audience="business professionals",
            avoid_words=["synergy", "leverage", "disrupt"],
            examples=["Clear, data-driven insights for informed decisions."],
            sentence_length_avg=15,
        )
