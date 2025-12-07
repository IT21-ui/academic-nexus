// API Service for Laravel Backend Integration
// This file contains placeholder functions that will connect to the Laravel backend

import type {
  Student,
  Teacher,
  Department,
  YearLevel,
  Subject,
  Section,
  Grade,
  Attendance,
  RegistrationRequest,
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/types/models';

// Base API URL - will be replaced with actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}

// ============ Authentication API ============

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const result = await apiCall<void>('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    return result;
  },

  register: async (data: Partial<RegistrationRequest>): Promise<ApiResponse<RegistrationRequest>> => {
    return apiCall<RegistrationRequest>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/user');
  },
};

// ============ Department API ============

export const departmentApi = {
  getAll: async (): Promise<ApiResponse<Department[]>> => {
    return apiCall<Department[]>('/departments');
  },

  getById: async (id: number): Promise<ApiResponse<Department>> => {
    return apiCall<Department>(`/departments/${id}`);
  },

  create: async (data: Partial<Department>): Promise<ApiResponse<Department>> => {
    return apiCall<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    return apiCall<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/departments/${id}`, { method: 'DELETE' });
  },
};

// ============ Year Level API ============

export const yearLevelApi = {
  getAll: async (): Promise<ApiResponse<YearLevel[]>> => {
    return apiCall<YearLevel[]>('/year-levels');
  },

  getById: async (id: number): Promise<ApiResponse<YearLevel>> => {
    return apiCall<YearLevel>(`/year-levels/${id}`);
  },

  create: async (data: Partial<YearLevel>): Promise<ApiResponse<YearLevel>> => {
    return apiCall<YearLevel>('/year-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<YearLevel>): Promise<ApiResponse<YearLevel>> => {
    return apiCall<YearLevel>(`/year-levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/year-levels/${id}`, { method: 'DELETE' });
  },
};

// ============ Subject API ============

export const subjectApi = {
  getAll: async (params?: { department_id?: number; year_level_id?: number }): Promise<ApiResponse<Subject[]>> => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiCall<Subject[]>(`/subjects${queryString}`);
  },

  getById: async (id: number): Promise<ApiResponse<Subject>> => {
    return apiCall<Subject>(`/subjects/${id}`);
  },

  create: async (data: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    return apiCall<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    return apiCall<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/subjects/${id}`, { method: 'DELETE' });
  },
};

// ============ Section API ============

