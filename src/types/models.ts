// Types matching Laravel backend models

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'pending' | 'approved' | 'denied';
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_id: string; // Generated student ID like STU001
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: number;
  year_level_id: number;
  status: 'pending' | 'approved' | 'denied';
  created_at?: string;
  updated_at?: string;
  // Relationships
  department?: Department;
  year_level?: YearLevel;
  user?: User;
}

export interface Teacher {
  id: number;
  user_id: number;
  teacher_id: string; // Generated teacher ID like INS001
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: number;
  status: 'pending' | 'approved' | 'denied';
  created_at?: string;
  updated_at?: string;
  // Relationships
  department?: Department;
  user?: User;
  subjects?: Subject[];
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_id?: number;
  created_at?: string;
  updated_at?: string;
  // Computed/Relationship
  head?: Teacher;
  students_count?: number;
  teachers_count?: number;
}

export interface YearLevel {
  id: number;
  name: string; // e.g., "1st Year", "2nd Year"
  level: number; // 1, 2, 3, 4
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string;
  units: number;
  department_id: number;
  year_level_id: number;
  created_at?: string;
  updated_at?: string;
  // Relationships
  department?: Department;
  year_level?: YearLevel;
  sections?: Section[];
}

export interface Section {
  id: number;
  name: string; // e.g., "Section A", "Section B"
  subject_id: number;
  teacher_id: number;
  schedule_day: string;
  schedule_time: string;
  room: string;
  max_students?: number;
  created_at?: string;
  updated_at?: string;
  // Relationships
  subject?: Subject;
  teacher?: Teacher;
  students?: Student[];
  student_count?: number;
}

export interface SubjectAssignment {
  id: number;
  section_id: number;
  student_id: number;
  enrolled_at: string;
  status: 'enrolled' | 'dropped' | 'completed';
  created_at?: string;
  updated_at?: string;
  // Relationships
  section?: Section;
  student?: Student;
}

export interface Grade {
  id: number;
  student_id: number;
  section_id: number;
  midterm?: number;
  finals?: number;
  final_grade?: number;
  remarks?: string;
  status: 'pending' | 'submitted' | 'approved';
  created_at?: string;
  updated_at?: string;
  // Relationships
  student?: Student;
  section?: Section;
}

export interface Attendance {
  id: number;
  student_id: number;
  section_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  // Relationships
  student?: Student;
  section?: Section;
}

// Registration request types
export interface RegistrationRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor';
  department_id: number;
  year_level_id?: number; // Only for students
  password: string;
  status: 'pending' | 'approved' | 'denied';
  request_date: string;
  reviewed_at?: string;
  reviewed_by?: number;
  created_at?: string;
  updated_at?: string;
  // Relationships
  department?: Department;
  year_level?: YearLevel;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Auth types for login
export interface LoginCredentials {
  id: string; // Student ID or Teacher ID
  password: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  student_id?: string;
  teacher_id?: string;
  department?: Department;
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  token: string;
  message?: string;
}
