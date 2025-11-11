import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Brain, CreditCard, Bell, FileText, TrendingUp, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/financial-hero.jpg";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    const formData = new FormData();
    if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }
    }

    setUploadProgress(0);
    setUploadError(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // @ts-ignore
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      setUploadProgress(100);
      // Optionally, handle the response from the server
      // const data = await response.json();
      // console.log(data);
    } catch (error: any) {
      setUploadError(error.message);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EduFinanceAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Brain className="h-4 w-4 mr-2" />
                  AI-Powered Financial Assistant
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                  Simplify Your Child's{" "}
                  <span className="bg-accent bg-clip-text text-transparent">
                    Education Finances
                  </span>
                </h1>
                <p className="text-xl text-primary-foreground/80 leading-relaxed">
                  Take the stress out of managing university payments with our AI assistant that 
                  understands complex financial documents and automates your payment management.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" variant="financial" className="w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Financial Dashboard Preview" 
                className="rounded-2xl shadow-float animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-4">AI Insights</h3>
          <p>Placeholder for AI-generated insights.</p>
        </div>
      </section>

      {/* Recent Documents Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-4">Recent Documents</h3>
          <p>Placeholder for recent documents list.</p>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-4">Upload Documents</h3>
          <Input type="file" onChange={handleFileChange} multiple />
          <Button onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0}>
            Upload
          </Button>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p>Uploading... {uploadProgress}%</p>
          )}
          {uploadProgress === 100 && <p style={{ color: 'green' }}>Upload complete!</p>}
          {uploadError && <p style={{ color: 'red' }}>Error: {uploadError}</p>}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Manage Education Finances
            </h2>
            <p className="text-xl text-muted-foreground">
              Our AI assistant handles the complexity so you can focus on what matters most
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Document Understanding</CardTitle>
                <CardDescription>
                  AI-powered analysis of complex fee structures, invoices, and payment schedules
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Integrated payment gateway with bank-grade security for tuition and fees
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-warning-foreground" />
                </div>
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  Automated notifications for upcoming payments and important deadlines
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Financial Planning</CardTitle>
                <CardDescription>
                  Personalized budgeting advice and semester cost projections
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Expense Tracking</CardTitle>
                <CardDescription>
                  Comprehensive tracking of tuition, books, hostel, and other education expenses
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Family Dashboard</CardTitle>
                <CardDescription>
                  Shared access for parents and students to stay aligned on finances
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Placeholder UI Elements */}
      <section className="py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button>Smart Extraction</Button>
          <Button>Data Validation</Button>
          <Button>Smart Alerts</Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Simplify Your Education Finances?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who have reduced their financial stress with EduFinanceAI
          </p>
          <Link to="/register">
            <Button size="lg" variant="financial" className="bg-white text-primary hover:bg-white/90">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-gradient-primary rounded-md flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">EduFinanceAI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 EduFinanceAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;