import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, User, BookOpen, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'student', label: 'Student', icon: User, description: 'Access your grades and schedule' },
  { value: 'instructor', label: 'Instructor', icon: BookOpen, description: 'Manage classes and grades' },
  { value: 'admin', label: 'Administrator', icon: Shield, description: 'Full system access' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(userId, password, selectedRole);
      if (success) {
        toast({
          title: 'Welcome!',
          description: 'You have successfully logged in.',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoCredentials = () => {
    switch (selectedRole) {
      case 'student':
        return { id: 'STU001', password: 'password123' };
      case 'instructor':
        return { id: 'INS001', password: 'password123' };
      case 'admin':
        return { id: 'ADM001', password: 'password123' };
    }
  };

  const fillDemo = () => {
    const creds = getDemoCredentials();
    setUserId(creds.id);
    setPassword(creds.password);
  };

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
              <h1 className="text-4xl font-bold">EduSIS</h1>
              <p className="text-primary-foreground/80">Student Information System</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4">
            Manage Your Academic Journey
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Access grades, schedules, and academic records all in one place. 
            A comprehensive system for students, instructors, and administrators.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Students', value: '2,500+' },
              { label: 'Instructors', value: '150+' },
              { label: 'Courses', value: '300+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EduSIS</h1>
              <p className="text-sm text-muted-foreground">Student Information System</p>
            </div>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Select your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      selectedRole === role.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <role.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">
                    {selectedRole === 'student' ? 'Student ID' : 
                     selectedRole === 'instructor' ? 'Instructor ID' : 'Admin ID'}
                  </Label>
                  <Input
                    id="userId"
                    placeholder={`Enter your ${selectedRole} ID`}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  Demo credentials for {selectedRole}:
                </p>
                <div className="flex items-center justify-between text-sm">
                  <code className="bg-background px-2 py-1 rounded text-xs">
                    {getDemoCredentials().id} / password123
                  </code>
                  <Button variant="ghost" size="sm" onClick={fillDemo}>
                    Fill
                  </Button>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <a href="/register" className="text-primary hover:underline font-medium">
                  Register here
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
