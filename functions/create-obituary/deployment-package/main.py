import os
import json
from sqlite3 import Timestamp
import boto3
from requests_toolbelt.multipart import MultipartDecoder
from requests_toolbelt.multipart import decoder
from requests_toolbelt.multipart.encoder import MultipartEncoder
import requests
import datetime
import base64
import time
import hashlib
import hmac

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("obituaries-30120286")

# Initialize Cloudinary settings
ssm = boto3.client('ssm')
cloudinary_cloud_name_parameter = ssm.get_parameter(Name='cloudinary_cloud_name', WithDecryption=True)
cloudinary_cloud_name = cloudinary_cloud_name_parameter['Parameter']['Value']

cloudinary_api_key_parameter = ssm.get_parameter(Name='cloudinary_api_key', WithDecryption=True)
cloudinary_api_key = cloudinary_api_key_parameter['Parameter']['Value']

cloudinary_api_secret_parameter = ssm.get_parameter(Name='cloudinary_api_secret', WithDecryption=True)
cloudinary_api_secret = cloudinary_api_secret_parameter['Parameter']['Value']

cloudinary_upload_url = f"https://api.cloudinary.com/v1_1/{cloudinary_cloud_name}/image/upload"

def upload_to_cloudinary(image_data, extra_fields={}):
    print("CLOUD NAME: ",cloudinary_cloud_name)
    body = {
        "api_key": cloudinary_api_key
    }
    print("THE BODY API KEY IS: ", body['api_key'])

    files = {
        'file':(
            'image.jpg',
            image_data,
            'image/jpeg'
        )
    }
    timestamp = int(time.time())
    body["timestamp"] = timestamp
    body.update(extra_fields)
    
    body["signature"] = create_signature(body, cloudinary_api_secret)
    print("BODY IS: ", body)
    

    
    response = requests.post(cloudinary_upload_url, files=files,data=body)
    print("CREATE RESPONSE: ", response)
    print("RESPONSE JSON + ", response.json())
    # response = requests.post(cloudinary_upload_url, files={'file': ('image.jpg', image_data, 'image/jpeg')}, data=data)
    return response.json()



def create_signature(body, api_secret):
    timestamp = int(time.time())
    print("THE SECRET APLI IS: ", api_secret)
    print("TIME STAMP: ", timestamp)
    print("API SECRET: ", api_secret)
    exclude = ["api_key", "resource_type", "cloud_name"]
    sorted_body = sort_dict(body, exclude)
    print("SORTED BODY: ", sorted_body)
    signature_string = create_query_string(sorted_body)
    print("QUERY STRING: ", signature_string)
    signature_string_appended = f"{signature_string}{api_secret}"
    print("SIGNATURE APPENDED: ", signature_string_appended)
    hashed = hashlib.sha1(signature_string_appended.encode())
    print("HASHED: ", hashed)
    signature = hashed.hexdigest()
    print("SIGNATURE: ", signature)
    return signature
    # public_id = str(timestamp)
    # body["public_id"] = public_id
    
    
    # sorted_params = sorted([(k, v) for k, v in body.items() if k not in exclude])
    # print("SORTED PARAMS: ", sorted_params)

    # signature_string = '&'.join([f"{k}={v}" for k, v in sorted_params])
    # print("SIGNATURE STRING: ", signature_string)
    # signature = hmac.new(api_secret.encode('utf-8'), signature_string.encode('utf-8'), hashlib.sha1).hexdigest()
    # print("THE SIGNATURE: ", signature)
    # print("TIMESTAMP: ", timestamp)
    # return signature, timestamp
def sort_dict(dictionary, exclude):
    return {k: v for k, v in sorted(dictionary.items(), key = lambda item: item[0]) if k not in exclude}
    
def create_query_string(body):
    
    query_string = "&".join(f"{k}={v}" for k, v in sorted(body.items()))
    return query_string

# event is an object that contains information about the HTTP request that triggered the function
# context is an object that provides information about the Lambda function's environment.
def lambda_handler(event, context):
    try:
        print("HELLO WORLD")
        print(cloudinary_api_key, cloudinary_api_secret, cloudinary_cloud_name)
        timestamp = int(time.time())

        request_body = base64.b64decode(event['body'])
        print("THE REAL ONE IS: ",request_body)
        content_type = event['headers']['content-type']

        parsed_data = decoder.MultipartDecoder(request_body, content_type)
        print(parsed_data)
        fields = {}

        for part in parsed_data.parts:
            header = part.headers.get(b'Content-Disposition')
            if header:
                decoded_header = header.decode('utf-8')
                name = decoded_header.split('name=')[1].strip('"')
                if b'filename' in header:
                    fields[name] = part.content  # Image data
                else:
                    fields[name] = part.text  # Other fields
        print("THE FIELDS: ",fields)
        myID= str(fields['id'])
        myName = fields['name']
        myDescription = fields['description']
        image = fields['image"; file']

        response = upload_to_cloudinary(image)
        print("BEFORE")
        table.put_item(
            Item={
                'id': myID,
                'name': myName,
                'description': myDescription,
                'image_url': response['secure_url'],
                'timestamp': str(timestamp)
            }
        )
        print("AFTER")

        return {
                    "statusCode": 200,
                    "body": json.dumps({
                        "image_url": response['secure_url']
                    })
                }
    except Exception as exp:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": str(exp)
            })
        }

    

        



    