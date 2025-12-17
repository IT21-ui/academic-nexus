import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import studentsApi from "@/services/teacher-api/studentsApi";
import gradesApi from "@/services/teacher-api/gradesApi";
import { yearLevels } from "@/lib/contants";

const GradeEntry: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<
    Record<number, { midterm: string; finals: string }>
  >({});
  const [initialGrades, setInitialGrades] = useState<
    Record<number, { midterm: string; finals: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [savingByStudentId, setSavingByStudentId] = useState<
    Record<number, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [allSections, setAllSections] = useState<
    Array<{ id: number; name: string; year_level: number }>
  >([]);
  const [allClasses, setAllClasses] = useState<
    Array<{ id: number; name: string; year_level: number; section: any }>
  >([]);

  useEffect(() => {
    if (!user?.id) return;
    getTeacherFilters();
  }, [user?.id, selectedYearLevel]);

  const getTeacherFilters = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const filters = await studentsApi.getClassFilters(Number(user.id));

      if (!filters) return;

      setAllSections(
        Array.isArray((filters as any).sections)
          ? (filters as any).sections
          : []
      );
      setAllClasses(
        Array.isArray((filters as any).classes) ? (filters as any).classes : []
      );
    } catch (e) {
      setAllSections([]);
      setAllClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStudentYearLevel = (student: any): string => {
    const yl =
      student?.year_level ?? student?.year_level_id ?? student?.yearLevel;
    return yl != null && yl !== "" ? String(yl) : "";
  };

  const getStudentSection = (student: any): string => {
    if (student?.section?.id != null) return String(student.section.id);
    if (student?.section?.name) return String(student.section.name);
    if (student?.section_name) return String(student.section_name);
    if (student?.section_id != null) return String(student.section_id);
    return "";
  };

  const resolvedSectionOptions = allSections
    .filter((sec) =>
      selectedYearLevel === "all"
        ? true
        : sec.year_level === Number(selectedYearLevel)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((sec) => ({ value: String(sec.id), label: sec.name }));

  const classOptions = allClasses
    .filter((c) =>
      selectedYearLevel === "all"
        ? true
        : c.year_level === Number(selectedYearLevel)
    )
    .filter((c) =>
      selectedSection === "all"
        ? true
        : String(c.section?.id) === String(selectedSection)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: String(c.id), label: c.name }));

  const filteredClasses = classOptions;

  useEffect(() => {
    if (selectedSection === "all") return;
    const allowed = resolvedSectionOptions.some(
      (s) => String(s.value) === String(selectedSection)
    );
    if (!allowed) {
      setSelectedSection("all");
    }
  }, [selectedYearLevel, resolvedSectionOptions, selectedSection]);

  useEffect(() => {
    const first = filteredClasses[0];

    if (!selectedClassId) {
      if (first) setSelectedClassId(String(first.value));
      return;
    }

    const stillExists = filteredClasses.some(
      (c) => String(c.value) === String(selectedClassId)
    );
    if (!stillExists) {
      setSelectedClassId(first ? String(first.value) : "");
    }
  }, [filteredClasses, selectedClassId]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setGrades({});
        setInitialGrades({});
        return;
      }

      try {
        setLoading(true);
        const all: any[] = [];
        let page = 1;
        let lastPage = 1;
        do {
          const res = await studentsApi.getStudentsByClassPaginated(
            Number(selectedClassId),
            page,
            50
          );
          all.push(...(res.data || []));
          lastPage = res.last_page || 1;
          page += 1;
        } while (page <= lastPage);

        setStudents(all);
        setSearchTerm("");

        const initialGrades: Record<
          number,
          { midterm: string; finals: string }
        > = {};
        all.forEach((student: any) => {
          const studentGrade =
            student?.grade ||
            (Array.isArray(student?.grades)
              ? student.grades.find(
                  (g: any) =>
                    String(g?.class_id ?? g?.class?.id ?? "") ===
                    String(selectedClassId)
                )
              : null);

          initialGrades[student.id] = {
            midterm:
              studentGrade?.midterm != null
                ? String(studentGrade.midterm)
                : student.pivot?.midterm || "",
            finals:
              studentGrade?.finals != null
                ? String(studentGrade.finals)
                : student.pivot?.finals || "",
          };
        });
        setGrades(initialGrades);
        setInitialGrades(initialGrades);
      } catch (error) {
        console.error("Error fetching class students:", error);
        setStudents([]);
        setGrades({});
        setInitialGrades({});
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudents();
  }, [selectedClassId]);

  const filteredStudents = (students || []).filter((student) => {
    const fullName = `${student.first_name || ""} ${student.last_name || ""}`
      .trim()
      .toLowerCase();
    const studentId = String(student.student_id || "").toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term || fullName.includes(term) || studentId.includes(term);

    const yl = getStudentYearLevel(student);
    const matchesYearLevel =
      selectedYearLevel === "all" || yl === selectedYearLevel;

    const sec = getStudentSection(student);
    const matchesSection = selectedSection === "all" || sec === selectedSection;

    return matchesSearch && matchesYearLevel && matchesSection;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYearLevel, selectedSection, selectedClassId]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const clampedPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleGradeChange = (
    studentId: number,
    field: "midterm" | "finals",
    value: string
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handlePostStudent = async (studentId: number) => {
    if (!selectedClassId) return;

    const current = grades[studentId] || { midterm: "", finals: "" };
    const payload = {
      student_id: studentId,
      midterm: current.midterm ? parseFloat(current.midterm) : null,
      finals: current.finals ? parseFloat(current.finals) : null,
    };

    try {
      setSavingByStudentId((prev) => ({ ...prev, [studentId]: true }));
      await gradesApi.upsertClassGrade(Number(selectedClassId), payload);

      setInitialGrades((prev) => ({
        ...prev,
        [studentId]: { ...current },
      }));

      toast({
        title: "Posted",
        description: "Grade has been posted.",
      });
    } catch (error) {
      console.error("Error posting grade:", error);
      toast({
        title: "Error",
        description: "Failed to post grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingByStudentId((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grade Entry</h1>
          <p className="text-muted-foreground">
            Enter and manage student grades
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Grades</CardTitle>
          <div className="flex items-center gap-4">
            <Select
              value={selectedYearLevel}
              onValueChange={setSelectedYearLevel}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Year level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearLevels.map((yl) => (
                  <SelectItem key={yl.value} value={yl.value}>
                    {yl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {loading ? (
                  <SelectItem value="__loading_sections" disabled>
                    Loading...
                  </SelectItem>
                ) : resolvedSectionOptions.length === 0 ? (
                  <SelectItem value="__empty_sections" disabled>
                    No sections available
                  </SelectItem>
                ) : (
                  resolvedSectionOptions.map((sec) => (
                    <SelectItem key={sec.value} value={sec.value}>
                      {sec.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="__loading_subjects" disabled>
                    Loading...
                  </SelectItem>
                ) : filteredClasses.length === 0 ? (
                  <SelectItem value="__empty_subjects" disabled>
                    No classes available
                  </SelectItem>
                ) : (
                  filteredClasses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Midterm</TableHead>
                <TableHead className="w-32">Finals</TableHead>
                <TableHead className="w-32">Final Grade</TableHead>
                <TableHead className="w-32">Remarks</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="text-sm text-muted-foreground">
                      No students found for the selected filters.
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading &&
                paginatedStudents.map((student) => {
                  const studentGrades = grades[student.id] || {
                    midterm: "",
                    finals: "",
                  };

                  const studentGrade =
                    student?.grade ||
                    (Array.isArray(student?.grades)
                      ? student.grades.find(
                          (g: any) =>
                            String(g?.class_id ?? g?.class?.id ?? "") ===
                            String(selectedClassId)
                        )
                      : null);

                  const initial = initialGrades[student.id] || {
                    midterm: "",
                    finals: "",
                  };

                  const hasChanges =
                    String(studentGrades.midterm || "") !==
                      String(initial.midterm || "") ||
                    String(studentGrades.finals || "") !==
                      String(initial.finals || "");

                  const isSavingRow = !!savingByStudentId[student.id];

                  const midterm = parseFloat(studentGrades.midterm) || 0;
                  const finals = parseFloat(studentGrades.finals) || 0;

                  const computedFinalGrade =
                    midterm && finals
                      ? parseFloat(((midterm + finals) / 2).toFixed(1))
                      : null;

                  const finalGrade =
                    computedFinalGrade != null
                      ? computedFinalGrade
                      : studentGrade?.final_grade != null
                      ? studentGrade.final_grade
                      : "-";

                  const isPassed =
                    finalGrade !== "-" && Number(finalGrade) <= 3.0;

                  const remarks =
                    computedFinalGrade != null || !studentGrade
                      ? finalGrade === "-"
                        ? "-"
                        : isPassed
                        ? "PASSED"
                        : "FAILED"
                      : String(studentGrade?.remarks ?? "-");

                  const disableFinals = !(studentGrades.midterm || "").trim();

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.id}
                      </TableCell>
                      <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="1.0-5.0"
                          value={studentGrades.midterm}
                          onChange={(e) =>
                            handleGradeChange(
                              student.id,
                              "midterm",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="1.0-5.0"
                          value={studentGrades.finals}
                          disabled={disableFinals}
                          onChange={(e) =>
                            handleGradeChange(
                              student.id,
                              "finals",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell
                        className={`font-bold ${
                          isPassed ? "text-success" : "text-destructive"
                        }`}
                      >
                        {finalGrade}{" "}
                        {finalGrade !== "-" &&
                          (isPassed ? "(PASSED)" : "(FAILED)")}
                      </TableCell>
                      <TableCell className="font-medium">{remarks}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handlePostStudent(student.id)}
                          disabled={loading || isSavingRow || !hasChanges}
                        >
                          <Save className="w-4 h-4" />
                          Post
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredStudents.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, filteredStudents.length)} of{" "}
              {filteredStudents.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || clampedPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {clampedPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || clampedPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeEntry;