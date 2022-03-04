terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = "eu-central-1"
}


resource "tls_private_key" "private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "root1"
  public_key = tls_private_key.private_key.public_key_openssh
}

resource "local_file" "ssh_private_key" {
  filename        = "${path.module}/private.key"
  content         = tls_private_key.private_key.private_key_pem
  file_permission = "0400"
}
resource "local_file" "ssh_public_key" {
  filename        = "${path.module}/public.key"
  content         = aws_key_pair.generated_key.public_key
  file_permission = "0400"
}
