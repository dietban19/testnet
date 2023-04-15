from distutils.command.upload import upload
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
client = boto3.client('polly')

# Initialize Cloudinary settings
ssm = boto3.client('ssm')
cloudinary_cloud_name_parameter = ssm.get_parameter(Name='cloudinary_cloud_name', WithDecryption=True)
cloudinary_cloud_name = cloudinary_cloud_name_parameter['Parameter']['Value']

cloudinary_api_key_parameter = ssm.get_parameter(Name='cloudinary_api_key', WithDecryption=True)
cloudinary_api_key = cloudinary_api_key_parameter['Parameter']['Value']

cloudinary_api_secret_parameter = ssm.get_parameter(Name='cloudinary_api_secret', WithDecryption=True)
cloudinary_api_secret = cloudinary_api_secret_parameter['Parameter']['Value']



gpt_secret_key_param = ssm.get_parameter(Name='gpt_api_key', WithDecryption=True)
gpt_secret_key = gpt_secret_key_param['Parameter']['Value']
def upload_to_cloudinary(file_data, resource_type='image', extra_fields={}):
    try:
        if resource_type == 'image':
            content_type = 'image/jpeg'
            file_extension = 'jpg'
            resource_type = 'image'
            body = {
                "api_key": cloudinary_api_key,
                # "resource_type": resource_type 
            }

            files = {
                'file':(
                    f'file.{file_extension}',
                    file_data,
                    content_type
                )
            }
        elif resource_type == 'video':
            body = {
                "api_key": cloudinary_api_key,
                # "resource_type": resource_type 
            }
            files = {
                "file" : open(file_data, "rb")
            }

        else:
            raise ValueError("Invalid file type specified")
            


        timestamp = int(time.time())
        body["timestamp"] = timestamp
        body.update(extra_fields)
        
        body["signature"] = create_signature(body, cloudinary_api_secret)
        cloudinary_upload_url = f"https://api.cloudinary.com/v1_1/{cloudinary_cloud_name}/{resource_type}/upload"

        response = requests.post(cloudinary_upload_url, files=files, data=body)
        return response.json()
    except Exception as e:
        print(f"Error uploading to Cloudinary: {str(e)}")
        raise e





def create_signature(body, api_secret):
    timestamp = int(time.time())
    
    exclude = ["api_key", "resource_type", "cloud_name"]
    sorted_body = {k: v for k, v in sorted(body.items(), key = lambda item: item[0]) if k not in exclude}
    signature_string = "&".join(f"{k}={v}" for k, v in sorted(sorted_body.items()))
    signature_string_appended = f"{signature_string}{api_secret}"

    hashed = hashlib.sha1(signature_string_appended.encode())

    signature = hashed.hexdigest()

    return signature

def ask_gpt(prompt):
    url = "https://api.openai.com/v1/completions"
    header = {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + gpt_secret_key
    }
    body = {
        "model" : "text-davinci-003",
        "prompt" : prompt,
        "max_tokens": 400,
        "temperature" : 0.2
    }
    # print("RUNNING THIS")
    response = requests.post(url, headers=header,json=body)
    # print("RESPONSE:", response.json())
    return response.json()["choices"][0]["text"]


def call_poly(read_text):
    try:
        response = client.synthesize_speech(
            Engine='standard',
            LanguageCode='en-US',
            OutputFormat='mp3',  # Set the output format to MP3
            Text=read_text,
            TextType='text',
            VoiceId='Brian'
        )
        filename = '/tmp/polly.mp3'

        with open(filename, 'wb') as file:
            file.write(response['AudioStream'].read())
        return filename
    except Exception as e:
        print("call_poly error:", str(e))
        raise e

# event is an object that contains information about the HTTP request that triggered the function
# context is an object that provides information about the Lambda function's environment.
def lambda_handler(event, context):
   
    try:
        print("GPT KEY: ", gpt_secret_key)
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
        
        # myDescription = fields['description']

        image = fields['image"; file']
        response = upload_to_cloudinary(image)
        print(fields['birthDate'], fields['deathDate'])
        
        prompt = f"write an obituary about a fictional character named {myName} who was born on {fields['birthDate']} and died on {fields['deathDate']}"
        print("BEFORE")
        myDescription = ask_gpt(prompt)
        print('call_poly')

        print('call_poly')
        mp3_call = call_poly(myDescription)
        print('call_poly finished')


        print('uoload audio')
        myFile = upload_to_cloudinary(mp3_call, resource_type='video')
        print(myFile)

        
        table.put_item(
            Item = { 
                'id': myID,
                'name': myName,
                'description': myDescription,
                'image_url': response['secure_url'],
                'timestamp': str(timestamp),
            })
        print("AFTER")

        return {
                    "statusCode": 200,
                    "body": json.dumps({
                        "image_url": response['secure_url'],
                        "gpt_response" : myDescription,
                        "audio_file" : myFile['secure_url']
                    })
                }
    except Exception as exp:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": str(exp)
            })
        }

    

        



    