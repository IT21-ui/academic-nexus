import api from "./apiClient";
import {
  User,
  Student,
  Teacher,
  RegistrationRequest,
  PaginatedResponse,
  ApiResponse,
} from "@/types/models";

type UserRole = "student" | "instructor" | "administrator";

// User Management
export const userApi = {
  // Get all users with pagination
  async getUsers(
    page: number = 1,
    perPage: number = 15,
    role?: UserRole,
    search: string = ""
  ) {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      `/api/users`,
      {
        params: { page, per_page: perPage, role, search },
      }
    );
    return response.data;
  },

  // Get a single user by ID
  async getUser(id: number) {
    const response = await api.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data;
  },

  // Create a new user
  async createUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    password?: string;
    status?: "pending" | "approved" | "denied";
    department_id?: number;
    section_id?: number;
    year_level?: number;
  }) {
    const response = await api.post<User>("/api/users", userData);
    return response.data;
  },

  // Update an existing user
  async updateUser(
    id: number,
    userData: Partial<{
      first_name: string;
      last_name: string;
      email: string;
      role: UserRole;
      status: "pending" | "approved" | "denied";
      department_id?: number;
      section_id?: number;
      password?: string;
    }>
  ) {
    const response = await api.put<ApiResponse<User>>(
      `/api/users/${id}`,
      userData
    );
    return response.data;
  },

  // Delete a user
  async deleteUser(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/api/users/${id}`);
    return response.data;
  },

  // Student Management
  async getStudents(
    page: number = 1,
    perPage: number = 15,
    search: string = ""
  ) {
    const response = await api.get<PaginatedResponse<User>>(
      `/api/users/students`,
      {
        params: { page, per_page: perPage, search },
      }
    );
    return response.data;
  },

  async getStudent(id: number) {
    const response = await api.get<ApiResponse<User>>(
      `/api/users/students/${id}`
    );
    return response.data;
  },

  // Teacher Management
  async getTeachers(
    page: number = 1,
    perPage: number = 15,
    search: string = ""
  ) {
    const response = await api.get<PaginatedResponse<User>>(
      `/api/users/teachers`,
      {
        params: { page, per_page: perPage, search },
      }
    );
    return response.data;
  },

  async getTeacher(id: number) {
    const response = await api.get<ApiResponse<User>>(
      `/api/users/teachers/${id}`
    );
    return response.data;
  },

  // Registration Requests
  async getRegistrationRequests(
    status?: "pending" | "approved" | "denied",
    page: number = 1,
    perPage: number = 15
  ) {
    const response = await api.get<PaginatedResponse<RegistrationRequest>>(
      "/api/users/registration-requests",
      {
        params: { status, page, per_page: perPage },
      }
    );
    return response.data;
  },

  async getRegistrationRequest(id: number) {
    const response = await api.get<ApiResponse<RegistrationRequest>>(
      `/api/users/registration-requests/${id}`
    );
    return response.data;
  },

  async approveRegistrationRequest(id: number) {
    const response = await api.post<ApiResponse<RegistrationRequest>>(
      `/api/users/registration-requests/${id}/approve`
    );
    return response.data;
  },

  async rejectRegistrationRequest(id: number, reason?: string) {
    const response = await api.post<ApiResponse<RegistrationRequest>>(
      `/api/users/registration-requests/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  // Bulk operations
  async bulkUpdateUsers(
    ids: number[],
    data: { status?: "active" | "inactive"; role?: UserRole }
  ) {
    const response = await api.patch<ApiResponse<{ updated: number }>>(
      "/api/users/bulk-update",
      {
        user_ids: ids,
        ...data,
      }
    );
    return response.data;
  },

  // Profile management
  async updateProfile(
    userId: number,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    }
  ) {
    const response = await api.put<ApiResponse<User>>(
      `/api/users/${userId}/profile`,
      data
    );
    return response.data;
  },

  // Avatar upload
  async uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<ApiResponse<{ avatar_url: string }>>(
      `/api/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Check email availability
  async checkEmailAvailability(email: string) {
    const response = await api.get<ApiResponse<{ available: boolean }>>(
      "/api/check-email",
      {
        params: { email },
      }
    );
    return response.data;
  },
};

export default userApi;
