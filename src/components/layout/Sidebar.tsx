import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  Building,
  UserCog,
  FileSpreadsheet,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const studentLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/subjects", icon: BookOpen, label: "My Subjects" },
  { to: "/schedule", icon: Calendar, label: "Class Schedule" },
  { to: "/grades", icon: FileSpreadsheet, label: "My Grades" },
  { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
];

const instructorLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/my-classes", icon: BookOpen, label: "My Classes" },
  { to: "/grade-entry", icon: FileSpreadsheet, label: "Grade Entry" },
  { to: "/attendance-entry", icon: ClipboardCheck, label: "Attendance" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
];

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "User Management" },
  { to: "/subject-management", icon: BookOpen, label: "Subjects" },
  { to: "/teachers", icon: GraduationCap, label: "Teachers" },
  { to: "/departments", icon: Building, label: "Departments" },
  { to: "/class-management", icon: Calendar, label: "Class Management" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links =
    user?.role === "admin" || user?.role === "administrator"
      ? adminLinks
      : user?.role === "instructor"
      ? instructorLinks
      : studentLinks;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen gradient-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-sidebar-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                EduSIS
              </h1>
              <p className="text-xs text-sidebar-foreground/70">
                Student Information
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div
        className={cn(
          "p-4 border-b border-sidebar-border",
          collapsed ? "flex justify-center" : ""
        )}
      >
        <div
          className={cn("flex items-center gap-3", collapsed ? "flex-col" : "")}
        >
          <Avatar className="w-12 h-12 border-2 border-sidebar-accent">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-semibold">
              {user ? getInitials(user.first_name + " " + user.last_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user.first_name + " " + user.last_name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-sidebar-foreground",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
