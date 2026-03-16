"""Gateway configuration via Pydantic Settings."""

from pydantic_settings import BaseSettings


class GatewaySettings(BaseSettings):
    """Gateway environment configuration."""

    database_url: str = "postgresql://agentfoundry:changeme@localhost:5432/agentfoundry"
    logto_endpoint: str = "https://pk5k15.logto.app"
    logto_app_id: str = ""
    logto_api_resource: str = "http://localhost:8000"
    agentcore_runtime_arn: str = ""
    aws_region: str = "us-east-1"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    mock_auth: bool = True
    frontend_url: str = "http://localhost:3000"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "", "case_sensitive": False}


settings = GatewaySettings()
