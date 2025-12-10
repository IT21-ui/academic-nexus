import React, { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockDepartments,
  mockInstructors,
  mockStudents,
} from "@/data/mockData";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  X,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import subjectApi from "@/services/subjectApi";
import departmentApi from "@/services/departmentApi";
import sectionApi from "@/services/sectionApi";
import userApi from "@/services/userApi";
import type { Subject, Department, Section, User } from "@/types/models";
import { yearLevels } from "@/lib/contants";
import { max } from "date-fns";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const timeSlots = [
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
];

const SubjectManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsPage, setSectionsPage] = useState(1);
  const [sectionsLastPage, setSectionsLastPage] = useState(1);
  const [sectionsTotal, setSectionsTotal] = useState(0);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [selectedSubjectsSection, setSelectedSubjectsSection] =
    useState<Section | null>(null);
  const [manageSubjectsLoading, setManageSubjectsLoading] = useState(false);
  const [manageStudentsLoading, setManageStudentsLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    units: "",
    department: "",
    yearLevel: "",
  });

  const [newSection, setNewSection] = useState({
    name: "",
    department_id: "",
    year_level: "",
    room: "",
    max_students: "",
  });

  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [subjectsRes, departmentsRes, studentsRes] = await Promise.all([
          subjectApi.getSubjects(1, 100),
          departmentApi.getDepartments(1, 100),
          userApi.getStudents(1, 100),
        ]);

        setSubjects(subjectsRes.data);
        setDepartments(departmentsRes.data);

        if (studentsRes && studentsRes.data) {
          setStudents(studentsRes.data);
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description:
            "Unable to load subjects or departments from the server. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const fetchSections = async (page: number = 1) => {
    try {
      setSectionsLoading(true);

      const res = await sectionApi.getSections(page, 10);
      setSections(res.data);
      setSectionsPage(res.current_page);
      setSectionsLastPage(res.last_page);
      setSectionsTotal(res.total);
    } catch (error) {
      toast({
        title: "Error loading sections",
        description:
          "Unable to load sections from the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSectionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections(1);
  }, [toast]);

  // Keep the section shown in the Manage Subjects modal in sync
  useEffect(() => {
    if (!selectedSubjectsSection) return;
    const latest = sections.find((s) => s.id === selectedSubjectsSection.id);
    if (latest && latest !== selectedSubjectsSection) {
      setSelectedSubjectsSection(latest);
    }
  }, [sections, selectedSubjectsSection]);

  // Keep the section shown in the Manage Students modal in sync
  useEffect(() => {
    if (!selectedSection) return;
    const latest = sections.find((s) => s.id === selectedSection.id);
    if (latest && latest !== selectedSection) {
      setSelectedSection(latest);
    }
  }, [sections, selectedSection]);

  const handleAddSubject = async () => {
    if (!newSubject.code || !newSubject.name || !newSubject.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const departmentId = Number(newSubject.department);
    if (!departmentId) {
      toast({
        title: "Department required",
        description: "Please select a valid department.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubjectId) {
        await subjectApi.updateSubject(editingSubjectId, {
          code: newSubject.code,
          name: newSubject.name,
          units: parseInt(newSubject.units) || 3,
          department_id: departmentId,
          year_level: newSubject.yearLevel
            ? Number(newSubject.yearLevel)
            : null,
        });

        toast({
          title: "Subject Updated",
          description: `${newSubject.name} has been updated successfully.`,
        });
      } else {
        await subjectApi.createSubject({
          code: newSubject.code,
          name: newSubject.name,
          units: parseInt(newSubject.units) || 3,
          department_id: departmentId,
          year_level: newSubject.yearLevel
            ? Number(newSubject.yearLevel)
            : null,
        });

        toast({
          title: "Subject Added",
          description: `${newSubject.name} has been added successfully.`,
        });
      }

      setNewSubject({
        code: "",
        name: "",
        units: "",
        department: "",
        yearLevel: "",
      });
      setEditingSubjectId(null);
      setIsAddSubjectOpen(false);

      // Refresh subjects list
      const refreshed = await subjectApi.getSubjects(1, 100);
      setSubjects(refreshed.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem creating the subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSection = async () => {
    console.log(newSection);
    if (
      !newSection.name ||
      !newSection.department_id ||
      !newSection.year_level ||
      !newSection.max_students
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSectionId) {
        await sectionApi.updateSection(editingSectionId, {
          name: newSection.name,
          room: newSection.room,
          max_students: parseInt(newSection.max_students),
          department_id: parseInt(newSection.department_id),
          year_level: parseInt(newSection.year_level),
        });

        toast({
          title: "Section Updated",
          description: `${newSection.name} has been updated successfully.`,
        });
      } else {
        await sectionApi.createSection({
          name: newSection.name,
          room: newSection.room,
          max_students: parseInt(newSection.max_students),
          department_id: parseInt(newSection.department_id),
          year_level: parseInt(newSection.year_level),
        });

        toast({
          title: "Section Created",
          description: `${newSection.name} has been created successfully.`,
        });
      }

      setNewSection({
        name: "",
        department_id: "",
        year_level: "",
        room: "",
        max_students: "",
      });
      setEditingSectionId(null);
      setIsAddSectionOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem creating the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddStudentToSection = async (
    sectionId: number,
    student: User
  ) => {
    try {
      setManageStudentsLoading(true);
      await sectionApi.addStudent(sectionId, student.id);

      // Optimistically update local sections list
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                students: [...(s.students || []), student],
              }
            : s
        )
      );

      // And the section shown inside the modal
      setSelectedSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              students: [...(prev.students || []), student],
            }
          : prev
      );

      await fetchSections(sectionsPage);

      toast({
        title: "Student Added",
        description: `${student.first_name} ${student.last_name} has been added to this section.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem adding the student to this section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManageStudentsLoading(false);
    }
  };

  const handleRemoveStudentFromSection = async (
    sectionId: number,
    studentId: number
  ) => {
    try {
      setManageStudentsLoading(true);
      await sectionApi.removeStudent(sectionId, studentId);

      // Optimistically update local sections list
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                students: (s.students || []).filter(
                  (stu) => stu.id !== studentId
                ),
              }
            : s
        )
      );

      // And the section shown inside the modal
      setSelectedSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              students: (prev.students || []).filter(
                (stu) => stu.id !== studentId
              ),
            }
          : prev
      );

      await fetchSections(sectionsPage);

      toast({
        title: "Student Removed",
        description: "Student has been removed from this section.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem removing the student from this section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManageStudentsLoading(false);
    }
  };

  const getSubjectById = (id: string) =>
    subjects.find((s) => String(s.id) === id);

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setNewSubject({
      code: subject.code,
      name: subject.name,
      units: String(subject.units ?? ""),
      department: subject.department_id ? String(subject.department_id) : "",
      yearLevel: subject.year_level ? String(subject.year_level) : "",
    });
    setIsAddSubjectOpen(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete subject ${subject.code} - ${subject.name}?`
    );
    if (!confirmed) return;

    try {
      await subjectApi.deleteSubject(subject.id);

      toast({
        title: "Subject Deleted",
        description: `${subject.code} has been deleted.`,
      });

      const refreshed = await subjectApi.getSubjects(1, 100);
      setSubjects(refreshed.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem deleting the subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setNewSection({
      name: section.name,
      department_id: String(section.department_id),
      year_level: String(section.year_level),
      room: section.room,
      max_students: String(section.max_students),
    });
    setIsAddSectionOpen(true);
  };

  const handleDeleteSection = async (section: Section) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete section ${section.name}?`
    );
    if (!confirmed) return;

    try {
      await sectionApi.deleteSection(section.id);

      toast({
        title: "Section Deleted",
        description: `${section.name} has been deleted.`,
      });

      await fetchSections(sectionsPage);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem deleting the section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSubjectToSection = async (
    sectionId: number,
    subject: Subject
  ) => {
    try {
      setManageSubjectsLoading(true);
      await sectionApi.addSubject(sectionId, subject.id);

      // Optimistically update local sections list
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                subjects: [...(s.subjects || []), subject],
              }
            : s
        )
      );

      // And the section shown inside the modal
      setSelectedSubjectsSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              subjects: [...(prev.subjects || []), subject],
            }
          : prev
      );

      await fetchSections(sectionsPage);

      toast({
        title: "Subject Added",
        description: `${subject.name} has been added to this section.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem adding the subject to this section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManageSubjectsLoading(false);
    }
  };

  const handleRemoveSubjectFromSection = async (
    sectionId: number,
    subjectId: number
  ) => {
    try {
      setManageSubjectsLoading(true);
      await sectionApi.removeSubject(sectionId, subjectId);

      // Optimistically update local sections list
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                subjects: (s.subjects || []).filter(
                  (subj) => subj.id !== subjectId
                ),
              }
            : s
        )
      );

      // And the section shown inside the modal
      setSelectedSubjectsSection((prev) =>
        prev && prev.id === sectionId
          ? {
              ...prev,
              subjects: (prev.subjects || []).filter(
                (subj) => subj.id !== subjectId
              ),
            }
          : prev
      );

      await fetchSections(sectionsPage);

      toast({
        title: "Subject Removed",
        description: "Subject has been removed from this section.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem removing the subject from this section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManageSubjectsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Subject & Section Management
          </h1>
          <p className="text-muted-foreground">
            Manage subjects, sections, and student assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSectionId ? "Update Section" : "Create New Section"}
                </DialogTitle>
                <DialogDescription>
                  Add a new section with instructor and schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Section Name</Label>
                  <Input
                    placeholder="e.g., Section A"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={newSection.department_id}
                    onValueChange={(v) =>
                      setNewSection({ ...newSection, department_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select
                    value={newSection.year_level}
                    onValueChange={(v) =>
                      setNewSection({ ...newSection, year_level: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g., 40"
                    value={newSection.max_students}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        max_students: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Input
                    placeholder="e.g., Room 201"
                    value={newSection.room}
                    onChange={(e) =>
                      setNewSection({ ...newSection, room: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddSectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleAddSection}>
                  {editingSectionId ? "Update Section" : "Create Section"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSubjectId ? "Update Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription>
                  Create a new subject for a specific department and year level
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input
                      placeholder="e.g., CS101"
                      value={newSubject.code}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Units</Label>
                    <Input
                      type="number"
                      placeholder="3"
                      value={newSubject.units}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, units: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="e.g., Introduction to Programming"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={newSubject.department}
                    onValueChange={(v) =>
                      setNewSubject({ ...newSubject, department: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select
                    value={newSubject.yearLevel}
                    onValueChange={(v) =>
                      setNewSubject({ ...newSubject, yearLevel: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map((y) => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddSubjectOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleAddSubject}>
                  {editingSubjectId ? "Update Subject" : "Add Subject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <Users className="w-4 h-4" />
            Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Subjects</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year Level</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && filteredSubjects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-6"
                      >
                        No subjects found.
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>{subject.units}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subject.department?.name || ""}
                        </Badge>
                      </TableCell>
                      <TableCell>{subject.year_level || ""}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary">
                          {`${subject.sections.length} sections`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteSubject(subject)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>All Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionsLoading && (
                <p className="text-sm text-muted-foreground mb-2">
                  Loading sections...
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!sectionsLoading && sections.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-6"
                      >
                        No sections found.
                      </TableCell>
                    </TableRow>
                  )}

                  {sections.map((section) => {
                    return (
                      <TableRow key={section.id}>
                        <TableCell>
                          <div className="font-medium">{section.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {section.department?.name || ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setSelectedSubjectsSection(section);
                              setIsManageSubjectsOpen(true);
                            }}
                          >
                            <BookOpen className="w-4 h-4" />
                            {section.subjects.length} subjects
                          </Button>
                        </TableCell>
                        <TableCell>{section.room}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setSelectedSection(section);
                              setIsManageStudentsOpen(true);
                            }}
                          >
                            <GraduationCap className="w-4 h-4" />
                            {(section.students || []).length} students
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditSection(section)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteSection(section)}
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
              {sectionsTotal > 0 && sectionsLastPage > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {sectionsPage} of {sectionsLastPage} · {sectionsTotal}{" "}
                    total section{sectionsTotal === 1 ? "" : "s"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={sectionsPage <= 1 || sectionsLoading}
                      onClick={() => fetchSections(sectionsPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        sectionsPage >= sectionsLastPage || sectionsLoading
                      }
                      onClick={() => fetchSections(sectionsPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manage Students Dialog */}
      <Dialog
        open={isManageStudentsOpen}
        onOpenChange={setIsManageStudentsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Students - {selectedSection?.name}</DialogTitle>
            <DialogDescription>
              {selectedSection?.department?.name} • Year Level{" "}
              {selectedSection?.year_level}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {manageStudentsLoading && (
              <p className="text-xs text-muted-foreground">
                Updating students...
              </p>
            )}
            <div className="flex items-center gap-2">
              <Select
                disabled={!selectedSection || manageStudentsLoading}
                onValueChange={(studentId) => {
                  if (!selectedSection) return;

                  const student = students.find(
                    (s) => String(s.id) === studentId
                  );
                  if (!student) return;

                  const alreadyInSection = (
                    selectedSection.students || []
                  ).some((stu) => stu.id === student.id);
                  if (alreadyInSection) return;

                  const sameDept =
                    student.department_id === selectedSection.department_id;
                  const sameYear =
                    (student.year_level || null) ===
                    (selectedSection.year_level || null);

                  if (!sameDept || !sameYear) {
                    toast({
                      title: "Student not allowed",
                      description:
                        "You can only add students from the same department and year level.",
                      variant: "destructive",
                    });
                    return;
                  }

                  handleAddStudentToSection(selectedSection.id, student);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a student to this section..." />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter((student) => {
                      if (!selectedSection) return false;

                      const sameDept =
                        student.department_id === selectedSection.department_id;
                      const sameYear =
                        (student.year_level || null) ===
                        (selectedSection.year_level || null);
                      const alreadyInSection = (
                        selectedSection.students || []
                      ).some((stu) => stu.id === student.id);

                      return sameDept && sameYear && !alreadyInSection;
                    })
                    .map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.id} - {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="icon">
                <UserPlus className="w-4 h-4" />
              </Button> */}
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedSection?.students || []).map((student) => {
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Badge variant="secondary">{student.id}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {student?.first_name} {student?.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student?.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            disabled={manageStudentsLoading}
                            onClick={() => {
                              if (selectedSection) {
                                handleRemoveStudentFromSection(
                                  selectedSection.id,
                                  student.id
                                );
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!selectedSection ||
                    !selectedSection.students ||
                    selectedSection.students.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No students enrolled in this section yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManageStudentsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Subjects Dialog */}
      <Dialog
        open={isManageSubjectsOpen}
        onOpenChange={setIsManageSubjectsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Manage Subjects - {selectedSubjectsSection?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedSubjectsSection?.department?.name} • Year Level{" "}
              {selectedSubjectsSection?.year_level}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {manageSubjectsLoading && (
              <p className="text-xs text-muted-foreground">
                Updating subjects...
              </p>
            )}
            <div className="flex items-center gap-2">
              <Select
                disabled={!selectedSubjectsSection || manageSubjectsLoading}
                onValueChange={(subjectId) => {
                  if (!selectedSubjectsSection) return;

                  const subject = getSubjectById(subjectId);
                  if (!subject) return;

                  const alreadyHas = (
                    selectedSubjectsSection.subjects || []
                  ).some((s) => s.id === subject.id);
                  if (alreadyHas) return;

                  const sameDept =
                    subject.department_id ===
                    selectedSubjectsSection.department_id;
                  const sameYear =
                    (subject.year_level || null) ===
                    (selectedSubjectsSection.year_level || null);

                  if (!sameDept || !sameYear) {
                    toast({
                      title: "Subject not allowed",
                      description:
                        "You can only add subjects from the same department and year level.",
                      variant: "destructive",
                    });
                    return;
                  }

                  handleAddSubjectToSection(
                    selectedSubjectsSection.id,
                    subject
                  );
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a subject to this section..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter((subject) => {
                      if (!selectedSubjectsSection) return false;

                      const sameDept =
                        subject.department_id ===
                        selectedSubjectsSection.department_id;
                      const sameYear =
                        (subject.year_level || null) ===
                        (selectedSubjectsSection.year_level || null);
                      const alreadyInSection = (
                        selectedSubjectsSection.subjects || []
                      ).some((s) => s.id === subject.id);

                      return sameDept && sameYear && !alreadyInSection;
                    })
                    .map((subject) => (
                      <SelectItem key={subject.id} value={String(subject.id)}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedSubjectsSection?.subjects || []).map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>{subject.units}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          disabled={manageSubjectsLoading}
                          onClick={() => {
                            if (!selectedSubjectsSection) return;
                            handleRemoveSubjectFromSection(
                              selectedSubjectsSection.id,
                              subject.id
                            );
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!selectedSubjectsSection ||
                    !selectedSubjectsSection.subjects ||
                    selectedSubjectsSection.subjects.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No subjects assigned to this section yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={manageSubjectsLoading}
              onClick={() => setIsManageSubjectsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectManagement;
