import api from "./apiClient";
import type { Class, PaginatedResponse, ApiResponse } from "@/types/models";

export const classApi = {
  // Get all classes (paginated)
  async getClasses(
    page: number = 1,
    perPage: number = 15,
    search: string = ""
  ): Promise<PaginatedResponse<Class>> {
    const response = await api.get<PaginatedResponse<Class>>("/api/classes", {
      params: {
        page,
        per_page: perPage,
        search,
      },
    });

    return response.data;
  },

  // Get a single class by ID
  async getClass(id: number) {
    const response = await api.get<ApiResponse<Class>>(`/api/classes/${id}`);
    return response.data;
  },

  // Create a new class
  async createClass(data: {
    subject_id: number;
    department_id?: number;
    section_id?: number;
    teacher_id: number;
    schedules: {
      day: number;
      timeStart: string;
      timeEnd: string;
    }[];
    student_ids?: number[];
  }) {
    const response = await api.post<ApiResponse<Class>>("/api/classes", data);
    return response.data;
  },

  // Update an existing class
  async updateClass(
    id: number,
    data: Partial<{
      subject_id: number;
      department_id?: number;
      section_id?: number;
      teacher_id: number;
      schedules: {
        day: number;
        timeStart: string;
        timeEnd: string;
      }[];
      studentIds?: number[];
      skipSectionStudents?: boolean;
    }>
  ) {
    const response = await api.put<ApiResponse<Class>>(
      `/api/classes/${id}`,
      data
    );
    return response.data;
  },

  // Delete a class
  async deleteClass(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/api/classes/${id}`);
    return response.data;
  },
};

export default classApi;
