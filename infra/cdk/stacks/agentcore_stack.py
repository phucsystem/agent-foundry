"""AgentCore stack: Runtime, Memory, IAM roles for agent execution."""

import aws_cdk as cdk
from aws_cdk import (
    aws_ec2 as ec2,
    aws_iam as iam,
    aws_s3 as s3,
    aws_secretsmanager as secretsmanager,
)
from constructs import Construct

try:
    from aws_cdk import aws_bedrock_agentcore_alpha as agentcore
    HAS_AGENTCORE_CDK = True
except ImportError:
    HAS_AGENTCORE_CDK = False


class AgentCoreStack(cdk.Stack):
    """AgentCore Runtime + Memory for Content Editor agent."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        vpc: ec2.IVpc,
        artifact_bucket: s3.IBucket,
        db_secret: secretsmanager.ISecret,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.execution_role = iam.Role(
            self,
            "AgentCoreExecutionRole",
            role_name="agent-foundry-agentcore-execution",
            assumed_by=iam.CompositePrincipal(
                iam.ServicePrincipal("bedrock-agentcore.amazonaws.com"),
                iam.ServicePrincipal("lambda.amazonaws.com"),
            ),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AWSLambdaVPCAccessExecutionRole"
                ),
            ],
        )

        self.execution_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream",
                ],
                resources=[
                    f"arn:aws:bedrock:{cdk.Aws.REGION}::foundation-model/anthropic.*",
                    f"arn:aws:bedrock:{cdk.Aws.REGION}::foundation-model/us.deepseek.*",
                ],
            )
        )

        self.execution_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "bedrock-agentcore:InvokeAgentRuntime",
                    "bedrock-agentcore:CreateMemory",
                    "bedrock-agentcore:GetMemory",
                    "bedrock-agentcore:CreateEvent",
                    "bedrock-agentcore:RetrieveMemories",
                ],
                resources=["*"],
            )
        )

        artifact_bucket.grant_read(self.execution_role)
        db_secret.grant_read(self.execution_role)

        serper_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "SerperSecret", "agent-foundry/serper-api-key"
        )
        serper_secret.grant_read(self.execution_role)

        if HAS_AGENTCORE_CDK:
            self.runtime = agentcore.AgentCoreRuntime(
                self,
                "ContentEditorRuntime",
                name="content-editor-agent",
                artifact_source=agentcore.CodeArtifactSource.from_s3(
                    bucket=artifact_bucket.bucket_name,
                    key="content-editor/agent-code.zip",
                ),
                runtime=agentcore.Runtime.PYTHON_3_13,
                entry_point="main",
                role=self.execution_role,
            )

            self.memory = agentcore.Memory(
                self,
                "ContentEditorMemory",
                memory_type=agentcore.MemoryType.MANAGED,
                strategies=[agentcore.MemoryStrategy.summary()],
            )

            self.runtime.add_memory(self.memory)

            cdk.CfnOutput(self, "RuntimeArn", value=self.runtime.runtime_arn)
        else:
            cdk.CfnOutput(
                self,
                "RuntimeArn",
                value="PLACEHOLDER-install-aws-cdk.aws-bedrock-agentcore-alpha",
            )

        cdk.CfnOutput(self, "ExecutionRoleArn", value=self.execution_role.role_arn)
