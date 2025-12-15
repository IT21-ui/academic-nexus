import api from "@/services/apiClient";
import { PaginatedResponse, Section, Student } from "@/types/models";

export type TeacherClassFiltersResponse = {
  sections: { id: number; name: string; year_level: number }[];
  classes: {
    id: number;
    name: string;
    year_level: number;
    section: Section;
  }[];
};

export const studentsApi = {
  async getClassFilters(teacherId: number) {
    const res = await api.get<TeacherClassFiltersResponse>(
      `/api/teachers/${teacherId}/class-filters`
    );
    return res.data;
  },

  async getStudentsByClass(classId: number) {
    const res = await api.get<PaginatedResponse<Student>>(
      `/api/classes/${classId}/students`
    );
    return res.data;
  },

  async getStudentsByClassPaginated(classId: number, page = 1, perPage = 50) {
    const res = await api.get<PaginatedResponse<Student>>(
      `/api/classes/${classId}/students`,
      {
        params: { page, per_page: perPage },
      }
    );
    return res.data;
  },

  async getClassFiltersForCurrentTeacher() {
    const userRes = await api.get<any>("/api/user");
    const teacherId = userRes?.data?.id;
    if (!teacherId) {
      throw new Error("Unable to resolve current teacher id from /api/user");
    }

    return this.getClassFilters(Number(teacherId));
  },
};

export default studentsApi;
