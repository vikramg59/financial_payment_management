#!/usr/bin/env python3
import subprocess
import time
import os
import signal
import sys
from pathlib import Path

def run_service(command, cwd, name, env=None):
    """Run a service and return the process"""
    print(f"Starting {name}...")
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env={**os.environ, **(env or {})},
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        time.sleep(2)  # Give service time to start
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print(f"{name} failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
        print(f"{name} started successfully")
        return process
    except Exception as e:
        print(f"Error starting {name}: {e}")
        return None

def main():
    """Main orchestration function"""
    base_dir = Path(__file__).parent
    ai_dir = base_dir / "ai"
    backend_dir = base_dir / "backend"
    
    processes = []
    
    try:
        # Check if Google API key is set
        if not os.environ.get('GOOGLE_API_KEY'):
            print("Warning: GOOGLE_API_KEY not set. Please set it in your environment.")
            print("You can set it by running: set GOOGLE_API_KEY=your_api_key")
            print("Or add it to a .env file")
        
        # Start Python RAG service
        print("Installing Python dependencies...")
        install_result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd=ai_dir,
            capture_output=True,
            text=True
        )
        
        if install_result.returncode != 0:
            print(f"Failed to install Python dependencies: {install_result.stderr}")
            return 1
        
        print("Starting Python RAG service...")
        python_process = run_service(
            [sys.executable, "python_service.py"],
            ai_dir,
            "Python RAG Service"
        )
        
        if not python_process:
            print("Failed to start Python service")
            return 1
        
        processes.append(python_process)
        
        # Wait a bit for Python service to be ready
        time.sleep(3)
        
        # Install Node.js dependencies
        print("Installing Node.js dependencies...")
        npm_install = subprocess.run(
            ["npm", "install"],
            cwd=backend_dir,
            capture_output=True,
            text=True
        )
        
        if npm_install.returncode != 0:
            print(f"Failed to install Node.js dependencies: {npm_install.stderr}")
            return 1
        
        # Start Node.js backend
        print("Starting Node.js backend...")
        node_process = run_service(
            ["node", "server.js"],
            backend_dir,
            "Node.js Backend"
        )
        
        if not node_process:
            print("Failed to start Node.js backend")
            return 1
        
        processes.append(node_process)
        
        print("\n" + "="*50)
        print("Services started successfully!")
        print("Python RAG Service: http://localhost:5002")
        print("Node.js Backend: http://localhost:5001")
        print("Press Ctrl+C to stop all services")
        print("="*50 + "\n")
        
        # Wait for interrupt
        while True:
            time.sleep(1)
            # Check if processes are still running
            for process in processes:
                if process.poll() is not None:
                    print(f"Service {process.pid} has stopped unexpectedly")
                    break
            else:
                continue
            break
            
    except KeyboardInterrupt:
        print("\nStopping services...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Clean up
        for process in processes:
            if process and process.poll() is None:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                    print(f"Service {process.pid} stopped")
                except subprocess.TimeoutExpired:
                    process.kill()
                    print(f"Service {process.pid} force killed")
                except Exception as e:
                    print(f"Error stopping service: {e}")
        
        print("All services stopped")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())