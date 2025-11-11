
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the parent directory of the script
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: GOOGLE_API_KEY not found. Make sure it is set in the .env file.")
else:
    genai.configure(api_key=api_key)
    print("Available models with 'generateContent' support:")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"An error occurred while listing models: {e}")