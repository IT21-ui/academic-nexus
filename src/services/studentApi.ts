import api from "@/services/apiClient";

export interface StudentAttendanceRecord {
  id: number;
  date: string;
  subject_code: string;
  subject_name: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

export const studentApi = {
  async getStudentAttendance(studentId: number) {
    const res = await api.get(`/api/students/${studentId}/attendances`);
    return res.data;
  },

  async getStudentGrades(studentId: number) {
    const res = await api.get(`/api/students/${studentId}/grades`);
    return res.data;
  },

  async getStudentClasses(studentId: number) {
    const res = await api.get(`/api/students/${studentId}/classes`);
    return res.data;
  },
};

export default studentApi;
