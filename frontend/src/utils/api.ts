// API URL configuration
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL;

// Authentication API calls
export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const registerUser = async (userData: any) => {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Dashboard API calls
export const fetchDocuments = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const fetchFinancialData = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/dashboard/financial`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

// Document API calls
export const uploadDocument = async (formData: FormData, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
};

// AI Service API calls
export const clearAIContext = async () => {
  const response = await fetch(`${AI_SERVICE_URL}/clear-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const uploadToAI = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${AI_SERVICE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const chatWithAI = async (message: string) => {
  const response = await fetch(`${AI_SERVICE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return response.json();
};

// Expenses API calls
export const fetchExpenses = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const fetchExpenseStats = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/expenses/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const createExpense = async (expenseData: any, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/expenses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(expenseData),
  });
  return response.json();
};

// Fees and Payments API calls
export const fetchFees = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/fees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const fetchPayments = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const updateFees = async (feeData: any, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/fees/update`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(feeData),
  });
  return response.json();
};

export const createPayment = async (paymentData: any, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/payments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(paymentData),
  });
  return response.json();
};