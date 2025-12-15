import api from "@/services/apiClient";
import { Grade } from "@/types/models";

export type UpsertClassGradePayload = {
  student_id: number;
  midterm?: number | null;
  finals?: number | null;
};

export const gradesApi = {
  async upsertClassGrade(classId: number, payload: UpsertClassGradePayload) {
    const res = await api.post<Grade>(
      `/api/classes/${classId}/class-grades`,
      payload
    );
    return res.data;
  },
};

export default gradesApi;
