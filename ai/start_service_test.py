import os
import subprocess

# Set the environment variable
os.environ['GOOGLE_API_KEY'] = 'test_key_for_demo'

# Start the Python service
print("Starting Python RAG Service with test API key...")
subprocess.run(['.\\venv\\Scripts\\python.exe', 'python_service.py'])