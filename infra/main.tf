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


resource "aws_dynamodb_table" "obituaries-30120286" {
  name         = "obituaries-30120286"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1
  write_capacity = 1

  # we only need a student id to find an item in the table; therefore, we 
  # don't need a sort key here
  hash_key = "id"

  # the hash_key data type is string
  attribute {
    name =  "id"
    type =   "S"
  }
}

 resource "aws_iam_policy" "logs" {
  name        = "lambda-loggings"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "ssm:GetParametersByPath"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.obituaries-30120286.arn}"],
      "Effect": "Allow"
    }
  ]
}
EOF
}


locals {
  handler_name  = "main.lambda_handler"

}

# two lambda functions w/ function url
# one dynamodb table
# roles and policies as needed
# step functions (if you're going for the bonus marks)

# Create an IAM role for the create_obituary Lambda function
resource "aws_iam_role" "create-obituary_lambda" {
  name               = "iam-for-lambda-create-obituary"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "archive_file" "lambda_create-obituary" {
  type        = "zip"
  source_file = "../functions/create-obituary/main.py"
  output_path = "create-obituary-artifact.zip"
}

# resource "aws_lambda_function" "create-obituary-30120286" {
#   role             = aws_iam_role.create-obituary_lambda.arn
#   function_name    = "create-obituary"
#   handler          = local.handler_name
#   filename         = "create-obituary-artifact.zip"
#   source_code_hash = data.archive_file.lambda_create-obituary.output_base64sha256

#   # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
#   runtime = "python3.9"
# }
// calls the zip file and uses it and uploads it to aws
resource "aws_lambda_function" "create-obituary-30120286" {
  role             = aws_iam_role.create-obituary_lambda.arn
  function_name    = "create-obituary"
  handler          = local.handler_name
  filename         = "../functions/create-obituary/deployment-package/deployment-package.zip"
  source_code_hash = filebase64sha256("../functions/create-obituary/deployment-package/deployment-package.zip")

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}


resource "aws_iam_role_policy_attachment" "create-obituary-lambda_logs" {
  role       = aws_iam_role.create-obituary_lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_lambda_function_url" "create-obituary"{
    function_name       = aws_lambda_function.create-obituary-30120286.function_name
    authorization_type = "NONE"

    cors{
        allow_credentials = true
        allow_origins = ["*"]
        allow_methods = ["POST"]
        allow_headers = ["*"]
        expose_headers = ["keep-alive","date"]        
    }
}
output "create-obituary_lambda_url" {
    value = aws_lambda_function_url.create-obituary.function_url
}



resource "aws_iam_role_policy" "create-obituary-ssm" {
  name        = "create-obituary-ssm"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameters"
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:ssm:ca-central-1:906484542670:parameter/CloudinaryApiKey",
          "arn:aws:ssm:ca-central-1:906484542670:parameter/CloudinaryApiSecret",
          "arn:aws:ssm:ca-central-1:906484542670:parameter/CloudinaryCloudName"
        ]
      }
    ]
  })
  role        = aws_iam_role.create-obituary_lambda.id
}


//---------------------------------------------------------------------------------------------------------//

resource "aws_iam_role" "get-obituaries_lambda" {
  name               = "iam-for-lambda-get-obituary"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}

EOF
}


data "archive_file" "lambda_get-obituaries"{
    type = "zip"
    # this file (main.py) needs to exist in the same folder as this 
  # Terraform configuration file
    source_file = "../functions/get-obituaries/main.py"
    output_path = "get-obituaries-artifact.zip"
 }



resource "aws_lambda_function" "get-obituaries-30120286" {
  role = aws_iam_role.get-obituaries_lambda.arn
  function_name = "get-obituaries"
  handler          = local.handler_name
  filename         = "get-obituaries-artifact.zip"
  source_code_hash = data.archive_file.lambda_get-obituaries.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

resource "aws_iam_role_policy_attachment" "get-obituaries-lambda_logs" {
  role       = aws_iam_role.get-obituaries_lambda.name
  policy_arn = aws_iam_policy.logs.arn
}


resource "aws_lambda_function_url" "get-obituaries"{
    function_name       = aws_lambda_function.get-obituaries-30120286.function_name
    authorization_type = "NONE"

cors {
    allow_credentials = true
    allow_origins = ["*"]
    allow_methods = ["GET"]
    allow_headers = ["*"]
    expose_headers = ["keep-alive", "date"]
    max_age = 86400  # Cache preflight request results for 24 hours (86400 seconds)
}

}
output "get-obituaries_lambda_url" {
    value = aws_lambda_function_url.get-obituaries.function_url
}





//-------------------------------------------------------------------------------------------------

# data "archive_file" "lambda_generate-obituary"{
#     type = "zip"
#     # this file (main.py) needs to exist in the same folder as this 
#   # Terraform configuration file
#     source_file = "../functions/generate-obituary/main.py"
#     output_path = "generate-obituary_artifact.zip"
#  }