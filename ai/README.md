# Python RAG Agent for Financial Document Analysis

This Python RAG (Retrieval-Augmented Generation) Agent provides intelligent document analysis capabilities for financial documents, payment processing, and document validation using Google Generative AI.

## Features

- **Financial Document Analysis**: Generate insights from financial documents including metrics, trends, risk assessment, and recommendations
- **Payment Details Extraction**: Automatically extract payment information from documents (amount, method, date, transaction ID, etc.)
- **Document Validation**: Validate document authenticity and completeness with confidence scoring
- **Comprehensive Analysis**: Perform all analysis types in a single operation
- **Document Querying**: Query your document knowledge base with natural language questions

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up Google API Key

You need a Google API key to use the Generative AI features:

```bash
export GOOGLE_API_KEY="your-api-key-here"
```

Or set it in your Python code:

```python
import os
os.environ['GOOGLE_API_KEY'] = 'your-api-key-here'
```

## Usage

### Basic Usage

```python
from rag_agent import RAGAgent

# Initialize the agent
agent = RAGAgent()  # Uses GOOGLE_API_KEY from environment

# Or pass API key directly
agent = RAGAgent(api_key='your-api-key-here')
```

### Document Analysis Examples

#### 1. Financial Insights

```python
financial_document = """
Invoice #INV-2024-001
Date: January 15, 2024
Amount: $1,250.00
Payment Method: Credit Card
Transaction ID: TXN-123456789
Recipient: Tech Solutions Inc.
Description: Software development services for January 2024
Status: Paid
"""

insights = agent.generate_financial_insights(financial_document)
print(json.dumps(insights, indent=2))
```

#### 2. Payment Details Extraction

```python
payment_details = agent.extract_payment_details(financial_document)
print(json.dumps(payment_details, indent=2))
```

#### 3. Document Validation

```python
validation_results = agent.validate_document(financial_document)
print(json.dumps(validation_results, indent=2))
```

#### 4. Comprehensive Analysis

```python
comprehensive_results = agent.analyze_document(financial_document, analysis_type="comprehensive")
print(json.dumps(comprehensive_results, indent=2))
```

### Document Querying

```python
# Add documents to knowledge base
agent.add_documents(["Document 1 content...", "Document 2 content..."])

# Query the knowledge base
response = agent.query("What payment methods are mentioned in the documents?")
print(response)
```

## API Reference

### RAGAgent Class

#### Constructor

```python
RAGAgent(api_key: str = None)
```

- `api_key`: Google API key (optional if GOOGLE_API_KEY environment variable is set)

#### Methods

##### `add_documents(documents: List[str]) -> None`
Add documents to the knowledge base for querying.

##### `query(question: str, context: Optional[str] = None) -> str`
Query the knowledge base with a natural language question.

##### `generate_financial_insights(financial_data: str) -> Dict[str, Any]`
Generate financial insights from financial documents.

Returns dictionary with:
- `financial_metrics`: Key financial metrics
- `trends`: List of identified trends
- `risk_assessment`: Risk analysis
- `recommendations`: List of recommendations
- `payment_behavior`: Payment behavior analysis

##### `extract_payment_details(document_text: str) -> Dict[str, Any]`
Extract payment information from documents.

Returns dictionary with:
- `payment_amount`: Payment amount
- `payment_method`: Payment method used
- `payment_date`: Payment date
- `transaction_id`: Transaction identifier
- `recipient`: Payment recipient
- `sender`: Payment sender
- `currency`: Currency used
- `status`: Payment status
- `description`: Payment description
- `additional_details`: Additional extracted details

##### `validate_document(document_text: str) -> Dict[str, Any]`
Validate document authenticity and completeness.

Returns dictionary with:
- `is_valid`: Boolean indicating if document is valid
- `confidence_score`: Confidence score (0.0-1.0)
- `validation_checks`: Detailed validation results
- `issues_found`: List of identified issues
- `recommendations`: List of recommendations
- `document_type`: Identified document type
- `extraction_summary`: Summary of extracted information

##### `analyze_document(document_text: str, analysis_type: str = "comprehensive") -> Dict[str, Any]`
Perform comprehensive document analysis.

Analysis types:
- `"comprehensive"`: All analysis types (default)
- `"financial"`: Financial insights only
- `"payment"`: Payment details only
- `"validation"`: Document validation only

## Testing

Run the built-in test suite:

```bash
python rag_agent.py
```

This will test all major functionalities with sample documents.

## Error Handling

The agent includes comprehensive error handling:

- API key validation
- Network error handling
- JSON parsing error recovery
- Graceful degradation for missing data

All methods return dictionaries with error information if something goes wrong:

```python
{
    "error": "Error description",
    # ... other fields with default values
}
```

## Integration with Backend

To integrate with your backend application:

1. Copy the `ai` folder to your project
2. Install dependencies: `pip install -r ai/requirements.txt`
3. Import and use the RAGAgent in your backend code

```python
from ai.rag_agent import RAGAgent

# Use in your API endpoints
def analyze_document_endpoint(document_text):
    agent = RAGAgent()
    results = agent.analyze_document(document_text)
    return results
```

## Best Practices

1. **API Key Security**: Never hardcode API keys in your code. Use environment variables.
2. **Document Size**: For large documents, consider chunking them into smaller pieces.
3. **Rate Limiting**: Be aware of Google API rate limits for your usage tier.
4. **Error Handling**: Always check for errors in the returned dictionaries.
5. **Caching**: Consider caching analysis results for frequently accessed documents.

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your GOOGLE_API_KEY is valid and has access to Generative AI
2. **Import Error**: Make sure all dependencies are installed: `pip install -r requirements.txt`
3. **Network Issues**: Check your internet connection and Google API status
4. **Parsing Errors**: The agent includes fallback handling for JSON parsing issues

### Getting Help

If you encounter issues:
1. Check the error messages in the returned dictionaries
2. Verify your API key is working
3. Test with the built-in test suite: `python rag_agent.py`
4. Review Google Generative AI documentation for API-specific issues