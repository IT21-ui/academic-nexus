import api from "./apiClient";
import type {
  Department,
  PaginatedResponse,
  ApiResponse,
} from "@/types/models";

export const departmentApi = {

  async getDepartments(
    page: number = 1,
    perPage: number = 15,
    search: string = ""
  ): Promise<PaginatedResponse<Department>> {
    const response = await api.get<PaginatedResponse<Department>>(
      "/api/departments",
      {
        params: { page, per_page: perPage, search },
      }
    );

    return response.data;
  },

  // Get a single department by ID
  async getDepartment(id: number) {
    const response = await api.get<ApiResponse<Department>>(
      `/api/departments/${id}`
    );
    return response.data;
  },

  // Create a new department
  async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    head_id?: number;
  }) {
    const response = await api.post<ApiResponse<Department>>(
      "/api/departments",
      data
    );
    return response.data;
  },

  // Update an existing department
  async updateDepartment(
    id: number,
    data: Partial<{
      name: string;
      code: string;
      description?: string;
      head_id?: number;
    }>
  ) {
    const response = await api.put<ApiResponse<Department>>(
      `/api/departments/${id}`,
      data
    );
    return response.data;
  },

  // Delete a department
  async deleteDepartment(id: number) {
    const response = await api.delete<ApiResponse<null>>(
      `/api/departments/${id}`
    );
    return response.data;
  },
};

export default departmentApi;