export const sectionApi = {
  getAll: async (subjectId?: number): Promise<ApiResponse<Section[]>> => {
    const queryString = subjectId ? `?subject_id=${subjectId}` : '';
    return apiCall<Section[]>(`/sections${queryString}`);
  },

  getById: async (id: number): Promise<ApiResponse<Section>> => {
    return apiCall<Section>(`/sections/${id}`);
  },

  create: async (data: Partial<Section>): Promise<ApiResponse<Section>> => {
    return apiCall<Section>('/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Section>): Promise<ApiResponse<Section>> => {
    return apiCall<Section>(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/sections/${id}`, { method: 'DELETE' });
  },

  addStudent: async (sectionId: number, studentId: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/sections/${sectionId}/students`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  removeStudent: async (sectionId: number, studentId: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/sections/${sectionId}/students/${studentId}`, {
      method: 'DELETE',
    });
  },

  getStudents: async (sectionId: number): Promise<ApiResponse<Student[]>> => {
    return apiCall<Student[]>(`/sections/${sectionId}/students`);
  },
};

// ============ Student API ============

export const studentApi = {
  getAll: async (params?: { department_id?: number; year_level_id?: number; status?: string }): Promise<ApiResponse<Student[]>> => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiCall<Student[]>(`/students${queryString}`);
  },

  getById: async (id: number): Promise<ApiResponse<Student>> => {
    return apiCall<Student>(`/students/${id}`);
  },

  getByStudentId: async (studentId: string): Promise<ApiResponse<Student>> => {
    return apiCall<Student>(`/students/by-student-id/${studentId}`);
  },

  update: async (id: number, data: Partial<Student>): Promise<ApiResponse<Student>> => {
    return apiCall<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/students/${id}`, { method: 'DELETE' });
  },

  getGrades: async (studentId: number): Promise<ApiResponse<Grade[]>> => {
    return apiCall<Grade[]>(`/students/${studentId}/grades`);
  },

  getAttendance: async (studentId: number): Promise<ApiResponse<Attendance[]>> => {
    return apiCall<Attendance[]>(`/students/${studentId}/attendance`);
  },

  getSchedule: async (studentId: number): Promise<ApiResponse<Section[]>> => {
    return apiCall<Section[]>(`/students/${studentId}/schedule`);
  },

  getSubjects: async (studentId: number): Promise<ApiResponse<Subject[]>> => {
    return apiCall<Subject[]>(`/students/${studentId}/subjects`);
  },
};

// ============ Teacher API ============

export const teacherApi = {
  getAll: async (params?: { department_id?: number; status?: string }): Promise<ApiResponse<Teacher[]>> => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiCall<Teacher[]>(`/teachers${queryString}`);
  },

  getById: async (id: number): Promise<ApiResponse<Teacher>> => {
    return apiCall<Teacher>(`/teachers/${id}`);
  },

  getByTeacherId: async (teacherId: string): Promise<ApiResponse<Teacher>> => {
    return apiCall<Teacher>(`/teachers/by-teacher-id/${teacherId}`);
  },

  update: async (id: number, data: Partial<Teacher>): Promise<ApiResponse<Teacher>> => {
    return apiCall<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/teachers/${id}`, { method: 'DELETE' });
  },

  getSections: async (teacherId: number): Promise<ApiResponse<Section[]>> => {
    return apiCall<Section[]>(`/teachers/${teacherId}/sections`);
  },
};

// ============ Grade API ============

export const gradeApi = {
  getBySection: async (sectionId: number): Promise<ApiResponse<Grade[]>> => {
    return apiCall<Grade[]>(`/sections/${sectionId}/grades`);
  },

  update: async (gradeId: number, data: Partial<Grade>): Promise<ApiResponse<Grade>> => {
    return apiCall<Grade>(`/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  bulkUpdate: async (sectionId: number, grades: Partial<Grade>[]): Promise<ApiResponse<Grade[]>> => {
    return apiCall<Grade[]>(`/sections/${sectionId}/grades/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ grades }),
    });
  },
};

// ============ Attendance API ============

export const attendanceApi = {
  getBySection: async (sectionId: number, date?: string): Promise<ApiResponse<Attendance[]>> => {
    const queryString = date ? `?date=${date}` : '';
    return apiCall<Attendance[]>(`/sections/${sectionId}/attendance${queryString}`);
  },

  record: async (data: Partial<Attendance>): Promise<ApiResponse<Attendance>> => {
    return apiCall<Attendance>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  bulkRecord: async (sectionId: number, date: string, records: { student_id: number; status: string }[]): Promise<ApiResponse<Attendance[]>> => {
    return apiCall<Attendance[]>(`/sections/${sectionId}/attendance/bulk`, {
      method: 'POST',
      body: JSON.stringify({ date, records }),
    });
  },
};

// ============ Admin API ============

export const adminApi = {
  getPendingRegistrations: async (): Promise<ApiResponse<RegistrationRequest[]>> => {
    return apiCall<RegistrationRequest[]>('/admin/pending-registrations');
  },

  approveRegistration: async (id: number): Promise<ApiResponse<{ student_id?: string; teacher_id?: string }>> => {
    return apiCall('/admin/registrations/${id}/approve', {
      method: 'POST',
    });
  },

  denyRegistration: async (id: number, reason?: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/admin/registrations/${id}/deny`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getSystemStats: async (): Promise<ApiResponse<{
    total_students: number;
    total_teachers: number;
    total_subjects: number;
    total_sections: number;
    pending_registrations: number;
  }>> => {
    return apiCall('/admin/stats');
  },

  getSystemReport: async (type: string, params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/admin/reports/${type}${queryString}`);
  },
};

export default {
  auth: authApi,
  departments: departmentApi,
  yearLevels: yearLevelApi,
  subjects: subjectApi,
  sections: sectionApi,
  students: studentApi,
  teachers: teacherApi,
  grades: gradeApi,
  attendance: attendanceApi,
  admin: adminApi,
};
