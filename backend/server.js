require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 5001;
const PythonRAGClient = require('./pythonRAGClient');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User Model
const User = mongoose.model('User', userSchema);

// Document Schema
const documentSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer,
  extractedText: String,
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiInsights: { type: String }
});

// Document Model
const Document = mongoose.model('Document', documentSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true, enum: ['tuition', 'books', 'food', 'transportation', 'lab', 'other'] },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, default: 'cash' },
  createdAt: { type: Date, default: Date.now }
});

// Expense Model
const Expense = mongoose.model('Expense', expenseSchema);

// Student Fee Schema
const studentFeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalFee: { type: Number, default: 100000 }, // Default fee of ₹100,000
  paidAmount: { type: Number, default: 0 },
  remainingFee: { type: Number, default: 100000 },
  lastUpdated: { type: Date, default: Date.now }
});

// Student Fee Model
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: 'Fee Payment' },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, default: 'online' },
  status: { type: String, default: 'completed' }
});

// Payment Model
const Payment = mongoose.model('Payment', paymentSchema);

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        firstName,
        lastName,
        email,
        phone,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Document upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, mimetype, buffer } = req.file;
    let extractedText = '';

    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        extractedText = data.text;
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
        extractedText = 'PDF text extraction failed';
      }
    } else if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf8');
    } else if (mimetype.startsWith('image/')) {
      extractedText = 'Image file. Text extraction not supported yet.';
    } else {
      extractedText = 'Unsupported file type. Text extraction not supported.';
    }

    const newDocument = new Document({
      filename: originalname,
      contentType: mimetype,
      data: buffer,
      extractedText: extractedText,
      user: req.user.userId,
      aiInsights: '',
    });

    await newDocument.save();

    res.status(201).json({ 
      message: 'File uploaded successfully', 
      document: {
        _id: newDocument._id,
        filename: newDocument.filename,
        contentType: newDocument.contentType,
        uploadDate: newDocument.uploadDate,
        extractedText: newDocument.extractedText
      }
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

// Get all documents for a user
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId }).select('-data');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single document
app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.set('Content-Type', document.contentType);
    res.send(document.data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Implement AI insights endpoint here
app.get('/api/insights/:documentId', authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 1. Load document content
    let documentContent = '';
    if (document.extractedText) {
      documentContent = document.extractedText;
    } else if (document.contentType === 'application/pdf') {
      const pdf = require('pdf-parse');
      const data = await pdf(document.data);
      documentContent = data.text;
    } else {
      // Handle other file types or provide a default message
      documentContent = 'Text extraction not supported for this file type.';
    }

    // 2. Use Python RAG client for analysis
    const ragClient = new PythonRAGClient();
    
    // Generate comprehensive insights using Python service
    const analysisResults = await ragClient.analyzeDocument(documentContent);

    // 3. Use the analysis results from Python service
    const insights = {
      financialAnalysis: analysisResults.financialAnalysis,
      paymentDetails: analysisResults.paymentDetails,
      validation: analysisResults.validation,
      summary: analysisResults.summary,
      timestamp: analysisResults.timestamp
    };

    // 4. Update document.aiInsights in the database
    document.aiInsights = JSON.stringify(insights);
    await document.save();

    // 5. Return the insights
    res.json({ insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Server error generating AI insights' });
  }
});

// Quick insights endpoint for dashboard
app.get('/api/quick-insights', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId })
      .sort({ uploadDate: -1 })
      .limit(5);

    if (!documents.length) {
      return res.json({ insights: [] });
    }

    const insights = documents.map(doc => ({
      documentId: doc._id,
      filename: doc.filename,
      uploadDate: doc.uploadDate,
      aiInsights: doc.aiInsights ? JSON.parse(doc.aiInsights) : null
    }));

    res.json({ insights });
  } catch (error) {
    console.error('Error fetching quick insights:', error);
    res.status(500).json({ error: 'Server error fetching insights' });
  }
});


// Expense endpoints
// Add new expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { description, amount, category, date, method } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Description, amount, and category are required' });
    }

    const newExpense = new Expense({
      description,
      amount,
      category,
      date: date || Date.now(),
      user: req.user.userId,
      method: method || 'cash'
    });

    await newExpense.save();

    res.status(201).json({ 
      message: 'Expense added successfully', 
      expense: newExpense 
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Server error adding expense' });
  }
});

// Get all expenses for user
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.userId })
      .sort({ date: -1 });
    
    res.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});

// Get expense statistics
app.get('/api/expenses/stats', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly trends (last 6 months)
    const monthlyTrends = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      categoryBreakdown,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ error: 'Server error fetching expense stats' });
  }
});

