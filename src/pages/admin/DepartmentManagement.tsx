import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Users, GraduationCap, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import departmentApi from "@/services/departmentApi";
import type { Department } from "@/types/models";

const DepartmentManagement: React.FC = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 6;
  const [newDept, setNewDept] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Find department head name
  const getDepartmentHeadName = (dept: Department) => {
    if (dept.head) {
      return `${dept.head.first_name} ${dept.head.last_name}`;
    }
    return "Not Assigned";
  };

  const fetchDepartments = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await departmentApi.getDepartments(page, perPage);
      setDepartments(response.data);
      setCurrentPage(response.current_page);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: "Error loading departments",
        description:
          "There was a problem fetching departments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(1);
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDept.name || !newDept.code) {
      toast({
        title: "Missing information",
        description: "Please provide both department name and code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await departmentApi.createDepartment({
        name: newDept.name,
        code: newDept.code,
        description: newDept.description || undefined,
      });

      // If the request did not throw, assume success (backend may not wrap in ApiResponse)
      const createdName =
        (response as any)?.data?.name ||
        (response as any)?.name ||
        newDept.name;

      toast({
        title: "Department created",
        description: `${createdName} has been created successfully.`,
      });
      setIsAddOpen(false);
      setNewDept({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (error) {
      toast({
        title: "Error creating department",
        description:
          "There was a problem creating the department. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Department Management
          </h1>
          <p className="text-muted-foreground">
            Manage academic departments and their heads
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
              <DialogDescription>
                Create a new academic department.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="e.g., Computer Science"
                    value={newDept.name}
                    onChange={(e) =>
                      setNewDept({ ...newDept, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-code">Code</Label>
                  <Input
                    id="dept-code"
                    placeholder="e.g., CS"
                    value={newDept.code}
                    onChange={(e) =>
                      setNewDept({ ...newDept, code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-description">Description (optional)</Label>
                <Input
                  id="dept-description"
                  placeholder="Short description of the department"
                  value={newDept.description}
                  onChange={(e) =>
                    setNewDept({ ...newDept, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleCreateDepartment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!loading && departments.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No departments found. Use the "Add Department" button to create one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-soft transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {dept.code}
                  </Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Department Head:{" "}
                <span className="text-foreground font-medium">
                  {getDepartmentHeadName(dept)}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Students
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {dept.students_count || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">
                      Instructors
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {dept.teachers_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Showing{" "}
            {departments.length > 0 ? (currentPage - 1) * perPage + 1 : 0} -{" "}
            {Math.min(currentPage * perPage, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => fetchDepartments(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === lastPage || loading}
              onClick={() => fetchDepartments(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
