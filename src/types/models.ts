// Types matching Laravel backend models

export type UserRole = "student" | "instructor" | "admin" | "administrator";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: "pending" | "approved" | "denied";
  section_id?: number;
  department_id?: number;
  department?: Department;
  year_level?: number;
  subjects?: Subject[];
  created_at?: string;
  updated_at?: string;
  classes_count?: number;
}

export interface Student extends User {
  role: "student";
  grade?: Grade;
  grades?: Grade[];
}

export interface Teacher extends User {
  role: "instructor";
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
  created_at?: string;
  updated_at?: string;
  // Relationships
  department?: Department;
  year_level?: number;
  sections?: Section[];
  classes_count?: number;
}

export interface Section {
  id: number;
  name: string; // e.g., "Section A", "Section B"
  department_id: number;
  max_students: number;
  year_level: number;
  room: string;
  created_at?: string;
  updated_at?: string;
  students?: User[];
  subjects?: Subject[];
  department?: Department;
  student_count?: number;
  classes_count?: number;
}

export interface SubjectAssignment {
  id: number;
  section_id: number;
  student_id: number;
  enrolled_at: string;
  status: "enrolled" | "dropped" | "completed";
  created_at?: string;
  updated_at?: string;
  // Relationships
  section?: Section;
  student?: Student;
}

export interface Grade {
  id: number;
  student_id: number;
  midterm?: number;
  finals?: number;
  final_grade?: number;
  remarks?: string;
  status: "pending" | "submitted" | "approved";
  created_at?: string;
  updated_at?: string;
  // Relationships
  student?: Student;
  class?: Class;
}

export interface Attendance {
  id: number;
  student_id: number;
  section_id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
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
  role: "student" | "instructor";
  department_id: number;
  year_level_id?: number; // Only for students
  password: string;
  status: "pending" | "approved" | "denied";
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
  role: "student" | "instructor" | "admin";
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
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

export interface Schedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  is_online?: boolean;
}

export interface RegistrationData {
  user: User;
  classes: Class[];
  academicYear?: string;
  program?: string;
  registrarName?: string;
  registrarTitle?: string;
  dateEnrolled?: string;
  tuitionFee?: number;
  miscFee?: number;
}

export interface Class {
  id: number;
  subject: Subject;
  section?: Section;
  teacher: Teacher;
  schedules: Schedule[];
  students: Student[];
  department_id: number;
  department: Department;
}
