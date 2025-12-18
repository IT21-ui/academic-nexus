import api from "./apiClient";
import type { Class, PaginatedResponse, ApiResponse } from "@/types/models";

export const classApi = {
  // Get all classes (paginated)
  async getClasses(
    page: number = 1,
    perPage: number = 15,
    search: string = "",
    departmentId?: number,
    yearLevel?: number,
    subjectId?: number,
    teacherId?: number
  ): Promise<PaginatedResponse<Class>> {
    const params: any = {
      page,
      per_page: perPage,
    };

    if (search) params.search = search;
    if (departmentId) params.department_id = departmentId;
    if (yearLevel) params.year_level = yearLevel;
    if (subjectId) params.subject_id = subjectId;
    if (teacherId) params.teacher_id = teacherId;

    const response = await api.get<PaginatedResponse<Class>>("/api/classes", {
      params,
    });

    return response.data;
  },

  // Get a single class by ID
  async getClass(id: number) {
    const response = await api.get<ApiResponse<Class>>(`/api/classes/${id}`);
    return response.data;
  },

  // Get all classes by teacher
  async getClassesByTeacher(teacherId: number) {
    const response = await api.get<ApiResponse<Class[]>>(
      `/api/teachers/${teacherId}/classes`
    );
    return response.data;
  },

  // Create a new class
  async createClass(data: {
    subject_id: number;
    department_id?: number;
    section_id?: number;
    teacher_id: number;
    schedules: {
      day_of_week: string;
      start_time: string;
      end_time: string;
      room: string;
    }[];
    student_ids?: number[];
  }) {
    const response = await api.post<ApiResponse<Class>>("/api/classes", {
      ...data,
      schedules: (data.schedules || []).map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
      })),
    } as any);
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
        day_of_week: string;
        start_time: string;
        end_time: string;
        room: string;
      }[];
      studentIds?: number[];
      skipSectionStudents?: boolean;
    }>
  ) {
    const payload: any = { ...data };
    if (payload.schedules) {
      payload.schedules = (payload.schedules || []).map((s: any) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
      }));
    }

    const response = await api.put<ApiResponse<Class>>(
      `/api/classes/${id}`,
      payload
    );
    return response.data;
  },

  // Delete a class
  async deleteClass(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/api/classes/${id}`);
    return response.data;
  },

  // Enroll a student in a class
  async enrollStudent(classId: number, studentId: number) {
    const response = await api.post<ApiResponse<null>>(
      `/api/classes/${classId}/enroll`,
      { student_id: studentId }
    );
    return response.data;
  },

  // Unenroll a student from a class
  async unenrollStudent(classId: number, studentId: number) {
    const response = await api.delete<ApiResponse<null>>(
      `/api/classes/${classId}/unenroll/${studentId}`
    );
    return response.data;
  },
};

export default classApi;
