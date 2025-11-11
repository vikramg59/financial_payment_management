import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Clock, CheckCircle, Plus, Banknote, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface Payment {
  _id: string;
  description: string;
  amount: number;
  paymentDate: string;
  status: string;
  method: string;
}

interface FeeDetails {
  totalFee: number;
  paidAmount: number;
  remainingFee: number;
  lastUpdated: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCategory, setPaymentCategory] = useState("tuition");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch fee details and payment history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch fee details
        const feeResponse = await fetch(`${API_URL}/api/fees`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (feeResponse.ok) {
          const feeData = await feeResponse.json();
          setFeeDetails(feeData.feeDetails);
        }

        // Fetch payment history
        const paymentsResponse = await fetch(`${API_URL}/api/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.payments || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const paymentMethods = [
    { id: 1, type: "Credit Card", last4: "4532", expiry: "12/26", isDefault: true },
    { id: 2, type: "Bank Account", last4: "7890", bank: "Chase Bank", isDefault: false },
    { id: 3, type: "Digital Wallet", provider: "PayPal", email: "john@email.com", isDefault: false }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-warning/10 text-warning-foreground">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive"
        });
        return;
      }
      
      const response = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          description: paymentDescription || `Payment for ${paymentCategory}`,
          method: 'online'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Payment successful",
          description: `₹${paymentAmount} has been paid successfully`,
          variant: "default"
        });
        
        // Update fee details and payment history
        setFeeDetails(data.feeDetails);
        setPayments(prev => [data.payment, ...prev]);
        
        // Reset form
        setPaymentAmount("");
        setPaymentDescription("");
      } else {
        toast({
          title: "Payment failed",
          description: data.error || "An error occurred during payment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{feeDetails ? feeDetails.totalFee.toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-xs text-muted-foreground">
              Academic Year 2023-24
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{feeDetails ? feeDetails.paidAmount.toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {feeDetails ? `Last updated: ${new Date(feeDetails.lastUpdated).toLocaleDateString()}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Fees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{feeDetails ? feeDetails.remainingFee.toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-xs text-muted-foreground">
              Next due: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              View your recent fee payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{payment.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">{payment.method}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No payment history available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Make a secure payment towards your fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input 
                      id="amount" 
                      placeholder="0.00" 
                      className="pl-8" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Payment Category</Label>
                  <Select 
                    value={paymentCategory}
                    onValueChange={setPaymentCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition Fee</SelectItem>
                      <SelectItem value="hostel">Hostel Fee</SelectItem>
                      <SelectItem value="transport">Transport Fee</SelectItem>
                      <SelectItem value="library">Library Fee</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Add a note to your payment" 
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Make Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                      {method.type === 'Credit Card' && <CreditCard className="h-4 w-4" />}
                      {method.type === 'Bank Account' && <Banknote className="h-4 w-4" />}
                      {method.type === 'Digital Wallet' && <Smartphone className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{method.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.type === 'Credit Card' && `**** ${method.last4} • Expires ${method.expiry}`}
                        {method.type === 'Bank Account' && `**** ${method.last4} • ${method.bank}`}
                        {method.type === 'Digital Wallet' && method.email}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;