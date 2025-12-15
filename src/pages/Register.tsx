import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  User,
  BookOpen,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import userApi from "@/services/userApi";
import departmentApi from "@/services/departmentApi";
import type { Department } from "@/types/models";
import { yearLevels } from "@/lib/contants";

type RegistrationType = "student" | "instructor";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("student");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    yearLevel: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getDepartments(1, 100);
        setDepartments(response.data);
      } catch (error) {
        toast({
          title: "Error loading departments",
          description: "Unable to load departments. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Find selected department ID (if any) based on name
    const selectedDept = departments.find(
      (dept) => dept.name === formData.department
    );

    if (!selectedDept) {
      toast({
        title: "Department Required",
        description: "Please select a valid department.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await userApi.createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: registrationType === "student" ? "student" : "instructor",
        password: formData.password,
        status: "pending",
        department_id: selectedDept.id,
        year_level: formData.yearLevel ? Number(formData.yearLevel) : null,
      });

      // If the request did not throw, assume success (backend may not wrap in ApiResponse)
      const createdEmail =
        (response as any)?.data?.email ||
        (response as any)?.email ||
        formData.email;

      setIsSubmitted(true);
      toast({
        title: "Registration Submitted!",
        description:
          "Your registration is pending admin approval. A confirmation will be sent to " +
          createdEmail +
          ".",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem connecting to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-card text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Registration Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your registration is pending admin approval. Once approved, you
              will receive your{" "}
              {registrationType === "student" ? "Student ID" : "Instructor ID"}{" "}
              via email.
            </p>
            <Button variant="gradient" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bTEyIDB2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptLTI0LTEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">TrackED</h1>
              <p className="text-primary-foreground/80">
                Student Information System
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold mb-4">
            Join Our Academic Community
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Register as a student or instructor to access your personalized
            dashboard, manage your academic records, and connect with the
            university system.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span>Fill out the registration form</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span>Wait for admin approval</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span>Receive your ID and start using the system</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TrackED</h1>
              <p className="text-sm text-muted-foreground">
                Student Information System
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="text-center pb-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Register as a new student or instructor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Registration Type Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRegistrationType("student")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    registrationType === "student"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegistrationType("instructor")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    registrationType === "instructor"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm font-medium">Instructor</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="JuanDelaCruz@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+63 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {registrationType === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="yearLevel">Year Level</Label>
                    <Select
                      value={formData.yearLevel}
                      onValueChange={(value) =>
                        handleInputChange("yearLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year level" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearLevels.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Registration"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
