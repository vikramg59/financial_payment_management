const { GoogleGenerativeAI } = require("@google/generative-ai");

class RAGAgent {
  constructor() {
    this.model = new GoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
    this.documents = [];
  }

  async addDocuments(documents) {
    this.documents = documents.map(doc => ({
      content: doc.content,
      metadata: doc.metadata || {}
    }));
  }

  async query(query, context = "") {
    const prompt = `You are a helpful assistant that analyzes financial documents and provides insights about education fees and payments. Use the following context to answer the question.

Context:
${context}

Question: ${query}

Answer:`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate AI insights");
    }
  }

  async generateFinancialInsights(documentContent) {
    const query = "Analyze this financial document and provide insights about education fees, payment schedules, due dates, and any potential issues or recommendations.";
    
    return await this.query(query, documentContent);
  }

  async extractPaymentDetails(documentContent) {
    const query = "Extract key payment information from this document including: total amount, due dates, payment methods, late fees, and any special conditions or discounts.";
    
    return await this.query(query, documentContent);
  }

  async validateDocument(documentContent) {
    const query = "Validate this financial document for completeness, accuracy, and potential red flags. Check for missing information, inconsistencies, or suspicious elements.";
    
    return await this.query(query, documentContent);
  }
}

module.exports = RAGAgent;