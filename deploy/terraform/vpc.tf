resource "aws_security_group" "ep_sg" {
  vpc_id = module.vpc.vpc_id
}

resource "aws_security_group_rule" "default_rule_ingress" {
  from_port         = 0
  protocol          = "-1"
  security_group_id = aws_security_group.ep_sg.id
  to_port           = 0
  type              = "ingress"
  cidr_blocks       = ["0.0.0.0/0"]
}
resource "aws_security_group_rule" "default_rule_egress" {
  from_port         = 0
  protocol          = "-1"
  security_group_id = aws_security_group.ep_sg.id
  to_port           = 0
  type              = "egress"
  cidr_blocks       = ["0.0.0.0/0"]
}

data "aws_availability_zones" "zones" {}
locals {
  azs = [sort(data.aws_availability_zones.zones.names)[0]]
}

module "vpc" {
  version            = "3.0.0"
  source             = "terraform-aws-modules/vpc/aws"
  #  source             = "../.terraform/modules/eks.vpc"
  name               = "main"
  azs                = local.azs
  cidr               = "10.0.0.0/16"
  public_subnets     = ["10.0.1.0/24"]
  enable_nat_gateway = false
  single_nat_gateway = true

  # Amazon ECS tasks using the Fargate launch type and platform version 1.3.0 or earlier only require
  # the com.amazonaws.region.ecr.dkr Amazon ECR VPC endpoint and the Amazon S3 gateway endpoints.
  #
  # Amazon ECS tasks using the Fargate launch type and platform version 1.4.0 or later require both
  # the com.amazonaws.region.ecr.dkr and com.amazonaws.region.ecr.api Amazon ECR VPC endpoints and
  # the Amazon S3 gateway endpoints.
  #
  # For more details, please visit the https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html

  # enable dns support
  enable_dns_hostnames = true
  enable_dns_support   = true
}

data "aws_iam_policy_document" "generic_endpoint_policy" {
  statement {
    effect    = "Allow"
    actions   = ["*"]
    resources = ["*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

locals {
  all_cidr = "0.0.0.0/0"
}