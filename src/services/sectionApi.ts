import api from "./apiClient";
import type {
  Section,
  PaginatedResponse,
  ApiResponse,
  User,
} from "@/types/models";

export const sectionApi = {
  // Get all sections (paginated)
  async getSections(
    page: number = 1,
    perPage: number = 15,
    search: string = "",
    departmentId?: number,
    yearLevel?: number
  ): Promise<PaginatedResponse<Section>> {
    const params: any = {
      page,
      per_page: perPage,
    };

    if (search) params.search = search;
    if (departmentId) params.department_id = departmentId;
    if (yearLevel) params.year_level = yearLevel;

    const response = await api.get<PaginatedResponse<Section>>(
      "/api/sections",
      {
        params,
      }
    );

    return response.data;
  },

  // Get a single section by ID
  async getSection(id: number) {
    const response = await api.get<ApiResponse<Section>>(`/api/sections/${id}`);
    return response.data;
  },

  // Create a new section
  async createSection(data: {
    name: string;
    room: string | null;
    max_students: number;
    department_id: number;
    year_level: number;
  }) {
    try {
      console.log('Section API - Creating with data:', data);
      const response = await api.post<ApiResponse<Section>>(
        "/api/sections",
        data
      );
      console.log('Section API - Create success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Section API - Create error:', error.response?.data || error);
      throw error;
    }
  },

  // Update an existing section
  async updateSection(
    id: number,
    data: Partial<{
      name: string;
      room: string;
      max_students: number;
      department_id: number;
      year_level: number;
    }>
  ) {
    const response = await api.put<ApiResponse<Section>>(
      `/api/sections/${id}`,
      data
    );
    return response.data;
  },

  // Delete a section
  async deleteSection(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/api/sections/${id}`);
    return response.data;
  },

  // Get students for a section
  async getStudents(sectionId: number): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>(
      `/api/sections/${sectionId}/students`
    );
    return response.data;
  },

  // Add multiple subjects to a section (bulk attach)
  async addSubjects(
    sectionId: number,
    subjectIds: number[]
  ): Promise<ApiResponse<Section>> {
    const response = await api.post<ApiResponse<Section>>(
      `/api/sections/${sectionId}/subjects`,
      {
        subjectIds,
      }
    );
    return response.data;
  },

  // Remove multiple subjects from a section (bulk detach)
  async removeSubjects(
    sectionId: number,
    subjectIds: number[]
  ): Promise<ApiResponse<Section>> {
    const response = await api.delete<ApiResponse<Section>>(
      `/api/sections/${sectionId}/subjects`,
      {
        data: {
          subjectIds,
        },
      }
    );
    return response.data;
  },

  // Add a single subject to a section
  async addSubject(
    sectionId: number,
    subjectId: number
  ): Promise<ApiResponse<Section>> {
    const response = await api.post<ApiResponse<Section>>(
      `/api/sections/${sectionId}/subjects/${subjectId}`
    );
    return response.data;
  },

  // Remove a single subject from a section
  async removeSubject(
    sectionId: number,
    subjectId: number
  ): Promise<ApiResponse<Section>> {
    const response = await api.delete<ApiResponse<Section>>(
      `/api/sections/${sectionId}/subjects/${subjectId}`
    );
    return response.data;
  },

  // Add a single student to a section
  async addStudent(
    sectionId: number,
    studentId: number
  ): Promise<ApiResponse<Section>> {
    const response = await api.post<ApiResponse<Section>>(
      `/api/sections/${sectionId}/students/${studentId}`
    );
    return response.data;
  },

  // Remove a single student from a section
  async removeStudent(
    sectionId: number,
    studentId: number
  ): Promise<ApiResponse<Section>> {
    const response = await api.delete<ApiResponse<Section>>(
      `/api/sections/${sectionId}/students/${studentId}`
    );
    return response.data;
  },
};

export default sectionApi;