// Get dashboard financial data
app.get('/api/dashboard/financial', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get fee details for the user
    const feeDetails = await StudentFee.findOne({ user: userId });
    
    // Get total expenses
    const expensesTotal = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate financial data
    const totalSemesterCost = feeDetails ? feeDetails.totalFee : 0;
    const amountPaid = feeDetails ? feeDetails.paidAmount : 0;
    const pendingPayments = totalSemesterCost - amountPaid;
    
    res.json({
      totalSemesterCost,
      amountPaid,
      pendingPayments,
      monthlyBudget: Math.round(pendingPayments / 3), // Simple calculation for monthly budget
      percentChange: 2.5, // Placeholder, could be calculated from historical data
      paidPercentage: totalSemesterCost > 0 ? Math.round((amountPaid / totalSemesterCost) * 100) : 0,
      dueInDays: 30 // Placeholder, could be calculated from due dates
    });
  } catch (error) {
    console.error('Error fetching dashboard financial data:', error);
    res.status(500).json({ error: 'Server error fetching financial data' });
  }
});

// Initialize student fee on registration
app.post('/api/register', async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if fee record already exists
    const existingFee = await StudentFee.findOne({ user: req.body.userId });
    if (existingFee) {
      return res.status(200).json({ message: 'Fee record already exists', feeDetails: existingFee });
    }

    // Create new fee record
    const newFeeRecord = new StudentFee({
      user: req.body.userId,
      totalFee: 100000,
      paidAmount: 0,
      remainingFee: 100000
    });

    await newFeeRecord.save();
    res.status(201).json({ message: 'Fee record created successfully', feeDetails: newFeeRecord });
  } catch (error) {
    console.error('Error creating fee record:', error);
    res.status(500).json({ error: 'Server error creating fee record' });
  }
});

// Get student fee details
app.get('/api/fees', authenticateToken, async (req, res) => {
  try {
    let feeDetails = await StudentFee.findOne({ user: req.user.userId });
    
    // If no fee record exists, create one
    if (!feeDetails) {
      feeDetails = new StudentFee({
        user: req.user.userId,
        totalFee: 100000,
        paidAmount: 0,
        remainingFee: 100000
      });
      await feeDetails.save();
    }
    
    res.json({ feeDetails });
  } catch (error) {
    console.error('Error fetching fee details:', error);
    res.status(500).json({ error: 'Server error fetching fee details' });
  }
});

// Update student fee details
app.put('/api/fees/update', authenticateToken, async (req, res) => {
  try {
    const { totalFee, paidAmount } = req.body;
    
    if (totalFee === undefined || paidAmount === undefined) {
      return res.status(400).json({ error: 'Total fee and paid amount are required' });
    }
    
    let feeDetails = await StudentFee.findOne({ user: req.user.userId });
    
    if (!feeDetails) {
      // Create new fee record if it doesn't exist
      feeDetails = new StudentFee({
        user: req.user.userId,
        totalFee: totalFee,
        paidAmount: paidAmount,
        remainingFee: totalFee - paidAmount,
        lastUpdated: new Date()
      });
    } else {
      // Update existing fee record
      feeDetails.totalFee = totalFee;
      feeDetails.paidAmount = paidAmount;
      feeDetails.remainingFee = totalFee - paidAmount;
      feeDetails.lastUpdated = new Date();
    }
    
    await feeDetails.save();
    
    res.json({ 
      success: true, 
      feeDetails 
    });
  } catch (error) {
    console.error('Error updating fee details:', error);
    res.status(500).json({ error: 'Server error updating fee details' });
  }
});

// Make a payment
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { amount, description, method } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }
    
    // Get fee details
    let feeDetails = await StudentFee.findOne({ user: req.user.userId });
    
    // If no fee record exists, create one
    if (!feeDetails) {
      feeDetails = new StudentFee({
        user: req.user.userId,
        totalFee: 100000,
        paidAmount: 0,
        remainingFee: 100000
      });
    }
    
    // Check if payment amount is valid
    if (amount > feeDetails.remainingFee) {
      return res.status(400).json({ error: 'Payment amount exceeds remaining fee' });
    }
    
    // Create payment record
    const newPayment = new Payment({
      user: req.user.userId,
      amount,
      description: description || 'Fee Payment',
      method: method || 'online',
      status: 'completed'
    });
    
    // Update fee details
    feeDetails.paidAmount += amount;
    feeDetails.remainingFee -= amount;
    feeDetails.lastUpdated = Date.now();
    
    // Save both records
    await Promise.all([newPayment.save(), feeDetails.save()]);
    
    res.status(201).json({ 
      message: 'Payment successful', 
      payment: newPayment,
      feeDetails
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Server error processing payment' });
  }
});

// Get payment history
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.userId })
      .sort({ paymentDate: -1 });
    
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Server error fetching payment history' });
  }
});


app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});