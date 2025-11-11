import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, DollarSign, PiggyBank, Calculator, Lightbulb } from "lucide-react";

const Planning = () => {
  const budgetGoals = [
    {
      id: 1,
      category: "Tuition",
      budgeted: 18000,
      spent: 8500,
      remaining: 9500,
      progress: 47
    },
    {
      id: 2,
      category: "Books & Supplies",
      budgeted: 1200,
      spent: 380,
      remaining: 820,
      progress: 32
    },
    {
      id: 3,
      category: "Hostel & Food",
      budgeted: 6000,
      spent: 2400,
      remaining: 3600,
      progress: 40
    },
    {
      id: 4,
      category: "Transportation",
      budgeted: 800,
      spent: 150,
      remaining: 650,
      progress: 19
    }
  ];

  const savingsGoals = [
    {
      id: 1,
      title: "Spring 2024 Semester",
      target: 12000,
      current: 8500,
      progress: 71,
      deadline: "March 2024"
    },
    {
      id: 2,
      title: "Emergency Fund",
      target: 5000,
      current: 3200,
      progress: 64,
      deadline: "December 2024"
    },
    {
      id: 3,
      title: "Study Abroad Program",
      target: 15000,
      current: 2800,
      progress: 19,
      deadline: "June 2025"
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "Early Payment Discount",
      description: "Pay spring tuition by Jan 25th to save $425",
      impact: "High",
      savings: "$425"
    },
    {
      id: 2,
      title: "Textbook Optimization",
      description: "Consider digital or used books to save 40%",
      impact: "Medium",
      savings: "$280"
    },
    {
      id: 3,
      title: "Meal Plan Adjustment",
      description: "Switch to smaller meal plan based on usage",
      impact: "Medium",
      savings: "$150/month"
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-destructive";
    if (progress >= 60) return "text-warning-foreground";
    return "text-success";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Planning</h1>
          <p className="text-muted-foreground">
            Personalized budgeting advice and semester cost projections
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Calculator className="h-4 w-4 mr-2" />
          Budget Calculator
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$26,000</div>
            <p className="text-xs text-muted-foreground">
              Academic year 2024-2025
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent So Far</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$11,430</div>
            <p className="text-xs text-muted-foreground">
              44% of total budget
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,890</div>
            <p className="text-xs text-muted-foreground">
              To stay on track
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">$855</div>
            <p className="text-xs text-muted-foreground">
              With current optimizations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Financial Insights */}
      <Card className="bg-gradient-primary border-0">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
            <CardTitle className="text-primary-foreground">AI Financial Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-primary-foreground/90">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm">
                📈 <strong>Budget Performance:</strong> You're 6% under budget this semester - excellent control!
              </p>
              <p className="text-sm">
                💡 <strong>Smart Tip:</strong> Your textbook spending is 60% lower than average - great job finding deals!
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm">
                🎯 <strong>Opportunity:</strong> Early payment can save you $425 this month alone.
              </p>
              <p className="text-sm">
                📊 <strong>Prediction:</strong> Based on current trends, you'll finish $855 under budget.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget Tracking */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Budget Tracking</CardTitle>
            <CardDescription>Monitor spending across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetGoals.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{budget.category}</span>
                    <span className={`text-sm font-medium ${getProgressColor(budget.progress)}`}>
                      {budget.progress}%
                    </span>
                  </div>
                  <Progress value={budget.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                    <span>Remaining: ${budget.remaining.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track progress toward your financial targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">Target: {goal.deadline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${goal.current.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">of ${goal.target.toLocaleString()}</p>
                    </div>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {goal.progress}% complete
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to optimize your finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <Badge 
                    variant={rec.impact === 'High' ? 'default' : rec.impact === 'Medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-success">Save {rec.savings}</span>
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning Tools */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Budget Calculator</CardTitle>
            <CardDescription>
              Plan your semester expenses with our smart calculator
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-success" />
            </div>
            <CardTitle>Goal Setting</CardTitle>
            <CardDescription>
              Set and track financial goals with AI-powered milestones
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle>Semester Planning</CardTitle>
            <CardDescription>
              Plan ahead for upcoming semesters and major expenses
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Planning;