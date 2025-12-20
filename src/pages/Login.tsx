import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  User,
  BookOpen,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

const roles: {
  value: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "student",
    label: "Student",
    icon: User,
    description: "Access your grades and schedule",
  },
  {
    value: "instructor",
    label: "Instructor",
    icon: BookOpen,
    description: "Manage classes and grades",
  },
  {
    value: "admin",
    label: "Administrator",
    icon: Shield,
    description: "Full system access",
  },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Removed saved email suggestions dropdown for a simpler login form

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Welcome!",
          description: "You have successfully logged in.",
        });
        navigate("/dashboard");
      } else if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Video Background */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <video 
          src="/TrackED.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-right"
          onError={(e) => {
            console.error('Background video failed to load');
            // Fallback to gradient if video fails
            e.currentTarget.parentElement.className = 'hidden lg:flex lg:w-2/5 gradient-primary relative overflow-hidden';
          }}
        />
        
        {/* Optional: Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-2xl"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <img 
                src="/system.png" 
                alt="TrackED Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TrackED</h1>
              <p className="text-sm text-muted-foreground">
                Student Information System
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur-sm transition-all duration-300 hover:shadow-3xl hover:bg-background/100">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <img 
                    src="/system.png" 
                    alt="TrackED Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Welcome Back</CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to access your academic dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">

                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary border-input/50"
                      autoComplete="off"
                    />

                    {email && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary border-input/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold gradient-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                  >
                    Register here
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;