const axios = require('axios');

class PythonRAGClient {
  constructor(baseURL = process.env.AI_SERVICE_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 second timeout for AI processing
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw new Error('Python RAG Service is not available');
    }
  }

  async analyzeFinancial(documentText) {
    try {
      const response = await this.client.post('/analyze/financial', {
        document_text: documentText
      });
      return response.data;
    } catch (error) {
      console.error('Financial analysis failed:', error.message);
      throw new Error(`Financial analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async extractPaymentDetails(documentText) {
    try {
      const response = await this.client.post('/analyze/payment', {
        document_text: documentText
      });
      return response.data;
    } catch (error) {
      console.error('Payment extraction failed:', error.message);
      throw new Error(`Payment extraction failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async validateDocument(documentText) {
    try {
      const response = await this.client.post('/analyze/validation', {
        document_text: documentText
      });
      return response.data;
    } catch (error) {
      console.error('Document validation failed:', error.message);
      throw new Error(`Document validation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async analyzeComprehensive(documentText) {
    try {
      const response = await this.client.post('/analyze/comprehensive', {
        document_text: documentText
      });
      return response.data;
    } catch (error) {
      console.error('Comprehensive analysis failed:', error.message);
      throw new Error(`Comprehensive analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async queryDocuments(question, context = '', documents = []) {
    try {
      const payload = {
        question: question,
        context: context
      };
      
      if (documents.length > 0) {
        payload.documents = documents;
      }

      const response = await this.client.post('/query', payload);
      return response.data;
    } catch (error) {
      console.error('Document query failed:', error.message);
      throw new Error(`Document query failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Convenience method for comprehensive document analysis
  async analyzeDocument(documentText) {
    try {
      // Run all analysis types in parallel for better performance
      const [financial, payment, validation] = await Promise.all([
        this.analyzeFinancial(documentText).catch(err => ({ error: err.message })),
        this.extractPaymentDetails(documentText).catch(err => ({ error: err.message })),
        this.validateDocument(documentText).catch(err => ({ error: err.message }))
      ]);

      return {
        financialAnalysis: financial,
        paymentDetails: payment,
        validation: validation,
        summary: 'Document analysis complete',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Document analysis failed:', error.message);
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  }
}

module.exports = PythonRAGClient;