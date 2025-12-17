import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthContextType } from "@/types/auth";
import api from "@/services/apiClient";
import Loader from "@/components/loader/Loader";
import { User } from "@/types/models";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize CSRF protection
  const initializeCSRF = async () => {
    try {
      await api.get("/sanctum/csrf-cookie");
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
    }
  };

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initializeCSRF();
        const response = await api.get("/api/user");
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    try {
      await initializeCSRF();

      // Login request
      await api.post("/login", {
        email,
        password,
      });

      // Get user data
      const { data } = await api.get("/api/user");
      setUser(data);
      return { success: data };
    } catch (error) {
      console.error("Login failed:", error);
      return { error: error.response.data.message || "Failed to login" };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/api/user");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
