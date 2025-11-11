import { 
  FileText, 
  CreditCard, 
  Bell, 
  TrendingUp, 
  Receipt, 
  Users,
  Home,
  DollarSign
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Document Understanding", url: "/documents", icon: FileText },
  { title: "Secure Payments", url: "/payments", icon: CreditCard },
  { title: "Smart Reminders", url: "/reminders", icon: Bell },
  { title: "Financial Planning", url: "/planning", icon: TrendingUp },
  { title: "Expense Tracking", url: "/expenses", icon: Receipt },
  { title: "Family Dashboard", url: "/family", icon: Users },
  { title: "Student Details", url: "/student-details", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { pathname } = useLocation();
  // We'll use pathname in future for active link highlighting
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                EduFinanceAI
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}