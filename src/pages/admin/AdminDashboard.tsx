import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import userApi from "@/services/userApi";
import departmentApi from "@/services/departmentApi";
import subjectApi from "@/services/subjectApi";
import type { Department, RegistrationRequest } from "@/types/models";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([]);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

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
      label: "Programs",
      onClick: () => navigate("/programs"),
    },
  ];

  const getProgramHeadName = (dept: Department) => {
    if (dept.head && dept.head.first_name && dept.head.last_name) {
      return `${dept.head.first_name} ${dept.head.last_name}`;
    }

    return "Not Assigned";
  };

  const handleApprove = async (request: RegistrationRequest) => {
    try {
      setActionUserId(request.id);
      await userApi.approveRegistrationRequest(request.id);

      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));

      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });

      toast({
        title: "User approved",
        description: `${request.first_name} ${request.last_name} has been approved.`,
      });
    } catch (error) {
      toast({
        title: "Error approving user",
        description: "There was a problem approving this registration.",
        variant: "destructive",
      });
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeny = async (request: RegistrationRequest) => {
    try {
      setActionUserId(request.id);
      await userApi.rejectRegistrationRequest(request.id);

      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));

      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });

      toast({
        title: "User denied",
        description: `${request.first_name} ${request.last_name} has been denied.`,
      });
    } catch (error) {
      toast({
        title: "Error denying user",
        description: "There was a problem denying this registration.",
        variant: "destructive",
      });
    } finally {
      setActionUserId(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentsRes, teachersRes] = await Promise.all([
          userApi.getStudents(1, 1),
          userApi.getTeachers(1, 1),
        ]);

        setStudentCount(studentsRes.total || 0);
        setTeacherCount(teachersRes.total || 0);

        const subjectsRes = await subjectApi.getSubjects(1, 1);
        setSubjectCount(subjectsRes.total || (subjectsRes.data?.length ?? 0));

        const departmentsRes = await departmentApi.getDepartments(1, 100);
        setDepartments(departmentsRes.data || []);

        const pendingRes = await userApi.getRegistrationRequests("pending", 1, 10);
        setPendingRequests(pendingRes?.data || []);
      } catch (err: any) {
        setError("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.first_name}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-red-500">{error}</CardContent>
        </Card>
      </div>
    );
  }

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
          value={studentCount}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Instructors"
          value={teacherCount}
          icon={GraduationCap}
          variant="secondary"
        />
        <StatCard
          title="Active Subjects"
          value={subjectCount}
          icon={BookOpen}
          variant="accent"
        />
        <StatCard
          title="Programs"
          value={departments.length}
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
                {pendingRequests.length} pending
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => (
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
                    <Button
                      size="sm"
                      variant="success"
                      className="gap-1"
                      onClick={() => handleApprove(request)}
                      disabled={actionUserId === request.id}
                    >
                      {actionUserId === request.id ? (
                        <span className="text-xs">Approving...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleDeny(request)}
                      disabled={actionUserId === request.id}
                    >
                      {actionUserId === request.id ? (
                        <span className="text-xs">Denying...</span>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Deny
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Program Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Program Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate("/programs")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">
                        {dept.name}
                      </h4>
                      <Badge variant="secondary">{dept.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Head: {getProgramHeadName(dept)}
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
        </div>
      </div>
    </div>
  );
}
;

export default AdminDashboard;
