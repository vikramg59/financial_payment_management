import os
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from dotenv import load_dotenv
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI #@UnresolvedImport
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings #@UnresolvedImport
from langchain_community.vectorstores import FAISS #@UnresolvedImport
from langchain.text_splitter import RecursiveCharacterTextSplitter #@UnresolvedImport
from langchain.chains import RetrievalQA #@UnresolvedImport
from langchain.prompts import PromptTemplate #@UnresolvedImport


load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{(?:[^{}]|(?R))*\}', text, re.DOTALL)  # recursive regex
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
    return {"raw_response": text}

class RAGAgent:
    def __init__(self, api_key: str = None):
        """
        Initialize the RAG Agent with LangChain and Google Generative AI.
        """
        logger.info("Initializing RAGAgent...")
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            logger.error("Google API key not found.")
            raise ValueError("Google API key is required. Set GOOGLE_API_KEY environment variable or pass api_key parameter.")

        try:
            logger.info("Initializing ChatGoogleGenerativeAI...")
            self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=self.api_key, temperature=0.3, convert_system_message_to_human=True)
            logger.info("ChatGoogleGenerativeAI initialized.")

            logger.info("Initializing GoogleGenerativeAIEmbeddings...")
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=self.api_key)
            logger.info("GoogleGenerativeAIEmbeddings initialized.")

            self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            # Dictionary to store session-specific vector stores
            self.sessions = {}
            self.documents = [] # Keep for compatibility
            self.last_document_content = None
            logger.info("RAGAgent initialized successfully.")
        except Exception as e:
            logger.error(f"Error during RAGAgent initialization: {e}", exc_info=True)
            raise
            
    def clear_session(self, session_id: str) -> None:
        """
        Clear a specific session context
        """
        if session_id in self.sessions:
            logger.info(f"Clearing session: {session_id}")
            del self.sessions[session_id]
            return True
        return False

    def add_documents(self, documents: List[str], session_id: str = "default") -> None:
        """
        Add documents to the knowledge base for a specific session.
        """
        if not documents:
            return
        
        self.documents.extend(documents)
        texts = []
        for doc in documents:
            texts.extend(self.text_splitter.split_text(doc))
        
        # Create or update session-specific vector store
        if session_id in self.sessions and 'vector_store' in self.sessions[session_id]:
            self.sessions[session_id]['vector_store'].add_texts(texts)
        else:
            # Initialize session if it doesn't exist
            if session_id not in self.sessions:
                self.sessions[session_id] = {}
            
            # Create new vector store for this session
            self.sessions[session_id]['vector_store'] = FAISS.from_texts(texts, self.embeddings)
            self.sessions[session_id]['document_content'] = documents[0] if documents else ""
        
        # Create retriever and QA chain for this session
        retriever = self.sessions[session_id]['vector_store'].as_retriever()

        prompt_template = """
        You are a precise assistant. Use only the context below to answer.
        If the context does not contain enough information, say "I don't know."

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        self.sessions[session_id]['qa_chain'] = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": PROMPT}
        )

    def query(self, question: str, context: Optional[str] = None, session_id: str = "default") -> Dict[str, Any]:
        """
        Query the knowledge base with a question for a specific session.
        """
        if session_id not in self.sessions or 'qa_chain' not in self.sessions[session_id]:
            # Fallback to old method if no documents are added yet for this session
            prompt = f"""Based on the following documents and context, please answer the question:
            Documents: {' '.join(self.documents[-5:])}
            Context: {context or 'No additional context'}
            Question: {question}
            Please provide a comprehensive and accurate answer based on the available information."""
            
            try:
                response = self.llm.invoke(prompt)
                return {"answer": response.content}
            except Exception as e:
                logger.error(f"Error generating response: {e}", exc_info=True)
                return {"answer": f"Error generating response: {str(e)}"}
        
        query_text = f"Context: {context}\n\nQuestion: {question}" if context else question
        try:
            result = self.sessions[session_id]['qa_chain']({"query": query_text})
            return {"answer": result.get("result", "No answer found.")}
        except Exception as e:
            logger.error(f"Error during query: {e}", exc_info=True)
            return {"answer": f"Error during query: {str(e)}"}

    def summarize_text(self, text: str) -> str:
        """
        Summarize a given text using the LLM.
        """
        prompt = f"""Please summarize the following text:
        Text: {text}
        
        Summary:"""
        try:
            response = self.llm.invoke(prompt)
            return response.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    def generate_financial_insights(self, financial_data: str) -> Dict[str, Any]:
        prompt = f"""Analyze the following financial data and provide comprehensive insights:
        Financial Data: {financial_data}
        Please provide insights on:
        1. Key financial metrics
        2. Trends and patterns
        3. Risk assessment
        4. Recommendations
        5. Payment behavior analysis
        Return the response in JSON format with the following structure:
        {{
            "financial_metrics": {{}}, "trends": [], "risk_assessment": "",
            "recommendations": [], "payment_behavior": {{}}
        }}
        """
        
        try:
            response = self.llm.invoke(prompt)
            return extract_json(response.content)
        except Exception as e:
            return {"error": f"Error generating financial insights: {str(e)}"}

    def extract_payment_details(self, document_text: str) -> Dict[str, Any]:
        prompt = f"""Extract payment details from the following document:
        Document: {document_text}
        Please extract and return the following information in JSON format:
        {{
            "payment_amount": "", "payment_method": "", "payment_date": "",
            "transaction_id": "", "recipient": "", "sender": "", "currency": "",
            "status": "", "description": "", "additional_details": {{}}
        }}
        If a field is not found, leave it empty. Be precise with amounts and dates."""
        
        try:
            response = self.llm.invoke(prompt)
            return extract_json(response.content)
        except Exception as e:
            return {"error": f"Error extracting payment details: {str(e)}"}

    def validate_document(self, document_text: str) -> Dict[str, Any]:
        prompt = f"""Validate the following document for authenticity and completeness:
        Document: {document_text}
        Please analyze and return validation results in JSON format:
        {{
            "is_valid": true/false, "confidence_score": 0.0-1.0,
            "validation_checks": {{
                "format_check": "pass/fail", "content_completeness": "pass/fail",
                "data_consistency": "pass/fail", "signature_presence": "pass/fail",
                "date_validity": "pass/fail"
            }},
            "issues_found": [], "recommendations": [], "document_type": "",
            "extraction_summary": {{}}
        }}
        Be thorough in your validation and provide specific details about any issues found."""
        
        try:
            response = self.llm.invoke(prompt)
            return extract_json(response.content)
        except Exception as e:
            return {"error": f"Error validating document: {str(e)}"}

    def analyze_document(self, document_text: str, analysis_types: List[str] = None) -> Dict[str, Any]:
        analysis_types = analysis_types or ["financial", "payment", "validation"]
        results = {}
        if "financial" in analysis_types:
            results["financial_analysis"] = self.generate_financial_insights(document_text)
        if "payment" in analysis_types:
            results["payment_analysis"] = self.extract_payment_details(document_text)
        if "validation" in analysis_types:
            results["validation_analysis"] = self.validate_document(document_text)
        results["timestamp"] = datetime.now().isoformat()
        results["analysis_type"] = analysis_types
        return results