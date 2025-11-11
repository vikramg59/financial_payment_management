import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import { Users, Plus, MessageSquare, Bell, Eye, Settings, Share2, Calendar } from "lucide-react";

const Family = () => {
  const familyMembers = [
    {
      id: 1,
      name: "John Doe",
      role: "Parent",
      email: "john.doe@email.com",
      avatar: "/placeholder.svg",
      status: "active",
      lastActive: "2 minutes ago",
      permissions: ["view", "edit", "payment"]
    },
    {
      id: 2,
      name: "Sarah Doe",
      role: "Parent",
      email: "sarah.doe@email.com",
      avatar: "/placeholder.svg",
      status: "active",
      lastActive: "5 minutes ago",
      permissions: ["view", "edit"]
    },
    {
      id: 3,
      name: "Emily Doe",
      role: "Student",
      email: "emily.doe@student.edu",
      avatar: "/placeholder.svg",
      status: "offline",
      lastActive: "2 hours ago",
      permissions: ["view", "upload"]
    },
    {
      id: 4,
      name: "Robert Doe",
      role: "Guardian",
      email: "robert.doe@email.com",
      avatar: "/placeholder.svg",
      status: "active",
      lastActive: "1 hour ago",
      permissions: ["view"]
    }
  ];

  const sharedGoals = [
    {
      id: 1,
      title: "Spring 2024 Tuition",
      target: 12000,
      current: 8500,
      contributors: ["John Doe", "Sarah Doe"],
      progress: 71,
      deadline: "March 1, 2024"
    },
    {
      id: 2,
      title: "Study Abroad Fund",
      target: 15000,
      current: 3200,
      contributors: ["John Doe", "Sarah Doe", "Robert Doe"],
      progress: 21,
      deadline: "June 1, 2025"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Doe",
      action: "made a payment",
      description: "Lab Fee - ₹150",
      timestamp: "2 hours ago",
      type: "payment"
    },
    {
      id: 2,
      user: "Emily Doe",
      action: "uploaded document",
      description: "Spring 2024 Fee Invoice",
      timestamp: "5 hours ago",
      type: "document"
    },
    {
      id: 3,
      user: "John Doe",
      action: "set budget limit",
      description: "Books & Supplies - ₹800",
      timestamp: "1 day ago",
      type: "budget"
    },
    {
      id: 4,
      user: "Robert Doe",
      action: "contributed to goal",
      description: "Study Abroad Fund - ₹500",
      timestamp: "2 days ago",
      type: "contribution"
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Parent':
        return <Badge className="bg-primary/10 text-primary">Parent</Badge>;
      case 'Student':
        return <Badge className="bg-success/10 text-success">Student</Badge>;
      case 'Guardian':
        return <Badge className="bg-accent/10 text-accent-foreground">Guardian</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const getStatusIndicator = (status: string) => {
    return (
      <div className={`h-3 w-3 rounded-full ${
        status === 'active' ? 'bg-success' : 'bg-muted'
      }`}></div>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'document':
        return '📄';
      case 'budget':
        return '💰';
      case 'contribution':
        return '🎯';
      default:
        return '📝';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-muted-foreground">
            Shared access for parents and students to stay aligned on finances
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Family Overview */}
      <Card className="bg-gradient-primary border-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-primary-foreground" />
            <h3 className="text-lg font-semibold text-primary-foreground">Family Financial Overview</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-primary-foreground/90">
            <div className="text-sm">
              👨‍👩‍👧‍👦 <strong>4 Active Members</strong><br />
              All family members have access to financial information
            </div>
            <div className="text-sm">
              🎯 <strong>2 Shared Goals</strong><br />
              Working together toward common financial objectives
            </div>
            <div className="text-sm">
              🔒 <strong>Secure Sharing</strong><br />
              Bank-grade encryption protects all shared data
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family Members */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Family Members</CardTitle>
                <CardDescription>Manage access and permissions</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIndicator(member.status)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.name}</h4>
                        {getRoleBadge(member.role)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{member.email}</span>
                        <span>•</span>
                        <span>Active {member.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">
                      {member.permissions.join(', ')}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Family collaboration tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Invite Family Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Share2 className="h-4 w-4 mr-2" />
              Share Financial Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Set Family Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Family Meeting
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Shared Goals */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Shared Financial Goals</CardTitle>
          <CardDescription>Family savings goals and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {sharedGoals.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">Due: {goal.deadline}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{goal.current.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">of ₹{goal.target.toLocaleString()}</p>
                  </div>
                </div>
                
                <Progress value={goal.progress} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Contributors: {goal.contributors.join(', ')}
                  </div>
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Contribute to Goal
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Family Activity */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Recent Family Activity</CardTitle>
          <CardDescription>What's happening with your family finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Collaborative Planning</CardTitle>
            <CardDescription>
              Work together on financial goals and budget planning
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-2">
              <Share2 className="h-6 w-6 text-success" />
            </div>
            <CardTitle>Secure Sharing</CardTitle>
            <CardDescription>
              Share financial information securely with family members
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
              <Bell className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle>Family Alerts</CardTitle>
            <CardDescription>
              Keep everyone informed about important financial updates
            </CardDescription>
          </CardHeader>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Family;