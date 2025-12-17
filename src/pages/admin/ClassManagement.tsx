import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventBus } from "@/hooks/useEventBus";
import classApi from "@/services/classApi";
import subjectApi from "@/services/subjectApi";
import sectionApi from "@/services/sectionApi";
import userApi from "@/services/userApi";
import departmentApi from "@/services/departmentApi";
import type {
  Class as ClassModel,
  Subject,
  Section,
  User,
  Department,
  ApiResponse,
} from "@/types/models";
import { format24HourTo12HourTime } from "@/lib/utils";

const daysOfWeek = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

type ScheduleForm = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
};

const ClassManagement: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // State for subject filter from navigation
  const [subjectFilter, setSubjectFilter] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);

  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassModel | null>(null);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentsSearchTerm, setStudentsSearchTerm] = useState("");
  const [manageStudentsLoading, setManageStudentsLoading] = useState(false);

  const [classesPage, setClassesPage] = useState(1);
  const [classesLastPage, setClassesLastPage] = useState(1);
  const [classesTotal, setClassesTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    subject_id: "",
    department_id: "",
    section_id: "",
    teacher_id: "",
    schedules: [{ day_of_week: "", start_time: "", end_time: "", room: "" }] as ScheduleForm[],
  });

  const openManageStudents = async (cls: ClassModel) => {
    setSelectedClass(cls);
    setSelectedStudentIds((cls.students || []).map((s) => s.id));
    setStudentsSearchTerm("");
    setIsManageStudentsOpen(true);

    try {
      setManageStudentsLoading(true);

      // Get the year level from the class section
      const classYearLevel = cls.section?.year_level;
      
      // Load all students with their class relationships to detect subject conflicts
      const res = await userApi.getStudents(1, 200);
      let studentsToShow = res.data || [];
      
      // Enrich student data with their current class subjects for conflict detection
      studentsToShow = studentsToShow.map(student => {
        // Check if this student is enrolled in any classes and get their subjects
        const studentSubjects = [];
        
        // Look through all existing classes to find ones this student is enrolled in
        classes.forEach(existingClass => {
          if (existingClass.students && existingClass.students.some(classStudent => classStudent.id === student.id)) {
            // Student is enrolled in this class, add the subject
            studentSubjects.push(existingClass.subject);
          }
        });
        
        return {
          ...student,
          subjects: studentSubjects.length > 0 ? studentSubjects : student.subjects
        };
      });
      
      // Filter students by year level if the class has a section with year level
      if (classYearLevel) {
        studentsToShow = studentsToShow.filter(student => 
          student.year_level === classYearLevel
        );
      }
      
      setAvailableStudents(studentsToShow);
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || "Unknown error";
      console.error("Failed to load students:", { status, message, error });
      toast({
        title: "Unable to load students",
        description:
          status != null ? `HTTP ${status}. ${message}` : String(message),
        variant: "destructive",
      });
      setAvailableStudents([]);
    } finally {
      setManageStudentsLoading(false);
    }
  };

  const addStudentToClass = (studentId: number) => {
    // Check if student is already selected
    if (selectedStudentIds.includes(studentId)) {
      return;
    }
    
    // Find the student from available students
    const student = availableStudents.find(s => s.id === studentId);
    if (!student) {
      return;
    }
    
    // Additional validation: Check if student is already enrolled in same subject in another class
    if (selectedClass) {
      console.log("Checking student:", student.first_name, "for subject:", selectedClass.subject.name);
      console.log("Student data:", {
        studentId: student.id,
        studentSubjects: student.subjects,
        studentSubjectsLength: student.subjects?.length,
        selectedClassStudents: selectedClass.students,
        selectedClassStudentsLength: selectedClass.students?.length
      });
      
      // Check multiple possible ways student might have subject data
      const isEnrolledInSameSubject = (
        // Check if student has subjects array with matching subject
        (student.subjects && Array.isArray(student.subjects) && student.subjects.some((subject: Subject) => 
          subject.id === selectedClass.subject.id
        )) ||
        // Check if student is already in current class students
        (selectedClass.students && Array.isArray(selectedClass.students) && selectedClass.students.some((classStudent: any) => 
          classStudent.id === student.id
        ))
      );
      
      console.log("Is enrolled in same subject:", isEnrolledInSameSubject);
      
      if (isEnrolledInSameSubject) {
        toast({
          title: "Student Already Enrolled",
          description: `${student.first_name} ${student.last_name} is already enrolled in ${selectedClass.subject.name}. Each student can only be enrolled in one class per subject to avoid scheduling conflicts.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setSelectedStudentIds((prev) => [...prev, studentId]);
  };

  const removeStudentFromClass = (studentId: number) => {
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  // Helper function to check if student is enrolled in same subject
  const isStudentEnrolledInSameSubject = (student: User, currentClass: ClassModel) => {
    if (!student.subjects || !currentClass) return false;
    
    // Check if student has the same subject in their subjects array
    return student.subjects.some((subject: Subject) => 
      subject.id === currentClass.subject.id
    );
  };

  const saveClassStudents = async () => {
    if (!selectedClass) return;
    try {
      setManageStudentsLoading(true);

      console.log("Saving class students:", {
        classId: selectedClass.id,
        selectedStudentIds: selectedStudentIds,
        classInfo: selectedClass,
      });

      const result = await classApi.updateClass(selectedClass.id as number, {
        studentIds: selectedStudentIds,
        skipSectionStudents: true,
      });

      console.log("Update class result:", result);

      toast({
        title: "Students Updated",
        description: "Class students have been updated successfully.",
      });

      setIsManageStudentsOpen(false);
      setSelectedClass(null);
      await fetchClasses(classesPage);
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || "Unknown error";
      console.error("Failed to save class students:", {
        status,
        message,
        error,
      });
      toast({
        title: "Error",
        description:
          status != null
            ? `HTTP ${status}. ${message}`
            : "There was a problem updating students for this class.",
        variant: "destructive",
      });
    } finally {
      setManageStudentsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [subjectsRes, sectionsRes, teachersRes, departmentsRes] =
        await Promise.all([
          subjectApi.getSubjects(1, 100),
          sectionApi.getSections(1, 100),
          userApi.getTeachers(1, 100),
          departmentApi.getDepartments(1, 100),
        ]);

      setSubjects(subjectsRes.data || []);
      setSections(sectionsRes.data || []);
      if (teachersRes && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
      if (departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description:
          "Unable to load subjects, sections, or teachers. Some options may be missing.",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async (page: number = 1) => {
    try {
      setLoading(true);

      const res = await classApi.getClasses(page, 10, searchTerm);

      setClasses(res.data || []);
      setClassesPage(res.current_page);
      setClassesLastPage(res.last_page);
      setClassesTotal(res.total);
    } catch (error) {
      toast({
        title: "Error loading classes",
        description:
          "There was a problem fetching classes from the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchClasses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle subject filter from navigation state
  useEffect(() => {
    if (location.state?.subjectFilter) {
      const { subjectFilter } = location.state;
      setSubjectFilter(subjectFilter);

      // Pre-fill the form with the subject filter
      setForm((prev) => ({
        ...prev,
        subject_id: String(subjectFilter.id),
        department_id: subjects.find((s) => s.id === subjectFilter.id)
          ?.department_id
          ? String(
              subjects.find((s) => s.id === subjectFilter.id)?.department_id
            )
          : "",
      }));
    }
  }, [location.state, subjects]);

  const resetForm = () => {
    setForm({
      subject_id: "",
      department_id: "",
      section_id: "",
      teacher_id: "",
      schedules: [{ day_of_week: "", start_time: "", end_time: "", room: "" }],
    });
    setEditingClassId(null);
  };

  const clearSubjectFilter = () => {
    setSubjectFilter(null);
    // Clear navigation state
    navigate(location.pathname, { replace: true, state: null });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog closing - reset editing state
      setEditingClassId(null);
    }
    setIsClassDialogOpen(open);
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingClassId(null);
    setIsClassDialogOpen(true);
  };

  const handleEditClass = (cls: ClassModel) => {
    console.log('Editing class data:', cls);
    console.log('Class schedules:', cls.schedules);
    
    setEditingClassId(cls.id as number);
    setForm({
      subject_id: String(cls.subject.id),
      department_id: cls.department_id ? String(cls.department_id) : "",
      section_id: cls.section ? String(cls.section.id) : "",
      teacher_id: String(cls.teacher.id),
      schedules:
        cls.schedules && cls.schedules.length > 0
          ? cls.schedules.map((s) => ({
              day_of_week: String(s.day_of_week),
              start_time: s.start_time || "",
              end_time: s.end_time || "",
              room: s.room || "",
            }))
          : [{ day_of_week: "", start_time: "", end_time: "", room: "" }],
    });
    
    console.log('Form set to:', {
      subject_id: String(cls.subject.id),
      department_id: cls.department_id ? String(cls.department_id) : "",
      section_id: cls.section ? String(cls.section.id) : "",
      teacher_id: String(cls.teacher.id),
      schedules:
        cls.schedules && cls.schedules.length > 0
          ? cls.schedules.map((s) => ({
              day: String(s.day_of_week),
              timeStart: s.start_time || "",
              timeEnd: s.end_time || "",
              location: s.room || "",
            }))
          : [{ day: "", timeStart: "", timeEnd: "", location: "" }],
    });
    
    setIsClassDialogOpen(true);
  };

  const handleDeleteClass = async (cls: ClassModel) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete class for ${cls.subject.code} - ${cls.subject.name}?`
    );
    if (!confirmed) return;

    try {
      await classApi.deleteClass(cls.id as number);

      toast({
        title: "Class Deleted",
        description: `Class for ${cls.subject.code} has been deleted.`,
      });

      // Emit event to notify TeacherManagement about class assignment changes
      eventBus.emit("class-assignment-changed");

      fetchClasses(classesPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem deleting this class.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitClass = async () => {
    if (!form.department_id) {
      toast({
        title: "Missing department",
        description: "Please select a department.",
        variant: "destructive",
      });
      return;
    }

    if (!form.section_id) {
      toast({
        title: "Missing section",
        description: "Please select a section.",
        variant: "destructive",
      });
      return;
    }

    const schedulesWithAnyValue = (form.schedules || []).filter(
      (s) => s.day_of_week || s.start_time || s.end_time
    );
    const hasPartialSchedule = schedulesWithAnyValue.some(
      (s) => !(s.day_of_week && s.start_time && s.end_time)
    );
    const hasAtLeastOneCompleteSchedule = schedulesWithAnyValue.some(
      (s) => s.day_of_week && s.start_time && s.end_time
    );

    if (
      !form.subject_id ||
      !form.teacher_id ||
      !hasAtLeastOneCompleteSchedule
    ) {
      toast({
        title: "Missing information",
        description:
          "Please fill in subject, teacher, and at least one complete schedule.",
        variant: "destructive",
      });
      return;
    }

    if (hasPartialSchedule) {
      toast({
        title: "Incomplete schedule",
        description: "Please complete or remove the partially filled schedule.",
        variant: "destructive",
      });
      return;
    }

    const completeSchedules = schedulesWithAnyValue.filter(
      (s) => s.day_of_week && s.start_time && s.end_time
    );

    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map((n) => Number(n));
      return h * 60 + m;
    };

    const hasInvalidRange = completeSchedules.some(
      (s) => toMinutes(s.start_time) >= toMinutes(s.end_time)
    );
    if (hasInvalidRange) {
      toast({
        title: "Invalid time range",
        description: "Time start must be earlier than time end.",
        variant: "destructive",
      });
      return;
    }

    const scheduleKey = (s: any) => `${s.day_of_week}|${s.start_time}|${s.end_time}`;
    const seen = new Set<string>();
    const hasDuplicate = completeSchedules.some((s) => {
      const key = scheduleKey(s);
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (hasDuplicate) {
      toast({
        title: "Duplicate schedule",
        description: "Remove duplicate schedule entries (same day and time).",
        variant: "destructive",
      });
      return;
    }

    const byDay = completeSchedules.reduce<Record<string, any[]>>((acc, s) => {
      const day = String(s.day_of_week);
      acc[day] = acc[day] || [];
      acc[day].push(s);
      return acc;
    }, {});

    const hasOverlap = Object.values(byDay).some((list) => {
      const sorted = [...list].sort(
        (a, b) => toMinutes(a.start_time) - toMinutes(b.start_time)
      );
      for (let i = 1; i < sorted.length; i++) {
        const prevEnd = toMinutes(sorted[i - 1].end_time);
        const currStart = toMinutes(sorted[i].start_time);
        if (currStart < prevEnd) return true;
      }
      return false;
    });

    if (hasOverlap) {
      toast({
        title: "Overlapping schedules",
        description:
          "Schedules on the same day must not overlap in time. Please adjust the time ranges.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      subject_id: Number(form.subject_id),
      department_id: form.department_id
        ? Number(form.department_id)
        : undefined,
      section_id: Number(form.section_id),
      teacher_id: Number(form.teacher_id),
      schedules: completeSchedules.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
      })),
    };

    try {
      setIsSubmitting(true);

      if (editingClassId) {
        await classApi.updateClass(editingClassId, payload);
        toast({
          title: "Class Updated",
          description: "The class has been updated successfully.",
        });
      } else {
        await classApi.createClass(payload);
        toast({
          title: "Class Created",
          description: "The class has been created successfully.",
        });
      }

      // Emit event to notify TeacherManagement about class assignment changes
      eventBus.emit("class-assignment-changed");

      resetForm();
      setIsClassDialogOpen(false);
      fetchClasses(classesPage);
    } catch (error: any) {
      const apiResponse = error?.response?.data as
        | ApiResponse<ClassModel>
        | undefined;

      if (apiResponse?.success) {
        toast({
          title: editingClassId ? "Class Updated" : "Class Created",
          description:
            apiResponse.message ||
            "The class has been saved, but the server returned a non-standard status.",
        });

        // Emit event to notify TeacherManagement about class assignment changes
        eventBus.emit("class-assignment-changed");

        resetForm();
        setIsClassDialogOpen(false);
        fetchClasses(classesPage);
        return;
      }

      toast({
        title: "Error",
        description:
          apiResponse?.message || "There was a problem saving this class.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayLabel = (dayValue: number | undefined) => {
    if (!dayValue) return "";
    const found = daysOfWeek.find((d) => Number(d.value) === dayValue);
    return found ? found.label.slice(0, 3) : "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Class Management
          </h1>
          {subjectFilter && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                Filtered by: {subjectFilter.code} - {subjectFilter.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={clearSubjectFilter}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        <Dialog open={isClassDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="gradient"
              className="gap-2"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClassId ? "Update Class" : "Create New Class"}
              </DialogTitle>
              <DialogDescription>
                Assign a department, subject, teacher, section, and schedule for
                this class.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-4 py-4 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={form.department_id}
                    onValueChange={(value) =>
                      setForm((f) => ({
                        ...f,
                        department_id: value,
                        section_id: "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    value={form.subject_id}
                    disabled={!form.department_id}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, subject_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          form.department_id
                            ? "Select subject"
                            : "Select department first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects
                        .filter((subject) => {
                          if (!form.department_id) return false;
                          return (
                            subject.department_id === Number(form.department_id)
                          );
                        })
                        .map((subject) => (
                          <SelectItem
                            key={subject.id}
                            value={String(subject.id)}
                          >
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <Select
                    value={form.section_id}
                    disabled={!form.department_id}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, section_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          form.department_id
                            ? "Select section"
                            : "Select department first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sections
                        .filter((section) => {
                          if (!form.department_id) return false;
                          return (
                            section.department_id === Number(form.department_id)
                          );
                        })
                        .map((section) => (
                          <SelectItem
                            key={section.id}
                            value={String(section.id)}
                          >
                            {section.name} - {section.department?.name || ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Teacher</label>
                  <Select
                    value={form.teacher_id}
                    disabled={!form.department_id}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, teacher_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers
                        .filter((teacher) => {
                          if (!form.department_id) return false;
                          return (
                            teacher.department_id === Number(form.department_id)
                          );
                        })
                        .map((teacher) => (
                          <SelectItem
                            key={teacher.id}
                            value={String(teacher.id)}
                          >
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Schedules</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!form.department_id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        schedules: [
                          { day_of_week: "", start_time: "", end_time: "", room: "" },
                          ...(f.schedules || []),
                        ],
                      }))
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add schedule
                  </Button>
                </div>

                <div className="space-y-3">
                  {(form.schedules || []).map((schedule, index) => (
                    <div
                      key={index}
                      className="rounded-md border p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Schedule {index + 1}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          disabled={(form.schedules || []).length <= 1}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              schedules: (f.schedules || []).filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> Day
                          </label>
                          <Select
                            value={schedule.day_of_week}
                            disabled={!form.department_id}
                            onValueChange={(value) =>
                              setForm((f) => ({
                                ...f,
                                schedules: (f.schedules || []).map((s, i) =>
                                  i === index ? { ...s, day_of_week: value } : s
                                ),
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Time Start
                          </label>
                          <Input
                            type="time"
                            value={schedule.start_time}
                            disabled={!form.department_id}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                schedules: (f.schedules || []).map((s, i) =>
                                  i === index
                                    ? { ...s, start_time: e.target.value }
                                    : s
                                ),
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Time End
                          </label>
                          <Input
                            type="time"
                            value={schedule.end_time}
                            disabled={!form.department_id}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                schedules: (f.schedules || []).map((s, i) =>
                                  i === index
                                    ? { ...s, end_time: e.target.value }
                                    : s
                                ),
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Location</label>
                          <Input
                            value={schedule.room}
                            disabled={!form.department_id}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                schedules: (f.schedules || []).map((s, i) =>
                                  i === index
                                    ? { ...s, room: e.target.value }
                                    : s
                                ),
                              }))
                            }
                            placeholder="Room number or 'Online'"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsClassDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSubmitClass}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editingClassId
                    ? "Updating..."
                    : "Creating..."
                  : editingClassId
                  ? "Update Class"
                  : "Create Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={isManageStudentsOpen}
        onOpenChange={setIsManageStudentsOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Students</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `Manage students for ${selectedClass.subject.code} - ${selectedClass.subject.name}`
                : "Manage students for this class"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Search students</Label>
              <Input
                value={studentsSearchTerm}
                onChange={(e) => setStudentsSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>

            {manageStudentsLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Assigned</div>
                <div className="space-y-2 max-h-[360px] overflow-auto">
                  {selectedStudentIds.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No students assigned.
                    </div>
                  )}
                  {availableStudents
                    .filter((s) => selectedStudentIds.includes(s.id))
                    .filter((s) => {
                      const term = studentsSearchTerm.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        `${s.first_name} ${s.last_name}`
                          .toLowerCase()
                          .includes(term) ||
                        s.email.toLowerCase().includes(term)
                      );
                    })
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.first_name} {s.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {s.email}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStudentFromClass(s.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Available</div>
                <div className="space-y-2 max-h-[360px] overflow-auto">
                  {availableStudents.length === 0 && !manageStudentsLoading && (
                    <div className="text-sm text-muted-foreground">
                      No students available.
                    </div>
                  )}
                  {availableStudents
                    .filter((s) => !selectedStudentIds.includes(s.id))
                    .filter((s) => {
                      const term = studentsSearchTerm.trim().toLowerCase();
                      if (!term) return true;
                      return (
                        `${s.first_name} ${s.last_name}`
                          .toLowerCase()
                          .includes(term) ||
                        s.email.toLowerCase().includes(term)
                      );
                    })
                    .map((s) => {
                      // Debug: Check what properties the student actually has
                      console.log("Student data for", s.first_name, ":", {
                        id: s.id,
                        subjects: s.subjects,
                        subjectsLength: s.subjects?.length,
                        selectedClass: selectedClass,
                        selectedClassSubject: selectedClass?.subject,
                        selectedClassStudents: selectedClass?.students
                      });
                      
                      // Check multiple possible ways student might have subject data
                      const isEnrolledInSameSubject = selectedClass && (
                        // Check if student has subjects array with matching subject
                        (s.subjects && Array.isArray(s.subjects) && s.subjects.some((subject: Subject) => 
                          subject.id === selectedClass.subject.id
                        )) ||
                        // Check if student is already in current class students
                        (selectedClass.students && Array.isArray(selectedClass.students) && selectedClass.students.some((student: any) => 
                          student.id === s.id
                        ))
                      );
                      
                      console.log("Is enrolled in same subject:", isEnrolledInSameSubject, "for student:", s.first_name);
                      
                      return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between gap-2 ${isEnrolledInSameSubject ? 'opacity-60' : ''}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {s.first_name} {s.last_name}
                            </span>
                            {isEnrolledInSameSubject && (
                              <Badge variant="destructive" className="text-xs">
                                Already in {selectedClass?.subject.name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {s.email}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isEnrolledInSameSubject) {
                              toast({
                                title: "Cannot Add Student",
                                description: `${s.first_name} ${s.last_name} is already enrolled in ${selectedClass?.subject.name}. Students can only be enrolled in one class per subject.`,
                                variant: "destructive",
                              });
                              return;
                            }
                            addStudentToClass(s.id);
                          }}
                          disabled={isEnrolledInSameSubject}
                          className={isEnrolledInSameSubject ? 'cursor-not-allowed' : ''}
                          title={isEnrolledInSameSubject ? 
                            `Already enrolled in ${selectedClass?.subject.name}` : 
                            `Add ${s.first_name} ${s.last_name} to class`
                          }
                        >
                          {isEnrolledInSameSubject ? 'Already Enrolled' : 'Add'}
                        </Button>
                      </div>
                    )})}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsManageStudentsOpen(false);
                setSelectedClass(null);
              }}
              disabled={manageStudentsLoading}
            >
              Close
            </Button>
            <Button
              variant="gradient"
              onClick={saveClassStudents}
              disabled={manageStudentsLoading || !selectedClass}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Classes</CardTitle>
          <div className="relative w-64">
            <Input
              placeholder="Search by subject or teacher..."
              className="pl-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchClasses(1);
                }
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-muted-foreground mb-2">
              Loading classes...
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && classes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                  >
                    No classes found.
                  </TableCell>
                </TableRow>
              )}

              {classes.map((cls) => {
                const isHighlighted =
                  subjectFilter && cls.subject.id === subjectFilter.id;
                return (
                  <TableRow
                    key={cls.id}
                    className={
                      isHighlighted ? "bg-primary/5 border-primary/20" : ""
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cls.subject.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {cls.subject.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{cls.department?.name || ""}</TableCell>
                    <TableCell>{cls.section?.name || "-"}</TableCell>
                    <TableCell>
                      {cls.teacher
                        ? `${cls.teacher.first_name} ${cls.teacher.last_name}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {cls.schedules && cls.schedules.length > 0 ? (
                        <div className="text-sm space-y-1">
                          {cls.schedules.map((s, idx) => (
                            <div key={idx}>
                              <div>{getDayLabel(Number(s.day_of_week))}</div>
                              <div className="text-xs text-muted-foreground">
                                {format24HourTo12HourTime(s.start_time)} -{" "}
                                {format24HourTo12HourTime(s.end_time)}
                                {s.room && (
                                  <>
                                    {" • "}
                                    <span className="text-blue-600 font-medium">
                                      {s.room}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No schedule
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => openManageStudents(cls)}
                      >
                        <GraduationCap className="w-4 h-4" />
                        {`${cls.students ? cls.students.length : 0}  students`}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClass(cls)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteClass(cls)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {classesTotal > 0 && classesLastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Page {classesPage} of {classesLastPage} · {classesTotal} total
                class{classesTotal === 1 ? "" : "es"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={classesPage <= 1 || loading}
                  onClick={() => fetchClasses(classesPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={classesPage >= classesLastPage || loading}
                  onClick={() => fetchClasses(classesPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassManagement;
