import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Calendar, Mail, Smartphone, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const Reminders = () => {
  const upcomingReminders = [
    {
      id: 1,
      title: "Library Fee Payment Due",
      description: "Annual library access fee payment",
      amount: "$150",
      dueDate: "Jan 25, 2024",
      daysLeft: 3,
      priority: "high",
      type: "payment"
    },
    {
      id: 2,
      title: "Lab Fee Payment Due", 
      description: "Chemistry lab equipment fee",
      amount: "$300",
      dueDate: "Feb 1, 2024",
      daysLeft: 10,
      priority: "medium",
      type: "payment"
    },
    {
      id: 3,
      title: "Early Payment Discount Expires",
      description: "5% discount on next semester tuition",
      amount: "Save $425",
      dueDate: "Jan 25, 2024",
      daysLeft: 3,
      priority: "high",
      type: "discount"
    },
    {
      id: 4,
      title: "Sports Fee Payment",
      description: "Annual sports facility access",
      amount: "$100",
      dueDate: "Feb 15, 2024",
      daysLeft: 24,
      priority: "low",
      type: "payment"
    }
  ];

  const reminderSettings = [
    { id: 1, title: "Payment Due Reminders", description: "Get notified before payment deadlines", enabled: true },
    { id: 2, title: "Early Payment Discounts", description: "Alerts for available discounts", enabled: true },
    { id: 3, title: "Document Upload Reminders", description: "Reminders to upload required documents", enabled: false },
    { id: 4, title: "Budget Alerts", description: "Notifications when approaching budget limits", enabled: true },
    { id: 5, title: "Semester Planning", description: "Reminders for upcoming semester preparations", enabled: true }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-warning-foreground" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Reminders</h1>
          <p className="text-muted-foreground">
            Automated notifications for upcoming payments and important deadlines
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Bell className="h-4 w-4 mr-2" />
          Test Reminder
        </Button>
      </div>

      {/* Active Alerts */}
      <Card className="bg-gradient-primary border-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-primary-foreground" />
            <h3 className="text-lg font-semibold text-primary-foreground">Active Alerts</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-primary-foreground/90">
            <div className="text-sm">
              🔔 <strong>2 High Priority</strong><br />
              Payments due within 3 days
            </div>
            <div className="text-sm">
              ⚡ <strong>Smart Scheduling</strong><br />
              AI optimizes reminder timing for maximum effectiveness
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>Important deadlines and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                    {getPriorityIcon(reminder.priority)}
                  </div>
                  <div>
                    <h4 className="font-medium">{reminder.title}</h4>
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>Due: {reminder.dueDate}</span>
                      <span>•</span>
                      <span>{reminder.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <div>
                    <p className="font-medium">{reminder.amount}</p>
                    {getPriorityBadge(reminder.priority)}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Snooze</Button>
                    <Button variant="hero" size="sm">Take Action</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Customize your reminder preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reminderSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor={`setting-${setting.id}`} className="font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={`setting-${setting.id}`}
                  checked={setting.enabled}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Methods */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Delivery Methods</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">john.doe@email.com</p>
                  </div>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <Switch checked={false} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Bell className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Browser and mobile app</p>
                  </div>
                </div>
                <Switch checked={true} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Sync with Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Smart Timing</CardTitle>
            <CardDescription>
              AI learns your habits to send reminders at optimal times
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-success" />
            </div>
            <CardTitle>Priority Detection</CardTitle>
            <CardDescription>
              Automatically prioritizes reminders based on urgency and impact
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
              <Bell className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle>Multi-Channel</CardTitle>
            <CardDescription>
              Receive notifications via email, SMS, and push notifications
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Reminders;