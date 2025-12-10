import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
} from "@/types/models";

const daysOfWeek = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

const ClassManagement: React.FC = () => {
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

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
    day: "",
    timeStart: "",
    timeEnd: "",
  });

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

  const resetForm = () => {
    setForm({
      subject_id: "",
      department_id: "",
      section_id: "",
      teacher_id: "",
      day: "",
      timeStart: "",
      timeEnd: "",
    });
    setEditingClassId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsClassDialogOpen(true);
  };

  const handleEditClass = (cls: ClassModel) => {
    const firstSchedule = cls.schedules?.[0];
    setEditingClassId(cls.id as number);
    setForm({
      subject_id: String(cls.subject.id),
      department_id: cls.department_id ? String(cls.department_id) : "",
      section_id: cls.section ? String(cls.section.id) : "",
      teacher_id: String(cls.teacher.id),
      day: firstSchedule ? String(firstSchedule.day) : "",
      timeStart: firstSchedule?.timeStart || "",
      timeEnd: firstSchedule?.timeEnd || "",
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

    if (
      !form.subject_id ||
      !form.teacher_id ||
      !form.day ||
      !form.timeStart ||
      !form.timeEnd
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in subject, teacher, day, and time.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      subject_id: Number(form.subject_id),
      department_id: form.department_id
        ? Number(form.department_id)
        : undefined,
      section_id: form.section_id ? Number(form.section_id) : undefined,
      teacher_id: Number(form.teacher_id),
      schedules: [
        {
          day: Number(form.day),
          timeStart: form.timeStart,
          timeEnd: form.timeEnd,
        },
      ],
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

      resetForm();
      setIsClassDialogOpen(false);
      fetchClasses(classesPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving this class.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayLabel = (dayValue: number | undefined) => {
    if (!dayValue) return "";
    const found = daysOfWeek.find((d) => Number(d.value) === dayValue);
    return found ? found.label : "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Class Management
          </h1>
          <p className="text-muted-foreground">
            Configure classes, schedules, and section assignments
          </p>
        </div>
        <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingClassId ? "Update Class" : "Create New Class"}
              </DialogTitle>
              <DialogDescription>
                Assign a department, subject, teacher, section, and schedule for
                this class.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                        <SelectItem key={subject.id} value={String(subject.id)}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Section (optional)
                </label>
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
                        <SelectItem key={section.id} value={String(section.id)}>
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
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                          {teacher.first_name} {teacher.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Day
                  </label>
                  <Select
                    value={form.day}
                    disabled={!form.department_id}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, day: value }))
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
                    value={form.timeStart}
                    disabled={!form.department_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, timeStart: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Time End
                  </label>
                  <Input
                    type="time"
                    value={form.timeEnd}
                    disabled={!form.department_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, timeEnd: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsClassDialogOpen(false);
                  resetForm();
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
                const firstSchedule = cls.schedules?.[0];
                return (
                  <TableRow key={cls.id}>
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
                      {cls.teacher.first_name} {cls.teacher.last_name}
                    </TableCell>
                    <TableCell>
                      {firstSchedule ? (
                        <div className="text-sm">
                          <div>{getDayLabel(firstSchedule.day)}</div>
                          <div className="text-xs text-muted-foreground">
                            {firstSchedule.timeStart} - {firstSchedule.timeEnd}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No schedule
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cls.students ? cls.students.length : 0}
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
