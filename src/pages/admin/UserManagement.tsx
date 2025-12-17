import React, { useState, useEffect } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Search, UserPlus, Check, X, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useUsers,
  useStudents,
  useTeachers,
  useRegistrationRequests,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useApproveRegistrationRequest,
  useRejectRegistrationRequest,
} from "@/hooks/useUsers";
import type {
  Student,
  Teacher,
  RegistrationRequest,
  Department,
  Section,
  User,
  Subject,
  UserRole,
} from "@/types/models";
import departmentApi from "@/services/departmentApi";
import sectionApi from "@/services/sectionApi";
import classApi from "@/services/classApi";
import { yearLevels } from "@/lib/contants";

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<RegistrationRequest[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLastPage, setStudentsLastPage] = useState(1);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [teachersPage, setTeachersPage] = useState(1);
  const [teachersLastPage, setTeachersLastPage] = useState(1);
  const [teachersTotal, setTeachersTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLastPage, setPendingLastPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "student" as UserRole,
    password: "",
    department_id: "",
    section_id: "",
    year_level: "",
  });

  // Enhanced subject interface with sections count
  interface EnhancedSubject extends Subject {
    sectionsCount: number;
    classes: any[];
  }

  // Enhanced user interface with proper subjects typing
  interface EnhancedUser extends User {
    subjects?: EnhancedSubject[];
  }

  // Use cached queries
  const { data: usersData, isLoading: usersLoading } = useUsers(
    currentPage,
    10,
    undefined,
    searchTerm
  );
  const { data: studentsData, isLoading: studentsLoading } = useStudents(
    studentsPage,
    10,
    searchTerm
  );
  const { data: teachersData, isLoading: teachersLoading } = useTeachers(
    teachersPage,
    10,
    searchTerm
  );
  const { data: registrationRequestsData, isLoading: pendingLoading } =
    useRegistrationRequests("pending", pendingPage, 10);

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const approveRequestMutation = useApproveRegistrationRequest();
  const rejectRequestMutation = useRejectRegistrationRequest();

  // Load departments and sections (these don't change frequently)
  useEffect(() => {
    const loadDepartmentsAndSections = async () => {
      try {
        const [departmentsRes, sectionsRes] = await Promise.all([
          departmentApi.getDepartments(),
          sectionApi.getSections(1, 1000), // Load more sections to ensure we get all
        ]);
        setDepartments(departmentsRes.data);
        setSections(sectionsRes.data);
      } catch (error) {
        console.error("Error loading departments/sections:", error);
      }
    };
    loadDepartmentsAndSections();
  }, []);

  // Load sections when department changes for student role
  useEffect(() => {
    if (newUser.role === "student" && selectedDepartmentId && newUser.year_level) {
      const loadSectionsForDepartment = async () => {
        try {
          const sectionsRes = await sectionApi.getSections(
            1, 
            1000, 
            "", 
            Number(selectedDepartmentId),
            Number(newUser.year_level)
          );
          setSections(sectionsRes.data);
        } catch (error) {
          console.error("Error loading sections for department:", error);
        }
      };
      loadSectionsForDepartment();
    }
  }, [selectedDepartmentId, newUser.year_level, newUser.role]);

  // Update data states when cached data changes
  useEffect(() => {
    if (studentsData) {
      setStudents(studentsData.data);
      setStudentsLastPage(studentsData.last_page);
      setStudentsTotal(studentsData.total);
    }
  }, [studentsData]);

  useEffect(() => {
    if (teachersData) {
      setTeachers(teachersData.data);
      setTeachersLastPage(teachersData.last_page);
      setTeachersTotal(teachersData.total);
    }
  }, [teachersData]);

  useEffect(() => {
    if (registrationRequestsData) {
      setPendingRegistrations(registrationRequestsData.data);
      setPendingLastPage(registrationRequestsData.last_page);
      setPendingTotal(registrationRequestsData.total);
    }
  }, [registrationRequestsData]);

  useEffect(() => {
    // Reset department/section when role changes
    setSelectedDepartmentId("");
    setSelectedSectionId("");
  }, [newUser.role]);

  const handleEditUser = async () => {
    if (!editingUser) return;

    if (!editingUser.first_name || !editingUser.last_name || !editingUser.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: any = {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
      };

      if (editingUser.role === 'student') {
        updateData.year_level = editingUser.year_level || '';
        updateData.section_id = editingUser.section_id;
      }

      if (editingUser.role !== 'admin') {
        updateData.department_id = editingUser.department_id;
      }

      await updateUserMutation.mutateAsync({ id: editingUser.id, userData: updateData });
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        description: "There was a problem updating the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      year_level: user.year_level,
      department_id: user.department_id,
      section_id: user.section_id,
      status: user.status || 'approved',
    });
    setSelectedDepartmentId(user.department_id?.toString() || '');
    setSelectedSectionId(user.section_id?.toString() || '');
    setIsEditDialogOpen(true);
  };

  const handleSubjectsClick = (teacher: User) => {
    setSelectedTeacher(teacher);
    setIsSubjectsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (
      !newUser.first_name ||
      !newUser.last_name ||
      !newUser.email ||
      !newUser.password
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (newUser.role !== "admin" && !selectedDepartmentId) {
      toast({
        title: "Department required",
        description: "Please select a department for this user.",
        variant: "destructive",
      });
      return;
    }

    if (newUser.role === "student" && !selectedSectionId) {
      toast({
        title: "Section required",
        description: "Please select a section for the student.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const department_id =
        newUser.role !== "admin" && selectedDepartmentId
          ? Number(selectedDepartmentId)
          : undefined;
      const section_id =
        newUser.role === "student" && selectedSectionId
          ? Number(selectedSectionId)
          : undefined;

      await createUserMutation.mutateAsync({
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        department_id,
        section_id,
        year_level: newUser.year_level ? Number(newUser.year_level) : undefined,
      });
      
      toast({
        title: "User created",
        description: "User has been created successfully.",
      });
      
      setIsAddUserOpen(false);
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        role: "student",
        password: "",
        department_id: "",
        section_id: "",
        year_level: "",
      });
      setSelectedDepartmentId("");
      setSelectedSectionId("");
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: "There was a problem creating the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveRequestMutation.mutateAsync(id);

      toast({
        title: "User Approved",
        description: "User has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error approving user",
        description: "There was a problem approving the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeny = async (id: number) => {
    try {
      await rejectRequestMutation.mutateAsync({ id });

      toast({
        title: "User Denied",
        description: "User has been denied successfully.",
      });
    } catch (error) {
      console.error("Error denying user:", error);
      toast({
        title: "Error denying user",
        description: "There was a problem denying the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);

      toast({
        title: "User Deleted",
        description: `${userToDelete.first_name} ${userToDelete.last_name} has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deleting user",
        description: "There was a problem deleting this user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user by filling in the required information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="First name"
                    value={newUser.first_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Last name"
                    value={newUser.last_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        role: value as
                          | "student"
                          | "instructor"
                          | "admin",
                      })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">
                        Administrator
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newUser.role !== "admin" && (
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
                )}
              </div>

              {newUser.role === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year_level">Year Level</Label>
                    <Select
                      value={newUser.year_level}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, year_level: value })
                      }
                    >
                      <SelectTrigger id="year_level">
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
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={selectedSectionId}
                      disabled={!selectedDepartmentId || !newUser.year_level}
                      onValueChange={(value) => setSelectedSectionId(value)}
                    >
                      <SelectTrigger id="section">
                        <SelectValue
                          placeholder={
                            !selectedDepartmentId || !newUser.year_level
                              ? "Select department and year level first"
                              : "Select section"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {sections
                          .filter((section) => {
                            // If we have department and year level filters applied, sections are already filtered
                            if (selectedDepartmentId && newUser.year_level) {
                              return true; // Sections are already filtered by server
                            }
                            // Fallback to client-side filtering for initial load
                            return (
                              section.department_id === Number(selectedDepartmentId) &&
                              section.year_level === Number(newUser.year_level)
                            );
                          })
                          .map((section) => (
                            <SelectItem
                              key={section.id}
                              value={String(section.id)}
                            >
                              {section.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleCreateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground mb-2">
                  Loading pending requests...
                </p>
              )}

              <div className="space-y-4">
                {!loading && pendingRegistrations.length === 0 && (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    No pending registration requests.
                  </div>
                )}

                {pendingRegistrations.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                        {user.request_date && (
                          <span className="text-xs text-muted-foreground">
                            Requested: {user.request_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(user.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeny(user.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingTotal > 0 && pendingLastPage > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {pendingPage} of {pendingLastPage} · {pendingTotal}{" "}
                      total pending request{pendingTotal === 1 ? "" : "s"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingPage <= 1 || pendingLoading}
                        onClick={() => setPendingPage(pendingPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingPage >= pendingLastPage || pendingLoading}
                        onClick={() => setPendingPage(pendingPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Students</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-sm text-muted-foreground mb-2">
                  Loading students...
                </p>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const filtered = students.filter((student) => {
                      const term = searchTerm.toLowerCase();
                      return (
                        `${student.first_name} ${student.last_name}`
                          .toLowerCase()
                          .includes(term) ||
                        student.email.toLowerCase().includes(term)
                      );
                    });

                    if (!loading && filtered.length === 0) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-6"
                          >
                            No students found matching your search.
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return filtered.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.id}
                        </TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department?.name || ""}</TableCell>
                        <TableCell>{student.year_level || ""}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditClick(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(student)}
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

              {studentsTotal > 0 && studentsLastPage > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {studentsPage} of {studentsLastPage} · {studentsTotal}{" "}
                    total student{studentsTotal === 1 ? "" : "s"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={studentsPage <= 1 || studentsLoading}
                      onClick={() => setStudentsPage(studentsPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={studentsPage >= studentsLastPage || studentsLoading}
                      onClick={() => setStudentsPage(studentsPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Instructors</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search instructors..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-6"
                      >
                        No instructors found.
                      </TableCell>
                    </TableRow>
                  )}

                  {teachers.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">
                        {instructor.id}
                      </TableCell>
                      <TableCell>{`${instructor.first_name} ${instructor.last_name}`}</TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>{instructor.department?.name || ""}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal text-primary hover:underline"
                          onClick={() => handleSubjectsClick(instructor)}
                        >
                          {instructor.subjects ? instructor.subjects.length : 0}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleEditClick(instructor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(instructor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                      disabled={teachersPage <= 1 || teachersLoading}
                      onClick={() => setTeachersPage(teachersPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={teachersPage >= teachersLastPage || teachersLoading}
                      onClick={() => setTeachersPage(teachersPage + 1)}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-first-name" className="text-right">
                First Name
              </Label>
              <Input
                id="edit-first-name"
                value={editingUser?.first_name || ''}
                onChange={(e) =>
                  setEditingUser(prev => prev ? { ...prev, first_name: e.target.value } : null)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-last-name" className="text-right">
                Last Name
              </Label>
              <Input
                id="edit-last-name"
                value={editingUser?.last_name || ''}
                onChange={(e) =>
                  setEditingUser(prev => prev ? { ...prev, last_name: e.target.value } : null)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) =>
                  setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)
                }
                className="col-span-3"
              />
            </div>
            
            {editingUser?.role !== 'admin' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">
                  Department
                </Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(value) => {
                    setSelectedDepartmentId(value);
                    setEditingUser(prev => prev ? { 
                      ...prev, 
                      department_id: Number(value),
                      section_id: undefined // Reset section when department changes
                    } : null);
                    setSelectedSectionId('');
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingUser?.role === 'student' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-section" className="text-right">
                    Section
                  </Label>
                  <Select
                    value={selectedSectionId}
                    onValueChange={(value) => {
                      setSelectedSectionId(value);
                      setEditingUser(prev => prev ? { 
                        ...prev, 
                        section_id: Number(value) 
                      } : null);
                    }}
                    disabled={!selectedDepartmentId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections
                        .filter(section => 
                          section.department_id === Number(selectedDepartmentId)
                        )
                        .map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            {section.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-year-level" className="text-right">
                    Year Level
                  </Label>
                  <Select
                    value={editingUser?.year_level?.toString() || ''}
                    onValueChange={(value) =>
                      setEditingUser(prev => prev ? { ...prev, year_level: parseInt(value) } : null)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleEditUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.first_name} {userToDelete?.last_name}? 
              This action cannot be undone and will permanently remove the user from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subjects Dialog */}
      <Dialog open={isSubjectsDialogOpen} onOpenChange={setIsSubjectsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Subjects - {selectedTeacher?.first_name} {selectedTeacher?.last_name}
            </DialogTitle>
            <DialogDescription>
              List of subjects assigned to this instructor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTeacher?.subjects && selectedTeacher.subjects.length > 0 ? (
              <div className="space-y-3">
                {selectedTeacher.subjects.map((subject: EnhancedSubject, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {subject.name || 'Unknown Subject'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subject.code || 'No Code'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {subject.sectionsCount || 0} section{(subject.sectionsCount || 0) !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="secondary">
                        {subject.units || 0} units
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No subjects assigned to this instructor.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubjectsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
