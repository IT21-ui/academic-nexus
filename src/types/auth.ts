import { User } from "./models";

export type UserRole = "student" | "instructor" | "admin" | "administrator";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}
