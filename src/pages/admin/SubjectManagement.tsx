import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Home,
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");
  const [selectedYearLevelFilter, setSelectedYearLevelFilter] = useState<string>("all");
  const [selectedSectionDepartmentFilter, setSelectedSectionDepartmentFilter] = useState<string>("all");
  const [selectedSectionYearLevelFilter, setSelectedSectionYearLevelFilter] = useState<string>("all");
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
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [selectedSubjectsSection, setSelectedSubjectsSection] =
    useState<Section | null>(null);
  const [manageSubjectsLoading, setManageSubjectsLoading] = useState(false);
  const [manageStudentsLoading, setManageStudentsLoading] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    units: "",
    department: "",
    yearLevel: "",
  });

  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(subject => {
    const matchesDepartment = selectedDepartmentFilter === "all" || 
      String(subject.department_id) === selectedDepartmentFilter;
    const matchesYearLevel = selectedYearLevelFilter === "all" || 
      String(subject.year_level) === selectedYearLevelFilter;
    return matchesDepartment && matchesYearLevel;
  });

  // Categorize subjects by department and year level
  const categorizedSubjects = filteredSubjects.reduce((acc, subject) => {
    const deptName = subject.department?.name || 'Uncategorized';
    const yearLevel = subject.year_level ? `Year ${subject.year_level}` : 'All Years';
    
    if (!acc[deptName]) {
      acc[deptName] = {};
    }
    
    if (!acc[deptName][yearLevel]) {
      acc[deptName][yearLevel] = [];
    }
    
    acc[deptName][yearLevel].push(subject);
    return acc;
  }, {} as Record<string, Record<string, Subject[]>>);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [departmentsRes, studentsRes] = await Promise.all([
          departmentApi.getDepartments(1, 100),
          userApi.getStudents(1, 100),
        ]);

        setDepartments(departmentsRes.data);

        if (studentsRes && studentsRes.data) {
          setStudents(studentsRes.data);
        }

        // Only fetch subjects if filters are not "all"
        if (selectedDepartmentFilter !== "all" || selectedYearLevelFilter !== "all") {
          const subjectsRes = await subjectApi.getSubjects(
            1, 
            100, 
            "", 
            selectedDepartmentFilter !== "all" ? parseInt(selectedDepartmentFilter) : undefined,
            selectedYearLevelFilter !== "all" ? parseInt(selectedYearLevelFilter) : undefined
          );
          setSubjects(subjectsRes.data);
        } else {
          // Don't fetch all subjects by default - wait for user to select filters
          setSubjects([]);
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description:
            "Unable to load departments from the server. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, selectedDepartmentFilter, selectedYearLevelFilter]);

  const fetchSections = async (page: number = 1) => {
    try {
      setSectionsLoading(true);

      // Don't fetch sections if both filters are "all" - show guidance message instead
      if (selectedSectionDepartmentFilter === "all" && selectedSectionYearLevelFilter === "all") {
        console.log('Sections: Both filters are "all", skipping fetch');
        setSections([]);
        setSectionsPage(1);
        setSectionsLastPage(1);
        setSectionsTotal(0);
        setSectionsLoading(false);
        return;
      }

      console.log('Sections: Fetching with filters:', selectedSectionDepartmentFilter, selectedSectionYearLevelFilter);
      
      // Use server-side filtering by passing parameters to the API
      const res = await sectionApi.getSections(
        page, 
        10, 
        "",
        selectedSectionDepartmentFilter !== "all" ? parseInt(selectedSectionDepartmentFilter) : undefined,
        selectedSectionYearLevelFilter !== "all" ? parseInt(selectedSectionYearLevelFilter) : undefined
      );
      
      setSections(res.data);
      setSectionsPage(res.current_page);
      setSectionsLastPage(res.last_page);
      setSectionsTotal(res.total);
    } catch (error) {
      console.error('Sections API error:', error);
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
    setSectionsPage(1); // Reset to page 1 when filters change
    fetchSections(1);
  }, [toast, selectedSectionDepartmentFilter, selectedSectionYearLevelFilter]);

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

    let optimisticId: number | null = null;

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

        // Refresh subjects list
        const refreshed = await subjectApi.getSubjects(1, 100);
        setSubjects(refreshed.data);
      } else {
        // Optimistic update - add subject to local state immediately
        optimisticId = Date.now(); // Store the ID for rollback
        const optimisticSubject: Subject = {
          id: optimisticId, // Temporary ID
          code: newSubject.code,
          name: newSubject.name,
          units: parseInt(newSubject.units) || 3,
          department_id: departmentId,
          year_level: newSubject.yearLevel
            ? Number(newSubject.yearLevel)
            : null,
          department: departments.find(d => d.id === departmentId),
          created_at: new Date().toISOString(),
        };

        setSubjects(prev => [optimisticSubject, ...prev]);

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

        // Refresh subjects list to get the real subject with correct ID
        // Only do this if we need to update the optimistic subject with real data
        const refreshed = await subjectApi.getSubjects(1, 100);
        setSubjects(refreshed.data);
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
    } catch (error: any) {
      // If API call fails, remove the optimistic subject
      if (!editingSubjectId && optimisticId !== null) {
        setSubjects(prev => prev.filter(s => s.id !== optimisticId));
      }
      
      toast({
        title: "Error",
        description:
          "There was a problem creating the subject. Please try again.",
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

  const handleDeleteSubject = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteSubjectOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    // Optimistic update - remove subject from local state immediately
    const previousSubjects = [...subjects];
    setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));

    try {
      await subjectApi.deleteSubject(subjectToDelete.id);

      toast({
        title: "Subject Deleted",
        description: `${subjectToDelete.code} has been deleted.`,
      });

      setIsDeleteSubjectOpen(false);
      setSubjectToDelete(null);
    } catch (error) {
      // Rollback - restore the subject if API call fails
      setSubjects(previousSubjects);
      
      toast({
        title: "Error",
        description:
          "There was a problem deleting the subject. Please try again.",
        variant: "destructive",
      });
      
      setIsDeleteSubjectOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleViewClasses = (subject: Subject) => {
    // Navigate to ClassManagement with subject filter
    navigate('/class-management', { 
      state: { 
        subjectFilter: {
          id: subject.id,
          name: subject.name,
          code: subject.code
        }
      } 
    });
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
        </div>

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
                  placeholder="e.g., Computer Science 101"
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
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name}
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
                    {yearLevels.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
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
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-row items-center justify-between">
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
              </div>
              
              <div className="flex flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Department:</Label>
                  <Select
                    value={selectedDepartmentFilter}
                    onValueChange={setSelectedDepartmentFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Year Level:</Label>
                  <Select
                    value={selectedYearLevelFilter}
                    onValueChange={setSelectedYearLevelFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {yearLevels.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(selectedDepartmentFilter !== "all" || selectedYearLevelFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartmentFilter("all");
                      setSelectedYearLevelFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading subjects...</div>
                </div>
              ) : Object.keys(categorizedSubjects).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {selectedDepartmentFilter === "all" && selectedYearLevelFilter === "all" ? (
                    <div className="space-y-2">
                      <p>Please select department and/or year level filters to view subjects.</p>
                      <p className="text-sm">This helps improve performance by loading only the subjects you need.</p>
                    </div>
                  ) : (
                    "No subjects found matching the selected filters."
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(categorizedSubjects).map(([departmentName, yearLevels]) => (
                    <Card key={departmentName} className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="w-5 h-5 text-primary" />
                          {departmentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(yearLevels).map(([yearLevel, subjects]) => (
                          <div key={yearLevel}>
                            <div className="flex items-center gap-2 mb-3">
                              <GraduationCap className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                {yearLevel}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="grid gap-3">
                              {subjects.map((subject) => (
                                <div
                                  key={subject.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="font-mono">
                                      {subject.code}
                                    </Badge>
                                    <div>
                                      <div className="font-medium">{subject.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {subject.units} unit{subject.units !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="gap-2 hover:bg-primary/10"
                                      onClick={() => handleViewClasses(subject)}
                                    >
                                      <Calendar className="w-4 h-4" />
                                      {subject.classes_count || 0} classes
                                    </Button>
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
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle>All Sections</CardTitle>
              </div>
              
              <div className="flex flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Department:</Label>
                  <Select
                    value={selectedSectionDepartmentFilter}
                    onValueChange={setSelectedSectionDepartmentFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Year Level:</Label>
                  <Select
                    value={selectedSectionYearLevelFilter}
                    onValueChange={setSelectedSectionYearLevelFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {yearLevels.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(selectedSectionDepartmentFilter !== "all" || selectedSectionYearLevelFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSectionDepartmentFilter("all");
                      setSelectedSectionYearLevelFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
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
                    <TableHead>Class</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!sectionsLoading && sections.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-6"
                      >
                        {selectedSectionDepartmentFilter === "all" && selectedSectionYearLevelFilter === "all" ? (
                          <div className="space-y-2">
                            <p>Please select department and/or year level filters to view sections.</p>
                            <p className="text-sm">This helps improve performance by loading only the sections you need.</p>
                          </div>
                        ) : (
                          "No sections found matching the selected filters."
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {sections.length > 0 && sections.map((section) => {
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
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            {section.classes_count} classes
                          </Button>
                        </TableCell>
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

      {/* Delete Subject Confirmation Dialog */}
      <Dialog open={isDeleteSubjectOpen} onOpenChange={setIsDeleteSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subject "{subjectToDelete?.code} - {subjectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteSubjectOpen(false);
                setSubjectToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSubject}
            >
              Delete Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectManagement;
