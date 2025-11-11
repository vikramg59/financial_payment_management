import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Upload,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "@/utils/api";

interface Document {
  _id: string;
  filename: string;
  uploadDate: string;
  aiInsights?: string;
}

interface FinancialData {
  totalSemesterCost: number;
  amountPaid: number;
  pendingPayments: number;
  monthlyBudget: number;
  percentChange: number;
  paidPercentage: number;
  dueInDays: number;
}

const Dashboard = () => {
  const {} = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalSemesterCost: 0,
    amountPaid: 0,
    pendingPayments: 0,
    monthlyBudget: 0,
    percentChange: 0,
    paidPercentage: 0,
    dueInDays: 30
  });
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };
  
  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/dashboard/financial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFinancialData(data);
      }
    } catch (error) {
      console.error("Failed to fetch financial data", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchFinancialData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        fetchDocuments(); 
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Semester Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{financialData.totalSemesterCost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {financialData.percentChange > 0 ? '+' : ''}{financialData.percentChange}% from last semester
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{financialData.amountPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {financialData.paidPercentage}% of total amount
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-warning-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning-foreground">₹{financialData.pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Due in next {financialData.dueInDays} days
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{financialData.monthlyBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Recommended savings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Transactions */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest education-related payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { description: "Tuition Fee - Fall 2024", amount: "₹8,500", status: "paid", date: "Jan 15, 2024" },
  { description: "Hostel Fee", amount: "₹2,400", status: "paid", date: "Jan 10, 2024" },
  { description: "Library Fee", amount: "₹150", status: "pending", date: "Due Jan 25, 2024" },
  { description: "Lab Fee", amount: "₹300", status: "pending", date: "Due Feb 1, 2024" },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          transaction.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'
                        }`}>
                          {transaction.status === 'paid' ? 
                            <CheckCircle className="h-4 w-4 text-success" /> : 
                            <Clock className="h-4 w-4 text-warning-foreground" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{transaction.amount}</p>
                        <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Your recently uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Progress */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Semester Payment Progress</CardTitle>
                <CardDescription>Track your payment completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">66%</span>
                    </div>
                    <Progress value={66} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">₹12,300</p>
                      <p className="text-sm text-muted-foreground">Paid</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning-foreground">₹6,200</p>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Button variant="hero" className="w-full justify-start" onClick={handleUploadButtonClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Fee Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Payment Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Library Fee", amount: "₹150", date: "Jan 25", urgent: true },
  { title: "Lab Fee", amount: "₹300", date: "Feb 1", urgent: false },
  { title: "Sports Fee", amount: "₹100", date: "Feb 15", urgent: false },
                  ].map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`h-4 w-4 ${deadline.urgent ? 'text-destructive' : 'text-warning-foreground'}`} />
                        <div>
                          <p className="font-medium text-sm">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">Due {deadline.date}</p>
                        </div>
                      </div>
                      <p className="font-medium text-sm">{deadline.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-0 shadow-card bg-gradient-primary">
              <CardHeader>
                <CardTitle className="text-primary-foreground">AI Financial Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-primary-foreground/80">
                  <p className="text-sm">
                    💡 You're ahead of schedule! You've paid 66% of semester fees with 3 months remaining.
                  </p>
                  <p className="text-sm">
                    💰 Consider setting aside ₹2,100/month to comfortably cover remaining expenses.
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-3 bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                    View Full Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;