# Python RAG Agent Integration Guide

This guide explains how to integrate and use the Python RAG (Retrieval-Augmented Generation) agent with your Node.js backend.

## Overview

The integration consists of:
- **Python RAG Service** (`ai/python_service.py`) - Flask-based service providing AI capabilities
- **Node.js Client** (`backend/pythonRAGClient.js`) - Client library for communicating with Python service
- **Node.js Backend** (`backend/server.js`) - Updated to use Python RAG service

## Architecture

```
Frontend (React/Vue/etc.)
    ↓ HTTP
Node.js Backend (Express)
    ↓ HTTP (via pythonRAGClient.js)
Python RAG Service (Flask)
    ↓ API calls
Google Generative AI
```

## Setup Instructions

### 1. Environment Setup

1. **Set your Google API Key:**
   ```bash
   # Windows
   set GOOGLE_API_KEY=your_google_api_key_here
   
   # Linux/Mac
   export GOOGLE_API_KEY=your_google_api_key_here
   ```

2. **Or create a .env file in the root directory:**
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### 2. Install Dependencies

#### Python Dependencies
```bash
cd ai
pip install -r requirements.txt
```

#### Node.js Dependencies
```bash
cd backend
npm install
```

### 3. Start Services

#### Option A: Use the Orchestration Script (Recommended)
```bash
# From the root directory
python start_services.py
```

#### Option B: Start Services Manually
```bash
# Terminal 1: Start Python RAG Service
cd ai
python python_service.py

# Terminal 2: Start Node.js Backend
cd backend
npm start
```

## Service Endpoints

### Python RAG Service (Port 5002)

- **Health Check:** `GET http://localhost:5002/health`
- **Financial Analysis:** `POST http://localhost:5002/analyze/financial`
- **Payment Extraction:** `POST http://localhost:5002/analyze/payment`
- **Document Validation:** `POST http://localhost:5002/analyze/validation`
- **Comprehensive Analysis:** `POST http://localhost:5002/analyze/comprehensive`
- **Document Query:** `POST http://localhost:5002/query`

### Node.js Backend (Port 5001)

- **Upload Document:** `POST http://localhost:5001/api/upload`
- **Get Documents:** `GET http://localhost:5001/api/documents`
- **Get Document:** `GET http://localhost:5001/api/documents/:id`
- **Get AI Insights:** `GET http://localhost:5001/api/insights/:documentId`
- **Quick Insights:** `GET http://localhost:5001/api/quick-insights`

## API Usage Examples

### Upload and Analyze Document

```bash
# Upload a document
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@path/to/your/document.pdf"

# Get AI insights for the uploaded document
curl -X GET http://localhost:5001/api/insights/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Direct Python Service Usage

```bash
# Financial analysis
curl -X POST http://localhost:5002/analyze/financial \
  -H "Content-Type: application/json" \
  -d '{"document_text": "Your financial document text here..."}'

# Payment details extraction
curl -X POST http://localhost:5002/analyze/payment \
  -H "Content-Type: application/json" \
  -d '{"document_text": "Document with payment information..."}'
```

## Response Format

### Financial Analysis Response
```json
{
  "insights": [
    {
      "type": "revenue_trend",
      "description": "Revenue shows 15% growth compared to last quarter",
      "amount": 125000,
      "confidence": 0.85
    }
  ],
  "summary": "Financial analysis complete",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Payment Details Response
```json
{
  "payments": [
    {
      "amount": 2500.00,
      "due_date": "2024-02-01",
      "recipient": "ABC Corporation",
      "payment_method": "Bank Transfer",
      "status": "pending"
    }
  ],
  "total_amount": 2500.00,
  "summary": "Found 1 payment detail",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

The system includes comprehensive error handling:

- **Service Unavailable:** Returns 503 if Python service is down
- **API Key Issues:** Returns 401 if Google API key is invalid
- **Document Processing:** Returns detailed error messages for document analysis failures
- **Network Issues:** Includes retry logic and timeout handling

## Configuration

### Environment Variables

- `GOOGLE_API_KEY` - Required for Google Generative AI
- `PYTHON_SERVICE_URL` - Python service URL (default: http://localhost:5002)
- `NODE_BACKEND_PORT` - Node.js backend port (default: 5001)

### Python Service Configuration

The Python service can be configured via environment variables:
- `PORT` - Service port (default: 5002)
- `GOOGLE_API_KEY` - Google API key
- `FLASK_ENV` - Flask environment (development/production)

## Monitoring

### Health Checks

Both services provide health check endpoints:
```bash
# Python service health
curl http://localhost:5002/health

# Node.js backend health (via API status)
curl http://localhost:5001/api/documents
```

### Logs

- **Python Service:** Console output shows Flask logs
- **Node.js Backend:** Console output shows Express logs
- **Orchestration Script:** Combined logs from both services

## Troubleshooting

### Common Issues

1. **Python Service Won't Start**
   - Check if port 5002 is available
   - Verify Google API key is set
   - Check Python dependencies are installed

2. **Node.js Backend Can't Connect to Python Service**
   - Verify Python service is running
   - Check network connectivity
   - Review axios timeout settings

3. **Google API Errors**
   - Verify API key is valid
   - Check API quotas and limits
   - Review API key permissions

4. **Document Analysis Failures**
   - Check document format and size
   - Verify text extraction worked correctly
   - Review error messages in logs

### Debug Mode

Enable debug logging by setting:
```bash
export FLASK_ENV=development  # Python service
export NODE_ENV=development   # Node.js backend
```

## Performance Considerations

- **Concurrent Requests:** Python service handles multiple requests concurrently
- **Timeout Settings:** Default 30-second timeout for AI processing
- **Memory Usage:** Monitor memory usage for large document processing
- **API Rate Limits:** Be aware of Google API rate limits

## Security Notes

- Keep your Google API key secure and never commit it to version control
- Use HTTPS in production environments
- Implement proper authentication and authorization
- Validate and sanitize all document inputs

## Next Steps

1. Test the integration with sample documents
2. Configure production deployment settings
3. Set up monitoring and alerting
4. Implement additional error handling as needed
5. Consider scaling strategies for high-volume usage