#!/usr/bin/env python3
"""
Python Service Wrapper for Node.js Integration
Provides a REST API interface for the RAG Agent that can be called from Node.js
"""

import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import traceback
import tempfile

# Optional imports with error handling for IDE warnings
try:
    import io  # Used for file handling in document processing
except ImportError:
    pass

try:
    from docx import Document  # For Word document processing
except ImportError:
    Document = None

try:
    from PIL import Image  # For image processing and OCR
except ImportError:
    Image = None

try:
    import pytesseract  # For OCR functionality
except ImportError:
    pytesseract = None

try:
    from waitress import serve  # For production server
except ImportError:
    serve = None 

# Load environment variables from .env file
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rag_agent import RAGAgent #@UnresolvedImport

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Get CORS origin from environment variable or use wildcard as fallback
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/*": {"origins": cors_origin, "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})  # Enable CORS with environment variable

# Global RAG Agent instance
rag_agent = None

def initialize_agent():
    """Initialize the RAG Agent with API key from environment"""
    global rag_agent
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            logger.error("GOOGLE_API_KEY not found in environment variables")
            return False
        
        rag_agent = RAGAgent(api_key=api_key)
        logger.info("RAG Agent initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize RAG Agent: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "agent_initialized": rag_agent is not None,
        "timestamp": os.getenv('GOOGLE_API_KEY') is not None
    })

@app.route('/upload', methods=['POST'])
def upload_document():
    """Upload a document for analysis - supports text files, Word documents, and images"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file:
            # Get file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            # ✅ Save file directly to /tmp to avoid NamedTemporaryFile issues on Render
            tmp_path = os.path.join("/tmp", file.filename)
            file.save(tmp_path)
            logger.info(f"Saved file to {tmp_path}, size={os.path.getsize(tmp_path)} bytes")


            # Double-check that file actually exists
            if not os.path.exists(tmp_path):
                return jsonify({"error": f"File not saved properly: {tmp_path}"}), 500

            file_content = ""
            
            # Process based on file type
            if file_extension == '.txt':
                with open(tmp_path, 'r', encoding='utf-8', errors='ignore') as f:
                    file_content = f.read()

            elif file_extension == '.docx':
                if Document is None:
                    file_content = "Word document processing not available (python-docx not installed)"
                else:
                    try:
                        doc = Document(tmp_path)
                        file_content = '\n'.join([p.text for p in doc.paragraphs])
                    except Exception as docx_error:
                        logger.error(f"Failed to read .docx file: {docx_error}")
                        return jsonify({"error": f"Failed to read Word file: {str(docx_error)}"}), 500

            elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                if Image is None or pytesseract is None:
                    file_content = "OCR processing not available (PIL or pytesseract not installed)"
                else:
                    try:
                        image = Image.open(tmp_path)
                        file_content = pytesseract.image_to_string(image)
                        if not file_content.strip():
                            file_content = "No text found in image"
                    except Exception as ocr_error:
                        logger.error(f"OCR processing failed: {ocr_error}")
                        file_content = f"OCR processing failed: {str(ocr_error)}"

            else:
                try:
                    with open(tmp_path, 'r', encoding='utf-8', errors='ignore') as f:
                        file_content = f.read()
                except:
                    return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400

            # ✅ Clean up temporary file
            os.remove(tmp_path)

            # Generate summary
            summary = rag_agent.summarize_text(file_content)
            rag_agent.last_document_content = file_content

            return jsonify({
                "summary": summary,
                "file_type": file_extension,
                "content_length": len(file_content)
            })
    except Exception as e:
        logger.error(f"Error in document upload: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@app.route('/chat', methods=['POST'])
def chat_with_document():
    """Chat with the uploaded document"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "message is required"}), 400
        
        message = data['message']

        # Use the last uploaded document's content for context
        if rag_agent.last_document_content:
            rag_agent.add_documents([rag_agent.last_document_content])

        response = rag_agent.query(message)
        
        return jsonify({"response": response})
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500

@app.route('/clear-context', methods=['POST', 'OPTIONS'])
def clear_context():
    """Clear the context for the RAG Agent"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
    
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        # Get session ID if provided
        data = request.get_json()
        session_id = data.get('sessionId', 'default_session') if data else 'default_session'
        
        # Clear the document content
        rag_agent.last_document_content = ""
        
        # Clear any stored documents in the vector store
        if hasattr(rag_agent, 'clear_documents'):
            rag_agent.clear_documents()
        
        # Clear memory if method exists
        if hasattr(rag_agent, 'clear_memory'):
            rag_agent.clear_memory()
        
        return jsonify({"status": "success", "message": "Context cleared successfully", "sessionId": session_id})
    except Exception as e:
        logger.error(f"Error clearing context: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to clear context: {str(e)}"}), 500

@app.route('/analyze/financial', methods=['POST'])
def analyze_financial():
    """Analyze financial documents"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'document_text' not in data:
            return jsonify({"error": "document_text is required"}), 400
        
        document_text = data['document_text']
        results = rag_agent.generate_financial_insights(document_text)
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in financial analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/analyze/payment', methods=['POST'])
def analyze_payment():
    """Extract payment details"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'document_text' not in data:
            return jsonify({"error": "document_text is required"}), 400
        
        document_text = data['document_text']
        results = rag_agent.extract_payment_details(document_text)
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in payment analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/analyze/validation', methods=['POST'])
def analyze_validation():
    """Validate documents"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'document_text' not in data:
            return jsonify({"error": "document_text is required"}), 400
        
        document_text = data['document_text']
        results = rag_agent.validate_document(document_text)
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in document validation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Validation failed: {str(e)}"}), 500

@app.route('/analyze/comprehensive', methods=['POST'])
def analyze_comprehensive():
    """Comprehensive document analysis"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'document_text' not in data:
            return jsonify({"error": "document_text is required"}), 400
        
        document_text = data['document_text']
        results = rag_agent.analyze_document(document_text, analysis_type="comprehensive")
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in comprehensive analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/query', methods=['POST'])
def query_documents():
    """Query document knowledge base"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "question is required"}), 400
        
        question = data['question']
        context = data.get('context', '')
        
        # Add documents if provided
        if 'documents' in data:
            rag_agent.add_documents(data['documents'])
        
        results = rag_agent.query(question, context)
        
        return jsonify({"response": results})
    except Exception as e:
        logger.error(f"Error in document querying: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Query failed: {str(e)}"}), 500

@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.route('/extract-text', methods=['POST'])
def extract_text_from_image():
    """Extract text from image files using OCR"""
    try:
        if not rag_agent:
            return jsonify({"error": "RAG Agent not initialized"}), 500
        
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file:
            # Get file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            # Check if it's an image file
            if file_extension not in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                return jsonify({"error": f"Unsupported image type: {file_extension}"}), 400
            
            # Save the file to a temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
                file.save(tmp.name)
                tmp_path = tmp.name
            
            try:
                # Extract text using OCR
                if Image is None or pytesseract is None:
                    return jsonify({
                        "error": "OCR processing not available (PIL or pytesseract not installed)"
                    }), 500
                
                image = Image.open(tmp_path)
                extracted_text = pytesseract.image_to_string(image)
                
                if not extracted_text.strip():
                    return jsonify({
                        "text": "",
                        "message": "No text found in image",
                        "file_type": file_extension
                    })
                
                # Generate a summary of the extracted text
                summary = rag_agent.summarize_text(extracted_text)
                
                return jsonify({
                    "text": extracted_text,
                    "summary": summary,
                    "file_type": file_extension,
                    "text_length": len(extracted_text)
                })
            finally:
                # Clean up the temporary file
                os.remove(tmp_path)
    except Exception as e:
        logger.error(f"Error in text extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Text extraction failed: {str(e)}"}), 500

@app.errorhandler(500)
def internal_error(_error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize the agent
    if not initialize_agent():
        logger.error("Failed to initialize RAG Agent. Exiting.")
        sys.exit(1)
    
    # Run the Flask app
    port = int(os.getenv('PORT', 5002))
    logger.info(f"Starting Python RAG Service on port {port}")
    print("Attempting to start Flask app with Waitress...")
    try:
        if serve is None:
            logger.error("Waitress not available, falling back to Flask development server")
            app.run(host='0.0.0.0', port=port, debug=False)
        else:
            serve(app, host='0.0.0.0', port=port)
        print("Waitress server returned. This should not happen.")
        logger.warning("Waitress server returned. This should not happen.")
        sys.exit(1) # Exit with an error code to indicate a problem
    except Exception as e:
        logger.error(f"Failed to start Flask app: {str(e)}")
        print(f"Failed to start Flask app: {str(e)}")
        sys.exit(1)