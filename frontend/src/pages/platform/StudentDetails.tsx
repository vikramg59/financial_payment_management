import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Edit, Save, User, CreditCard, Receipt, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StudentInfo {
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  section: string;
  admissionDate: string;
  contactNumber: string;
  address: string;
}

interface FeeDetails {
  totalFee: number;
  paidAmount: number;
  remainingFee: number;
  lastUpdated: string;
}

interface Payment {
  _id: string;
  description: string;
  amount: number;
  paymentDate: string;
  status: string;
  method: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const StudentDetails = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: "Emily Doe",
    email: "emily.doe@student.edu",
    rollNumber: "STU2024001",
    class: "10th Grade",
    section: "A",
    admissionDate: "2023-08-15",
    contactNumber: "+91 9876543210",
    address: "123 Education Lane, Knowledge City"
  });
  
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [editedInfo, setEditedInfo] = useState<StudentInfo>(studentInfo);
  const [editedFee, setEditedFee] = useState<FeeDetails | null>(null);
  const { toast } = useToast();

  // Fetch student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch fee details
        const feeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fees`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (feeResponse.ok) {
          const feeData = await feeResponse.json();
          setFeeDetails(feeData.feeDetails);
          setEditedFee(feeData.feeDetails);
        }

        // Fetch payment history
        const paymentsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.payments || []);
        }

        // Fetch expenses
        const expensesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/expenses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json();
          setExpenses(expensesData.expenses || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setStudentInfo(editedInfo);
      toast({
        title: "Profile updated",
        description: "Student information has been updated successfully",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFeeEditToggle = () => {
    if (isEditingFee && editedFee) {
      // Save fee changes
      updateFeeDetails();
    }
    setIsEditingFee(!isEditingFee);
  };

  const updateFeeDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !editedFee) return;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fees/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalFee: editedFee.totalFee,
          paidAmount: editedFee.paidAmount
        })
      });

      if (response.ok) {
        setFeeDetails(editedFee);
        toast({
          title: "Fee details updated",
          description: "Student fee information has been updated successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "Failed to update fee details. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error updating fee details:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "An error occurred while updating fee details.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editedFee) return;
    
    const numValue = parseFloat(value);
    
    setEditedFee(prev => {
      if (!prev) return null;
      
      const updatedFee = {
        ...prev,
        [name]: numValue
      };
      
      // Recalculate remaining fee when totalFee or paidAmount changes
      if (name === 'totalFee' || name === 'paidAmount') {
        updatedFee.remainingFee = updatedFee.totalFee - updatedFee.paidAmount;
      }
      
      return updatedFee;
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Details</h1>
          <p className="text-muted-foreground">
            View and manage student information, fees, and related transactions
          </p>
        </div>
        <Button onClick={handleEditToggle}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Student Profile Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
            <CardDescription>Personal and academic information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" alt={studentInfo.name} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{studentInfo.name}</h2>
              <p className="text-muted-foreground">{studentInfo.email}</p>
              <Badge className="mt-2">{studentInfo.rollNumber}</Badge>
            </div>

            <div className="space-y-4">
              {isEditing ? (
                // Edit mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={editedInfo.name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input 
                        id="rollNumber" 
                        name="rollNumber" 
                        value={editedInfo.rollNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Input 
                        id="class" 
                        name="class" 
                        value={editedInfo.class} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input 
                        id="section" 
                        name="section" 
                        value={editedInfo.section} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      value={editedInfo.email} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input 
                      id="contactNumber" 
                      name="contactNumber" 
                      value={editedInfo.contactNumber} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={editedInfo.address} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Class</p>
                      <p>{studentInfo.class}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Section</p>
                      <p>{studentInfo.section}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                    <p>{new Date(studentInfo.admissionDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                    <p>{studentInfo.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{studentInfo.address}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fee Details Card */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Fee Details & Transactions</CardTitle>
            <CardDescription>Current fee status and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fees">
              <TabsList className="mb-4">
                <TabsTrigger value="fees">Fee Summary</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fees">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Fee Summary</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFeeEditToggle}
                    >
                      {isEditingFee ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Fee
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isEditingFee ? (
                          <div className="space-y-2">
                            <Input 
                              type="number"
                              name="totalFee"
                              value={editedFee?.totalFee || 0}
                              onChange={handleFeeInputChange}
                            />
                          </div>
                        ) : (
                          <div className="text-2xl font-bold">
                            ₹{feeDetails ? feeDetails.totalFee.toLocaleString('en-IN') : '...'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Paid Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isEditingFee ? (
                          <div className="space-y-2">
                            <Input 
                              type="number"
                              name="paidAmount"
                              value={editedFee?.paidAmount || 0}
                              onChange={handleFeeInputChange}
                            />
                          </div>
                        ) : (
                          <div className="text-2xl font-bold">
                            ₹{feeDetails ? feeDetails.paidAmount.toLocaleString('en-IN') : '...'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Remaining</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₹{isEditingFee && editedFee 
                            ? editedFee.remainingFee.toLocaleString('en-IN') 
                            : feeDetails 
                              ? feeDetails.remainingFee.toLocaleString('en-IN') 
                              : '...'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Progress</h3>
                    <Progress 
                      value={feeDetails ? (feeDetails.paidAmount / feeDetails.totalFee) * 100 : 0} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{feeDetails ? `${((feeDetails.paidAmount / feeDetails.totalFee) * 100).toFixed(1)}%` : '0%'}</span>
                      <span>Last updated: {feeDetails ? new Date(feeDetails.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments">
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
                          <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No payment history available</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="expenses">
                <div className="space-y-4">
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between border-b pb-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{expense.amount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No expenses recorded</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetails;