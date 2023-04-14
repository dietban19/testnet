import os
import json
import boto3
from requests_toolbelt.multipart import decoder
import requests
import datetime

# Initialize DynamoDB client
dynamodb = boto3.client('dynamodb')
print("HIIIIIII")
# Initialize Cloudinary settings
cloudinary_cloud_name = os.environ['CLOUDINARY_CLOUD_NAME']
cloudinary_api_key = os.environ['CLOUDINARY_API_KEY']
cloudinary_api_secret = os.environ['CLOUDINARY_API_SECRET']
cloudinary_upload_url = f"https://api.cloudinary.com/v1_1/{cloudinary_cloud_name}/image/upload"


def lambda_handler(event, context):
    # Read and decode the body of the request
    body_raw = event['body']
    body_decoded = decoder.MultipartDecoder(
        body_raw,
        event['headers']['content-type']
    )
    
    # Extract the fields from the decoded body
    fields = {}
    for part in body_decoded.parts:
        if part.headers[b'content-type'].startswith(b'image/'):
            # This is the image file
            fields['image'] = part.content
        else:
            # This is a regular field
            key = part.headers[b'content-disposition'].split(b'name="')[1].split(b'"')[0].decode('utf-8')
            fields[key] = part.content.decode('utf-8')
    
    # Upload the image to Cloudinary
    cloudinary_signature = cloudinary.utils.api_sign_request(
        {
            'timestamp': int(time.time()),
            'public_id': f"obituary_{fields['name']}",
            'folder': 'obituaries'
        },
        cloudinary_api_secret
    )
    cloudinary_response = requests.post(
        cloudinary_upload_url,
        data={
            'file': ('obituary_image', fields['image'], 'image/jpeg'),
            'api_key': cloudinary_api_key,
            'timestamp': cloudinary_signature['timestamp'],
            'signature': cloudinary_signature['signature'],
            'public_id': cloudinary_signature['public_id'],
            'folder': cloudinary_signature['folder']
        }
    )
    cloudinary_result = cloudinary_response.json()
    
    # Write the data to DynamoDB
    dynamodb.put_item(
        TableName='obituaries',
        Item={
            'id': {'S': fields['name']},
            'name': {'S': fields['name']},
            'description': {'S': fields['description']},
            'image_url': {'S': cloudinary_result['url']},
            'created_at': {'S': str(datetime.datetime.now())}
        },
        ReturnValues='NONE'
    )
    
    # Return the response
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST'
        },
        'body': json.dumps({'message': 'Obituary created successfully'})
    }
