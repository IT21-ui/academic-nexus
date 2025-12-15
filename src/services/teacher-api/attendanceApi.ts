import api from "@/services/apiClient";
import { PaginatedResponse, Student } from "@/types/models";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type ClassAttendanceStudent = Student & {
  attendance?: {
    id: number;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
  };
};

export type UpsertClassAttendancePayload = {
  date: string;
  status: AttendanceStatus;
};

export const attendanceApi = {
  async getClassAttendances(
    classId: number,
    date: string,
    page = 1,
    perPage = 15
  ) {
    const res = await api.get<PaginatedResponse<ClassAttendanceStudent>>(
      `/api/classes/${classId}/attendances`,
      {
        params: { date, page, per_page: perPage },
      }
    );
    return res.data;
  },

  async upsertStudentClassAttendance(
    classId: number,
    studentId: number,
    payload: UpsertClassAttendancePayload
  ) {
    const res = await api.post(
      `/api/classes/${classId}/attendances/${studentId}`,
      payload
    );
    return res.data;
  },
};

export default attendanceApi;
