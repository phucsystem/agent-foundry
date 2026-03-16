"""CDK app entry point for Agent Foundry infrastructure."""

import os

import aws_cdk as cdk

from stacks.foundation_stack import FoundationStack
from stacks.agentcore_stack import AgentCoreStack

app = cdk.App()

env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT"),
    region=os.getenv("CDK_DEFAULT_REGION", "us-east-1"),
)

foundation = FoundationStack(app, "FoundationStack", env=env)

AgentCoreStack(
    app,
    "AgentCoreStack",
    vpc=foundation.vpc,
    artifact_bucket=foundation.artifact_bucket,
    db_secret=foundation.db_secret,
    env=env,
)

app.synth()
