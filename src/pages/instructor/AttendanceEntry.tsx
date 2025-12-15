import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Save,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import studentsApi from "@/services/teacher-api/studentsApi";
import attendanceApi from "@/services/teacher-api/attendanceApi";
import { yearLevels } from "@/lib/contants";

type AttendanceStatus = "present" | "absent" | "late";
type AttendanceValue = AttendanceStatus | null;

const AttendanceEntry: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceValue>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [savingByStudentId, setSavingByStudentId] = useState<
    Record<number, boolean>
  >({});
  const [allSections, setAllSections] = useState<
    Array<{ id: number; name: string; year_level: number }>
  >([]);
  const [allClasses, setAllClasses] = useState<
    Array<{ id: number; name: string; year_level: number; section: any }>
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  useEffect(() => {
    const fetchTeacherFilters = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const filters = await studentsApi.getClassFiltersForCurrentTeacher();
        setAllSections(
          Array.isArray((filters as any).sections)
            ? (filters as any).sections
            : []
        );
        setAllClasses(
          Array.isArray((filters as any).classes)
            ? (filters as any).classes
            : []
        );
      } catch (error) {
        console.error("Error fetching teacher filters:", error);
        setAllSections([]);
        setAllClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherFilters();
  }, [user?.id]);

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
    const first = classOptions[0];
    if (!selectedClassId) {
      if (first) setSelectedClassId(String(first.value));
      return;
    }

    const stillExists = classOptions.some(
      (c) => String(c.value) === String(selectedClassId)
    );
    if (!stillExists) {
      setSelectedClassId(first ? String(first.value) : "");
    }
  }, [classOptions, selectedClassId]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClassId) {
        setStudents([]);
        setAttendance({});
        return;
      }

      try {
        setLoading(true);

        const res = await attendanceApi.getClassAttendances(
          Number(selectedClassId),
          selectedDate,
          currentPage,
          pageSize
        );

        setStudents(res.data || []);

        // Initialize attendance
        const initialAttendance: Record<number, AttendanceValue> = {};
        (res.data || []).forEach((student: any) => {
          const status = student?.attendance?.status as
            | AttendanceStatus
            | undefined;
          initialAttendance[student.id] = status ?? null;
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error("Error fetching class students:", error);
        setStudents([]);
        setAttendance({});
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudents();
  }, [selectedClassId, selectedDate, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYearLevel, selectedSection, selectedClassId, selectedDate]);

  const handleStatusChange = async (
    studentId: number,
    status: AttendanceStatus
  ) => {
    if (!selectedClassId) return;
    if (!isToday) return;

    const current = attendance[studentId] ?? null;
    if (current === status) return;

    setAttendance((prev) => ({ ...prev, [studentId]: status }));

    try {
      setSavingByStudentId((prev) => ({ ...prev, [studentId]: true }));
      await attendanceApi.upsertStudentClassAttendance(
        Number(selectedClassId),
        Number(studentId),
        { date: selectedDate, status }
      );
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingByStudentId((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const getStatusButton = (
    studentId: number,
    status: AttendanceStatus,
    icon: React.ElementType,
    label: string
  ) => {
    const Icon = icon;
    const isSelected = attendance[studentId] === status;
    const disabled =
      loading || !selectedClassId || !isToday || !!savingByStudentId[studentId];

    return (
      <Button
        size="sm"
        variant={isSelected ? "default" : "outline"}
        disabled={disabled}
        className={cn(
          "gap-1",
          isSelected &&
            status === "present" &&
            "bg-success hover:bg-success/90",
          isSelected &&
            status === "absent" &&
            "bg-destructive hover:bg-destructive/90",
          isSelected && status === "late" && "bg-warning hover:bg-warning/90"
        )}
        onClick={() => handleStatusChange(studentId, status)}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Attendance Entry
          </h1>
          <p className="text-muted-foreground">
            Record student attendance for your classes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mark Attendance</CardTitle>
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
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="__loading_classes" disabled>
                    Loading...
                  </SelectItem>
                ) : classOptions.length === 0 ? (
                  <SelectItem value="__empty_classes" disabled>
                    No classes available
                  </SelectItem>
                ) : (
                  classOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedDate(next > todayStr ? todayStr : next);
                }}
                className="bg-transparent border-0 outline-none text-sm"
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
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedClassId && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Select a class to view attendance.
                  </TableCell>
                </TableRow>
              ) : null}

              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading &&
                !!selectedClassId &&
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.student_id || student.id}
                    </TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {getStatusButton(
                          student.id,
                          "present",
                          CheckCircle,
                          "Present"
                        )}
                        {getStatusButton(
                          student.id,
                          "absent",
                          XCircle,
                          "Absent"
                        )}
                        {getStatusButton(student.id, "late", Clock, "Late")}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !!selectedClassId && students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No students found for this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || currentPage <= 1 || !selectedClassId}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  loading || students.length < pageSize || !selectedClassId
                }
                onClick={() => setCurrentPage((p) => p + 1)}
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

export default AttendanceEntry;
