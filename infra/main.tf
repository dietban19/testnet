terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

# two lambda functions w/ function url
# one dynamodb table
# roles and policies as needed
# step functions (if you're going for the bonus marks)

# Create an IAM role for the create_obituary Lambda function
resource "aws_iam_role" "create_obituary_role" {
  name = "create_obituary_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach necessary policies to the create_obituary IAM role
resource "aws_iam_role_policy_attachment" "create_obituary_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.create_obituary_role.name
}

# Create the create_obituary Lambda function
resource "aws_lambda_function" "create_obituary" {
  function_name = "create_obituary"
  role          = aws_iam_role.create_obituary_role.arn
  handler       = "main.lambda_handler"

  # Replace the path with the path to your create_obituary Lambda function zip package
  filename = "<path-to-your-create_obituary-lambda-package>.zip"
  runtime  = "python3.9"
}

# Create an IAM role for the get_obituary Lambda function
resource "aws_iam_role" "get_obituary_role" {
  name = "get_obituary_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach necessary policies to the get_obituary IAM role
resource "aws_iam_role_policy_attachment" "get_obituary_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.get_obituary_role.name
}

# Create the get_obituary Lambda function
resource "aws_lambda_function" "get_obituary" {
  function_name = "get_obituary"
  role          = aws_iam_role.get_obituary_role.arn
  handler       = "main.lambda_handler"

  # Replace the path with the path to your get_obituary Lambda function zip package
  filename = "<path-to-your-get_obituary-lambda-package>.zip"
  runtime  = "python3.9"
}

  
