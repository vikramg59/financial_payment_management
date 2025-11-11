# Document Processing Enhancement

This document describes the enhanced document processing capabilities added to the Python RAG Service.

## New Features

### 1. Multi-Format Document Support
The upload endpoint now supports multiple document formats:

- **Text Files (.txt)**: Standard text files
- **Word Documents (.docx)**: Microsoft Word documents
- **Image Files**: JPG, JPEG, PNG, BMP, TIFF (with OCR text extraction)

### 2. OCR Text Extraction
New optical character recognition (OCR) capabilities using pytesseract:
- Extract text from images
- Support for multiple image formats
- Integrated with existing RAG analysis pipeline

### 3. Dedicated OCR Endpoint
New `/extract-text` endpoint specifically for image text extraction:
- Dedicated OCR processing
- Returns extracted text and summary
- Better error handling for image processing

## API Endpoints

### Upload Document (`POST /upload`)
Enhanced to support multiple file types:

```python
# Example usage with different file types
import requests

# Upload Word document
with open('document.docx', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5002/upload', files=files)

# Upload image for OCR
with open('receipt.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5002/upload', files=files)
```

Response format:
```json
{
    "summary": "Document summary text...",
    "file_type": ".docx",
    "content_length": 1500
}
```

### Extract Text from Image (`POST /extract-text`)
Dedicated OCR endpoint:

```python
# Extract text from image
with open('image.png', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5002/extract-text', files=files)
```

Response format:
```json
{
    "text": "Extracted text from image...",
    "summary": "Summary of extracted text...",
    "file_type": ".png",
    "text_length": 500
}
```

## Dependencies Added

The following Python packages have been added to `requirements.txt`:

- **python-docx>=0.8.11**: For Word document processing
- **Pillow>=10.0.1**: For image processing
- **pytesseract>=0.3.10**: For OCR text extraction

## Installation

1. Install Tesseract OCR (system dependency):
   - Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`

   **Important**: The `pytesseract` Python library requires the Tesseract OCR engine to be installed separately on your system. After installation, you may need to restart your terminal or IDE for the PATH changes to take effect.

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage Examples

### Processing Word Documents
```python
from docx import Document

# Create a test document
doc = Document()
doc.add_heading('Financial Report', 0)
doc.add_paragraph('This is a sample financial document...')
doc.save('report.docx')

# Upload for analysis
with open('report.docx', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5002/upload', files=files)
```

### Processing Images with OCR
```python
from PIL import Image
import pytesseract

# Extract text from image
image = Image.open('document.jpg')
text = pytesseract.image_to_string(image)
print(f"Extracted text: {text}")

# Or use the API endpoint
with open('document.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5002/extract-text', files=files)
```

## Error Handling

The enhanced endpoints include improved error handling:

- **File type validation**: Returns 400 for unsupported file types
- **OCR errors**: Graceful handling of OCR processing failures
- **File size limits**: Temporary file management with cleanup
- **Encoding issues**: Robust text extraction with error tolerance

## Testing

A test script is provided to verify the new functionality:

```bash
python test_document_processing.py
```

This script tests:
- Word document creation and processing
- OCR functionality verification
- API endpoint integration (if server is running)

## Integration with Existing Features

The new document processing capabilities integrate seamlessly with existing RAG features:

- **Chat functionality**: Processed documents can be used for chat interactions
- **Financial analysis**: Extracted text can be analyzed for financial insights
- **Payment extraction**: Text from documents can be processed for payment details
- **Document validation**: Processed content can be validated using existing validation logic

## Performance Considerations

- **OCR processing**: Image processing may take longer for large images
- **Memory usage**: Large documents are processed in memory
- **Temporary files**: Automatic cleanup of temporary files after processing
- **Concurrent requests**: Multiple file uploads can be processed simultaneously

## Future Enhancements

Potential improvements for future versions:

- Support for PDF documents
- Batch processing of multiple files
- Advanced OCR preprocessing (image enhancement)
- Multi-language OCR support
- Handwriting recognition
- Document classification
- Table extraction from images/documents