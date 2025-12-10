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
import { Search, Plus, Edit, Trash2, Mail, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userApi from "@/services/userApi";
import type { User } from "@/types/models";

const TeacherManagement: React.FC = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teachersPage, setTeachersPage] = useState(1);
  const [teachersLastPage, setTeachersLastPage] = useState(1);
  const [teachersTotal, setTeachersTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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
          <p className="text-muted-foreground">
            Manage instructor profiles and assignments
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && teachers.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Loading instructors...
            </CardContent>
          </Card>
        )}

        {!loading && teachers.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No instructors found.
            </CardContent>
          </Card>
        )}

        {!loading &&
          teachers.map((instructor) => (
            <Card
              key={instructor.id}
              className="hover:shadow-soft transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {`${instructor.first_name?.[0] ?? ""}${
                        instructor.last_name?.[0] ?? ""
                      }`}
                    </span>
                  </div>
                  {/* <Badge variant="secondary">{instructor.id}</Badge> */}
                </div>
                <h3 className="font-semibold text-foreground">
                  {instructor.first_name} {instructor.last_name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {instructor.department?.name || "No department"}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {instructor.subjects ? instructor.subjects.length : 0}{" "}
                    subjects
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Teachers</CardTitle>
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
        </CardHeader>
        <CardContent>
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
                <TableHead>Assigned Subjects</TableHead>
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
                    <TableCell>
                      {instructor.subjects ? instructor.subjects.length : 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
