import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is required")

client = OpenAI(api_key=OPENAI_API_KEY)


def call_openai_json(prompt: str) -> dict:
    """Call OpenAI with forced JSON output."""
    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Return valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2
    )
    return json.loads(completion.choices[0].message.content)
