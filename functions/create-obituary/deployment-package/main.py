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

gpt_secret_key_param = ssm.get_parameter(Name='gpt_api_key', WithDecryption=True)
gpt_secret_key = gpt_secret_key_param['Parameter']['Value']

def upload_to_cloudinary(image_data, extra_fields={}):

    body = {
        "api_key": cloudinary_api_key
    }


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

    
    response = requests.post(cloudinary_upload_url, files=files,data=body)

    # response = requests.post(cloudinary_upload_url, files={'file': ('image.jpg', image_data, 'image/jpeg')}, data=data)
    return response.json()



def create_signature(body, api_secret):
    timestamp = int(time.time())

    exclude = ["api_key", "resource_type", "cloud_name"]
    sorted_body = sort_dict(body, exclude)
    signature_string = create_query_string(sorted_body)
    signature_string_appended = f"{signature_string}{api_secret}"

    hashed = hashlib.sha1(signature_string_appended.encode())

    signature = hashed.hexdigest()

    return signature

def sort_dict(dictionary, exclude):
    return {k: v for k, v in sorted(dictionary.items(), 
                                    key = lambda item: item[0]) if k not in exclude}
    
    
    
def create_query_string(body):
    
    query_string = "&".join(f"{k}={v}" for k,
                            v in sorted(body.items()))
    return query_string

def ask_gpt(prompt):
    url = "https://api.openai.com/v1/completions"
    header = {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + gpt_secret_key
    }
    body = {
        "model" : "text-davinci-003",
        "prompt" : prompt,
        "max-tokens": 400,
        "temperature" : 0.2
    }
    print("RUNNING THIS")
    response = requests.post(url, headers=header,json=body)
    print("RESPONSE:", response.json())
    return response.json()["choices"][0]["text"]



# event is an object that contains information about the HTTP request that triggered the function
# context is an object that provides information about the Lambda function's environment.
def lambda_handler(event, context):
    print("GPT KEY: ", gpt_secret_key)
    try:
        timestamp = int(time.time())

        request_body = base64.b64decode(event['body'])
        content_type = event['headers']['content-type']

        parsed_data = decoder.MultipartDecoder(request_body, content_type)
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
        myID= str(fields['id'])
        myName = fields['name']
        print("hello")
        myDescription = ask_gpt("hey davinci hows it going?")
        # myDescription = fields['description']
        print('goodbye')
        image = fields['image"; file']
        response = upload_to_cloudinary(image)
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

    

        



    