import os
from openai import OpenAI

# Gunakan environment variable untuk API Key
client = OpenAI()

def get_chat_response(user_input):
    try:
        # Menggunakan model gpt-4.1-mini yang tersedia di sandbox
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "Kamu adalah karakter anime yang ramah dan ceria. Jawablah dengan singkat dan manis."},
                {"role": "user", "content": user_input}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in chatbot: {e}")
        # Fallback jika API gagal
        responses = {
            "hai": "Hai juga! Apa kabar?",
            "halo": "Halo! Senang melihatmu.",
            "siapa kamu": "Aku adalah asisten anime virtualmu!",
        }
        return responses.get(user_input.lower(), "Maaf, aku tidak mengerti. Bisa ulangi?")
