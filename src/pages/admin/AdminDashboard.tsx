import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mockStudents,
  mockTeachers,
  mockDepartments,
  mockPendingRegistrations,
  mockSubjects,
  getTeacherFullName,
} from "@/data/mockData";
import {
  Users,
  BookOpen,
  Building,
  GraduationCap,
  UserPlus,
  Settings,
  Calendar,
  Shield,
  Check,
  X,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    { icon: UserPlus, label: "Add User", onClick: () => navigate("/users") },
    { icon: BookOpen, label: "Subjects", onClick: () => navigate("/subjects") },
    {
      icon: GraduationCap,
      label: "Teachers",
      onClick: () => navigate("/teachers"),
    },
    {
      icon: Building,
      label: "Departments",
      onClick: () => navigate("/departments"),
    },
  ];

  // Find department head name
  const getDepartmentHeadName = (dept: (typeof mockDepartments)[0]) => {
    if (dept.head_id) {
      const head = mockTeachers.find((t) => t.id === dept.head_id);
      return head ? getTeacherFullName(head) : "Not Assigned";
    }
    return "Not Assigned";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Summary */}
      <Card className="gradient-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name + " " + user?.last_name}
              </h2>
              <p className="text-primary-foreground/80">System Administrator</p>
              <p className="text-primary-foreground/80">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={mockStudents.length * 100}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Instructors"
          value={mockTeachers.length * 10}
          icon={GraduationCap}
          variant="secondary"
        />
        <StatCard
          title="Active Subjects"
          value={mockSubjects.length * 20}
          icon={BookOpen}
          variant="accent"
        />
        <StatCard
          title="Departments"
          value={mockDepartments.length}
          icon={Building}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pending User Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pending User Approvals</CardTitle>
              <Badge variant="secondary">
                {mockPendingRegistrations.length} pending
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPendingRegistrations.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {request.first_name} {request.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {request.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Requested: {request.request_date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="success" className="gap-1">
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate("/departments")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">
                        {dept.name}
                      </h4>
                      <Badge variant="secondary">{dept.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Head: {getDepartmentHeadName(dept)}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {dept.students_count || 0} students
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="w-4 h-4" />
                        {dept.teachers_count || 0} instructors
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <QuickActions actions={quickActions} title="Admin Actions" />

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Database", status: "Operational" },
                { label: "Authentication", status: "Operational" },
                { label: "File Storage", status: "Operational" },
                { label: "Email Service", status: "Operational" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-success">{item.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
