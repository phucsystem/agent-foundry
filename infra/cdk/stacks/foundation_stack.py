"""Foundation stack: VPC, RDS PostgreSQL, Secrets Manager, S3 artifact bucket."""

import aws_cdk as cdk
from aws_cdk import (
    aws_ec2 as ec2,
    aws_rds as rds,
    aws_s3 as s3,
    aws_secretsmanager as secretsmanager,
    RemovalPolicy,
)
from constructs import Construct


class FoundationStack(cdk.Stack):
    """VPC + RDS + Secrets Manager + S3 for Agent Foundry."""

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        self.vpc = ec2.Vpc(
            self,
            "AgentFoundryVpc",
            max_azs=2,
            nat_gateways=0,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="Public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24,
                ),
                ec2.SubnetConfiguration(
                    name="Isolated",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24,
                ),
            ],
        )

        self.vpc.add_interface_endpoint(
            "SecretsManagerEndpoint",
            service=ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        )

        self.vpc.add_gateway_endpoint(
            "S3Endpoint",
            service=ec2.GatewayVpcEndpointAwsService.S3,
        )

        self.db_security_group = ec2.SecurityGroup(
            self,
            "DbSecurityGroup",
            vpc=self.vpc,
            description="Allow PostgreSQL access from Lambda and AgentCore",
            allow_all_outbound=True,
        )
        self.db_security_group.add_ingress_rule(
            ec2.Peer.ipv4(self.vpc.vpc_cidr_block),
            ec2.Port.tcp(5432),
            "PostgreSQL from VPC",
        )

        self.db_secret = secretsmanager.Secret(
            self,
            "DbCredentials",
            secret_name="agent-foundry/db-credentials",
            generate_secret_string=secretsmanager.SecretStringGenerator(
                secret_string_template='{"username": "agentfoundry"}',
                generate_string_key="password",
                exclude_punctuation=True,
                password_length=32,
            ),
        )

        self.database = rds.DatabaseInstance(
            self,
            "PostgresDb",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_16_4,
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE4_GRAVITON,
                ec2.InstanceSize.MICRO,
            ),
            vpc=self.vpc,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
            ),
            security_groups=[self.db_security_group],
            credentials=rds.Credentials.from_secret(self.db_secret),
            database_name="agentfoundry",
            allocated_storage=20,
            max_allocated_storage=50,
            multi_az=False,
            deletion_protection=False,
            removal_policy=RemovalPolicy.DESTROY,
            backup_retention=cdk.Duration.days(7),
        )

        self.artifact_bucket = s3.Bucket(
            self,
            "AgentArtifactBucket",
            bucket_name=f"agent-foundry-artifacts-{cdk.Aws.ACCOUNT_ID}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        secretsmanager.Secret(
            self,
            "SerperApiKey",
            secret_name="agent-foundry/serper-api-key",
            description="Serper API key for web search tool",
        )

        cdk.CfnOutput(self, "VpcId", value=self.vpc.vpc_id)
        cdk.CfnOutput(self, "DbEndpoint", value=self.database.db_instance_endpoint_address)
        cdk.CfnOutput(self, "ArtifactBucket", value=self.artifact_bucket.bucket_name)
        cdk.CfnOutput(self, "DbSecretArn", value=self.db_secret.secret_arn)
