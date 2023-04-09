import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("obituaries-30120286")

def lambda_handler(event, context):
    try:
        # Fetch all obituaries from the DynamoDB table
        response = table.scan()
        obituaries = response["Items"]

        # Return the obituaries as a JSON response
        return {
            "statusCode": 200,
            "body": json.dumps(obituaries),
            "headers": {
                "Content-Type": "application/json",
            },
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Error fetching obituaries"
            }),
            "headers": {
                "Content-Type": "application/json",
            },
        }
