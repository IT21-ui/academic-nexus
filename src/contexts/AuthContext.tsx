import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  'STU001': {
    id: 'STU001',
    name: 'John Anderson',
    email: 'john.anderson@university.edu',
    role: 'student',
    studentId: 'STU001',
    department: 'Computer Science',
    avatar: '',
  },
  'INS001': {
    id: 'INS001',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@university.edu',
    role: 'instructor',
    instructorId: 'INS001',
    department: 'Computer Science',
    avatar: '',
  },
  'ADM001': {
    id: 'ADM001',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'admin',
    department: 'Administration',
    avatar: '',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (id: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = mockUsers[id];
    if (mockUser && mockUser.role === role && password === 'password123') {
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
