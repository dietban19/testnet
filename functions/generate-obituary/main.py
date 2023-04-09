import os
import json
import openai

def generate_obituary(description):
    openai.api_key = os.environ["OPENAI_API_KEY"]

    prompt = f"Create an obituary for the following description:\n\n{description}\n"

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()

def lambda_handler(event, context):
    description = event["description"]
    obituary = generate_obituary(description)

    return {
        'statusCode': 200,
        'body': json.dumps({'obituary': obituary})
    }
