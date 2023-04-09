import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("obituaries-30120286")

def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        # Insert the item into the table
        table.put_item(Item=body)
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Success"
            })
        }

    except Exception as exp:
        print(exp)
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": str(exp)
            })
        }

    # Add a return statement here to ensure that the function returns a response
    return {
        "statusCode": 500,
        "body": json.dumps({
            "message": "Unexpected error occurred."
        })
    }
