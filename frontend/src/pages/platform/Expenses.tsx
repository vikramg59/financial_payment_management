import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Receipt, Plus, TrendingUp, PieChart, Download, Calendar, Filter } from 'lucide-react';
import { CSVLink } from "react-csv";

import { BACKEND_URL } from "@/utils/api";
interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  method: string;
  date: string;
}

interface CategoryBreakdown {
  _id: string;
  total: number;
}

interface MonthlyTrend {
  _id: {
    month: number;
  };
  total: number;
}

interface ExpenseStats {
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    categoryBreakdown: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    method: 'cash'
  });

  const headers = [
    { label: "Description", key: "description" },
    { label: "Amount", key: "amount" },
    { label: "Category", key: "category" },
    { label: "Method", key: "method" },
    { label: "Date", key: "date" },
  ];

  // Fetch expenses and stats
  useEffect(() => {
    fetchExpenses();
    fetchExpenseStats();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchExpenses();
      fetchExpenseStats();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchExpenses = async () => {
    try {
      // Use the authFetch utility for authenticated requests
      const response = await fetch(`${BACKEND_URL}/api/expenses/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if your backend uses them
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      } else {
        console.error('Failed to fetch expenses:', response.status);
        // If token is invalid, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        // Set empty array on error to prevent UI issues
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseStats = async () => {
    try {
      // Use proper authentication headers
      const response = await fetch(`${BACKEND_URL}/api/expenses/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if your backend uses them
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Expense stats data:', data);
        console.log('data.totalExpenses:', data.totalExpenses);
        
        setExpenseStats({
          totalExpenses: data.totalExpenses || 0,
          categoryBreakdown: data.categoryBreakdown || [],
          monthlyTrends: data.monthlyTrends || []
        });
      }
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          method: formData.method
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(prev => [data.expense, ...prev]);
        setFormData({ description: '', amount: '', category: '', method: 'cash' });
        fetchExpenseStats(); // Refresh stats
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const getCategoryBadge = (category: string): "default" | "outline" | "destructive" | "secondary" => {
    const colorMap: { [key: string]: "default" | "outline" | "destructive" | "secondary" } = {
      "Tuition": "default",
      "Books & Supplies": "secondary",
      "Food": "outline",
      "Transportation": "secondary",
      "Lab Fees": "outline"
    };
    return colorMap[category] || "secondary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Tracking</h1>
          <p className="text-muted-foreground">
            Comprehensive tracking of tuition, books, hostel, and other education expenses
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{expenseStats?.totalExpenses ? expenseStats.totalExpenses.toLocaleString() : "0"}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              All expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseStats.categoryBreakdown[0]?._id || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{expenseStats.categoryBreakdown[0]?.total || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{expenses.length > 0 ? Math.round(expenseStats.totalExpenses / expenses.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Expense Insights */}
      <Card className="bg-gradient-primary border-0">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Expense Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-primary-foreground/90">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-sm">
              📊 <strong>Spending Pattern:</strong><br />
              Your book expenses are 40% lower than average - great job finding deals!
            </div>
            <div className="text-sm">
              📈 <strong>Trend Alert:</strong><br />
              Transportation costs increased 25% this month due to extra trips.
            </div>
            <div className="text-sm">
              💡 <strong>Optimization:</strong><br />
              Switch to digital textbooks to save approximately $180 per semester.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add New Expense */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Quick Add Expense</CardTitle>
            <CardDescription>Record a new education expense</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Chemistry textbook" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="books">Books & Supplies</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="lab">Lab Fees</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="digital">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="financial" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending by category this semester</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseStats.categoryBreakdown.map((item, index) => {
                const percentage = expenseStats.totalExpenses > 0
                  ? Math.round((item.total / expenseStats.totalExpenses) * 100)
                  : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500'];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm capitalize">{item._id}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                        <span className="font-medium text-sm">${item.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {expenseStats.categoryBreakdown.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No expenses yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest education-related expenses</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <CSVLink
                data={expenses}
                headers={headers}
                filename={"expenses.csv"}
                className="text-muted-foreground underline"
              >
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CSVLink>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses recorded yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first expense using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{expense.description}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{expense.method}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">₹{expense.amount.toLocaleString()}</p>
                      <Badge variant={getCategoryBadge(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Monthly Spending Trends</CardTitle>
          <CardDescription>Track your expense patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {expenseStats.monthlyTrends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No monthly data available</p>
              ) : (
                <div className="flex justify-between items-end h-32">
                  {expenseStats.monthlyTrends.map((month, index) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const maxAmount = Math.max(...expenseStats.monthlyTrends.map(m => m.total));
                    return (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="w-12 bg-muted rounded-t-md flex items-end justify-center">
                          <div 
                            className="w-8 bg-primary rounded-t-md transition-all duration-300"
                            style={{ 
                              height: `${maxAmount > 0 ? (month.total / maxAmount) * 100 : 0}px`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {monthNames[month._id.month - 1]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ₹{(month.total / 1000).toFixed(1)}k
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;