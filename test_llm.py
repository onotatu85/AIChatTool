import os
from openai import OpenAI

# Initialize OpenAI client for Ollama
client = OpenAI(
    base_url=os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1"),
    api_key="ollama", 
)

print("Connecting to Ollama...")

try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {
                "role": "user",
                "content": "Hello, are you working?",
            }
        ],
        model="mistral",
    )
    print("Response received:")
    print(chat_completion.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")
