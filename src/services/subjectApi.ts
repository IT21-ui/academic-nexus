import api from "./apiClient";
import type { Subject, PaginatedResponse, ApiResponse } from "@/types/models";

export const subjectApi = {
  // Get all subjects (paginated)
  async getSubjects(
    page: number = 1,
    perPage: number = 15,
    search: string = "",
    departmentId?: number,
    yearLevelId?: number
  ): Promise<PaginatedResponse<Subject>> {
    const response = await api.get<PaginatedResponse<Subject>>(
      "/api/subjects",
      {
        params: {
          page,
          per_page: perPage,
          search,
          department_id: departmentId,
          year_level_id: yearLevelId,
        },
      }
    );

    return response.data;
  },

  // Get a single subject by ID
  async getSubject(id: number) {
    const response = await api.get<ApiResponse<Subject>>(`/api/subjects/${id}`);
    return response.data;
  },

  // Create a new subject
  async createSubject(data: {
    code: string;
    name: string;
    units: number;
    department_id: number;
    year_level?: number;
    description?: string;
  }) {
    const response = await api.post<ApiResponse<Subject>>(
      "/api/subjects",
      data
    );
    return response.data;
  },

  // Update an existing subject
  async updateSubject(
    id: number,
    data: Partial<{
      code: string;
      name: string;
      units: number;
      department_id: number;
      year_level?: number;
      description?: string;
    }>
  ) {
    const response = await api.put<ApiResponse<Subject>>(
      `/api/subjects/${id}`,
      data
    );
    return response.data;
  },

  // Delete a subject
  async deleteSubject(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/api/subjects/${id}`);
    return response.data;
  },
};

export default subjectApi;
