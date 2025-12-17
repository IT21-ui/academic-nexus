import React, { useEffect, useState } from "react";
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
import { Search, Plus, Edit, Trash2, Mail, Calendar } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useEventBus } from "@/hooks/useEventBus";
import userApi from "@/services/userApi";
import departmentApi from "@/services/departmentApi";
import type { User, Department } from "@/types/models";

const TeacherManagement: React.FC = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teachersPage, setTeachersPage] = useState(1);
  const [teachersLastPage, setTeachersLastPage] = useState(1);
  const [teachersTotal, setTeachersTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [teacherForm, setTeacherForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const fetchTeachers = async (page: number = teachersPage) => {
    try {
      setLoading(true);

      const res = await userApi.getTeachers(page, 10, searchTerm);

      if (res && res.data) {
        setTeachers(res.data);
        setTeachersPage(res.current_page);
        setTeachersLastPage(res.last_page);
        setTeachersTotal(res.total);
      }
    } catch (error) {
      toast({
        title: "Error loading teachers",
        description:
          "There was a problem fetching instructors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getDepartments(1, 100);
        if (res && res.data) {
          setDepartments(res.data);
        }
      } catch (error) {
        toast({
          title: "Error loading departments",
          description:
            "There was a problem fetching departments. Department options may be incomplete.",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, [toast]);

  // Listen for class assignment changes
  useEventBus('class-assignment-changed', () => {
    fetchTeachers(teachersPage);
  });

  const resetTeacherForm = () => {
    setTeacherForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    });
    setSelectedDepartmentId("");
    setEditingTeacherId(null);
  };

  const handleOpenCreateTeacher = () => {
    resetTeacherForm();
    setIsTeacherDialogOpen(true);
  };

  const handleEditTeacher = (teacher: User) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      password: "",
    });
    setSelectedDepartmentId(
      teacher.department_id ? String(teacher.department_id) : ""
    );
    setIsTeacherDialogOpen(true);
  };

  const handleDeleteTeacher = async (teacher: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete instructor ${teacher.first_name} ${teacher.last_name}?`
    );
    if (!confirmed) return;

    // Optimistic update - remove teacher from local state immediately
    const previousTeachers = [...teachers];
    setTeachers(prev => prev.filter(t => t.id !== teacher.id));

    try {
      await userApi.deleteUser(teacher.id);
      toast({
        title: "Teacher Deleted",
        description: `${teacher.first_name} ${teacher.last_name} has been deleted.`,
      });
      
      // Refresh teachers list to ensure data consistency
      await fetchTeachers(teachersPage);
    } catch (error) {
      // Rollback - restore the teacher if API call fails
      setTeachers(previousTeachers);
      
      toast({
        title: "Error deleting teacher",
        description: "There was a problem deleting this teacher.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitTeacher = async () => {
    if (
      !teacherForm.first_name ||
      !teacherForm.last_name ||
      !teacherForm.email
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in first name, last name, and email.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDepartmentId) {
      toast({
        title: "Department required",
        description: "Please select a department for this instructor.",
        variant: "destructive",
      });
      return;
    }

    if (!editingTeacherId && !teacherForm.password) {
      toast({
        title: "Password required",
        description: "Please provide a password for the new instructor.",
        variant: "destructive",
      });
      return;
    }

    if (!editingTeacherId && teacherForm.password && teacherForm.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const department_id = Number(selectedDepartmentId);

      if (editingTeacherId) {
        const payload: any = {
          first_name: teacherForm.first_name,
          last_name: teacherForm.last_name,
          email: teacherForm.email,
          department_id,
          role: "instructor" as const,
          status: "approved" as const,
        };

        if (teacherForm.password) {
          payload.password = teacherForm.password;
        }

        await userApi.updateUser(editingTeacherId, payload);

        toast({
          title: "Teacher Updated",
          description: "The instructor has been updated successfully.",
        });

        // Refresh teachers list to get updated data including classes_count
        await fetchTeachers(teachersPage);
      } else {
        // Optimistic update - add teacher to local state immediately
        const optimisticTeacher: User = {
          id: Date.now(), // Temporary ID
          first_name: teacherForm.first_name,
          last_name: teacherForm.last_name,
          email: teacherForm.email,
          role: "instructor",
          status: "approved",
          department_id,
          department: departments.find(d => d.id === department_id),
          classes_count: 0, // Start with 0 classes
          created_at: new Date().toISOString(),
        };

        setTeachers(prev => [optimisticTeacher, ...prev]);

        const created = await userApi.createUser({
          first_name: teacherForm.first_name,
          last_name: teacherForm.last_name,
          email: teacherForm.email,
          role: "instructor",
          password: teacherForm.password,
          status: "approved",
          department_id: Number(selectedDepartmentId),
        });

        if (created) {
          toast({
            title: "Teacher Created",
            description: `${created.first_name} ${created.last_name} has been created successfully.`,
          });

          // Refresh teachers list to get the real teacher with correct ID and classes_count
          await fetchTeachers(1); // Reset to page 1 to see the new teacher
        }
      }

      resetTeacherForm();
      setIsTeacherDialogOpen(false);
    } catch (error: any) {
      // If API call fails, remove the optimistic teacher
      if (!editingTeacherId) {
        setTeachers(prev => prev.slice(1));
      }
      
      let description = "There was a problem saving this instructor.";
      const resp = error?.response;
      if (resp && resp.status === 422) {
        const data = resp.data;
        if (data?.errors && typeof data.errors === "object") {
          const firstKey = Object.keys(data.errors)[0];
          const firstMsg = firstKey ? data.errors[firstKey]?.[0] : undefined;
          if (firstMsg) description = firstMsg;
        } else if (data?.message) {
          description = data.message;
        }
      } else if (error?.message) {
        description = error.message;
      }

      toast({
        title: editingTeacherId ? "Error updating teacher" : "Error creating teacher",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    fetchTeachers(1);
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      `${t.first_name} ${t.last_name}`.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Teacher Management
          </h1>
        </div>
        <Dialog
          open={isTeacherDialogOpen}
          onOpenChange={setIsTeacherDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenCreateTeacher}>
              <Plus className="w-4 h-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTeacherId ? "Update Instructor" : "Add New Instructor"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacherId
                  ? "Update the instructor's basic information."
                  : "Create a new instructor by filling in the required information."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="First name"
                    value={teacherForm.first_name}
                    onChange={(e) =>
                      setTeacherForm((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Last name"
                    value={teacherForm.last_name}
                    onChange={(e) =>
                      setTeacherForm((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="instructor@example.com"
                  value={teacherForm.email}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(value) => setSelectedDepartmentId(value)}
                >
                  <SelectTrigger id="department">
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
                <Label htmlFor="password">
                  Password
                  {!editingTeacherId && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (required for new instructors)
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    editingTeacherId
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  value={teacherForm.password}
                  onChange={(e) =>
                    setTeacherForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTeacherDialogOpen(false);
                  resetTeacherForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSubmitTeacher}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editingTeacherId
                    ? "Updating..."
                    : "Creating..."
                  : editingTeacherId
                  ? "Update Instructor"
                  : "Create Instructor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      
      <div className="border rounded-lg">
        <div className="flex flex-row items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">All Teachers</h2>
          <div className="relative w-64 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearchSubmit}>
              Search
            </Button>
          </div>
        </div>
        <div className="p-6">
          {loading && (
            <p className="text-sm text-muted-foreground mb-2">
              Loading teachers...
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (!loading && filteredTeachers.length === 0) {
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-6"
                      >
                        No teachers found.
                      </TableCell>
                    </TableRow>
                  );
                }

                return filteredTeachers.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell className="font-medium">
                      {instructor.id}
                    </TableCell>
                    <TableCell>{`${instructor.first_name} ${instructor.last_name}`}</TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell>{instructor.department?.name || ""}</TableCell>
                    <TableCell>{instructor.classes_count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditTeacher(instructor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteTeacher(instructor)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>

          {teachersTotal > 0 && teachersLastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Page {teachersPage} of {teachersLastPage} · {teachersTotal}{" "}
                total instructor{teachersTotal === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={teachersPage <= 1 || loading}
                  onClick={() => fetchTeachers(teachersPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={teachersPage >= teachersLastPage || loading}
                  onClick={() => fetchTeachers(teachersPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
