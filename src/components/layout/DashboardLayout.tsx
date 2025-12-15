import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Search, Calendar, UserCog, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { SettingsModal } from "@/components/ui/SettingsModal";

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRoleIcon = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin" || role === "administrator") {
      return UserCog;
    }
    if (role === "instructor") {
      return GraduationCap;
    }
    return BookOpen;
  };

  const getRoleGradient = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin" || role === "administrator") {
      return "from-blue-600 to-purple-600";
    }
    if (role === "instructor") {
      return "from-blue-600 to-purple-600";
    }
    return "from-blue-500 to-purple-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getRoleGradient()} shadow-lg`}>
                {React.createElement(getRoleIcon(), { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.first_name}! ✨
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-medium">{currentDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64 bg-muted/50"
                />
              </div>

              <NotificationDropdown />

              <SettingsModal />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
