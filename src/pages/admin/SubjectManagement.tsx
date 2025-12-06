import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockSubjects, mockDepartments, mockInstructors, mockStudents } from '@/data/mockData';
import { Search, Plus, Edit, Trash2, Users, Calendar, BookOpen, GraduationCap, X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'
];

interface Section {
  id: string;
  name: string;
  subjectId: string;
  instructor: string;
  schedule: string;
  room: string;
  students: string[];
}

const initialSections: Section[] = [
  { id: 'SEC001', name: 'Section A', subjectId: '1', instructor: 'Dr. Sarah Mitchell', schedule: 'MWF 9:00-10:00 AM', room: 'Room 201', students: ['STU001', 'STU002', 'STU003'] },
  { id: 'SEC002', name: 'Section B', subjectId: '1', instructor: 'Prof. James Wilson', schedule: 'TTH 1:00-2:30 PM', room: 'Room 202', students: ['STU004', 'STU005'] },
  { id: 'SEC003', name: 'Section A', subjectId: '2', instructor: 'Prof. James Wilson', schedule: 'TTH 9:00-10:30 AM', room: 'Room 305', students: ['STU001', 'STU002'] },
];

const SubjectManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState(mockSubjects.map(s => ({ ...s, department: 'Computer Science', yearLevel: '2nd Year' })));
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [newSubject, setNewSubject] = useState({
    code: '', name: '', units: '', department: '', yearLevel: '', instructor: ''
  });

  const [newSection, setNewSection] = useState({
    name: '', subjectId: '', instructor: '', day: '', time: '', room: ''
  });

  const filteredSubjects = subjects.filter(
    s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubject = () => {
    if (!newSubject.code || !newSubject.name || !newSubject.department) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const subject = {
      id: String(subjects.length + 1),
      code: newSubject.code,
      name: newSubject.name,
      units: parseInt(newSubject.units) || 3,
      instructor: newSubject.instructor || 'TBA',
      schedule: 'TBA',
      room: 'TBA',
      department: newSubject.department,
      yearLevel: newSubject.yearLevel
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ code: '', name: '', units: '', department: '', yearLevel: '', instructor: '' });
    setIsAddSubjectOpen(false);
    toast({ title: 'Subject Added', description: `${subject.name} has been added successfully.` });
  };

  const handleAddSection = () => {
    if (!newSection.name || !newSection.subjectId || !newSection.instructor) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const section: Section = {
      id: `SEC${String(sections.length + 1).padStart(3, '0')}`,
      name: newSection.name,
      subjectId: newSection.subjectId,
      instructor: newSection.instructor,
      schedule: `${newSection.day} ${newSection.time}`,
      room: newSection.room,
      students: []
    };

    setSections([...sections, section]);
    setNewSection({ name: '', subjectId: '', instructor: '', day: '', time: '', room: '' });
    setIsAddSectionOpen(false);
    toast({ title: 'Section Created', description: `${section.name} has been created successfully.` });
  };

  const handleRemoveStudent = (sectionId: string, studentId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, students: s.students.filter(id => id !== studentId) }
        : s
    ));
    toast({ title: 'Student Removed', description: 'Student has been removed from the section.' });
  };

  const handleAddStudent = (sectionId: string, studentId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, students: [...s.students, studentId] }
        : s
    ));
    toast({ title: 'Student Added', description: 'Student has been added to the section.' });
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);
  const getStudentById = (id: string) => mockStudents.find(s => s.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subject & Section Management</h1>
          <p className="text-muted-foreground">Manage subjects, sections, and student assignments</p>
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
                <DialogTitle>Create New Section</DialogTitle>
                <DialogDescription>Add a new section with instructor and schedule</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={newSection.subjectId} onValueChange={(v) => setNewSection({...newSection, subjectId: v})}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section Name</Label>
                  <Input placeholder="e.g., Section A" value={newSection.name} onChange={(e) => setNewSection({...newSection, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Select value={newSection.instructor} onValueChange={(v) => setNewSection({...newSection, instructor: v})}>
                    <SelectTrigger><SelectValue placeholder="Assign instructor" /></SelectTrigger>
                    <SelectContent>
                      {mockInstructors.map(i => (
                        <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={newSection.day} onValueChange={(v) => setNewSection({...newSection, day: v})}>
                      <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                      <SelectContent>
                        {days.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={newSection.time} onValueChange={(v) => setNewSection({...newSection, time: v})}>
                      <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Input placeholder="e.g., Room 201" value={newSection.room} onChange={(e) => setNewSection({...newSection, room: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSectionOpen(false)}>Cancel</Button>
                <Button variant="gradient" onClick={handleAddSection}>Create Section</Button>
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
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>Create a new subject for a specific department and year level</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input placeholder="e.g., CS101" value={newSubject.code} onChange={(e) => setNewSubject({...newSubject, code: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Units</Label>
                    <Input type="number" placeholder="3" value={newSubject.units} onChange={(e) => setNewSubject({...newSubject, units: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input placeholder="e.g., Introduction to Programming" value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newSubject.department} onValueChange={(v) => setNewSubject({...newSubject, department: v})}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {mockDepartments.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select value={newSubject.yearLevel} onValueChange={(v) => setNewSubject({...newSubject, yearLevel: v})}>
                    <SelectTrigger><SelectValue placeholder="Select year level" /></SelectTrigger>
                    <SelectContent>
                      {yearLevels.map(y => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Instructor (Optional)</Label>
                  <Select value={newSubject.instructor} onValueChange={(v) => setNewSubject({...newSubject, instructor: v})}>
                    <SelectTrigger><SelectValue placeholder="Assign instructor" /></SelectTrigger>
                    <SelectContent>
                      {mockInstructors.map(i => (
                        <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)}>Cancel</Button>
                <Button variant="gradient" onClick={handleAddSubject}>Add Subject</Button>
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
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.units}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.department}</Badge>
                      </TableCell>
                      <TableCell>{subject.yearLevel}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary">
                          {sections.filter(s => s.subjectId === subject.id).length} sections
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => {
                    const subject = getSubjectById(section.subjectId);
                    return (
                      <TableRow key={section.id}>
                        <TableCell>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs text-muted-foreground">{section.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{subject?.code}</Badge>
                          <div className="text-sm mt-1">{subject?.name}</div>
                        </TableCell>
                        <TableCell>{section.instructor}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {section.schedule}
                          </div>
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
                            {section.students.length} students
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manage Students Dialog */}
      <Dialog open={isManageStudentsOpen} onOpenChange={setIsManageStudentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Students - {selectedSection?.name}</DialogTitle>
            <DialogDescription>
              {getSubjectById(selectedSection?.subjectId || '')?.name} • {selectedSection?.schedule}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Select onValueChange={(studentId) => {
                if (selectedSection && !selectedSection.students.includes(studentId)) {
                  handleAddStudent(selectedSection.id, studentId);
                  setSelectedSection({
                    ...selectedSection,
                    students: [...selectedSection.students, studentId]
                  });
                }
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a student to this section..." />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.filter(s => !selectedSection?.students.includes(s.id)).map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.id} - {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <UserPlus className="w-4 h-4" />
              </Button>
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
                  {selectedSection?.students.map((studentId) => {
                    const student = getStudentById(studentId);
                    return (
                      <TableRow key={studentId}>
                        <TableCell>
                          <Badge variant="secondary">{studentId}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{student?.name}</TableCell>
                        <TableCell className="text-muted-foreground">{student?.email}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => {
                              if (selectedSection) {
                                handleRemoveStudent(selectedSection.id, studentId);
                                setSelectedSection({
                                  ...selectedSection,
                                  students: selectedSection.students.filter(id => id !== studentId)
                                });
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {selectedSection?.students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No students enrolled in this section yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageStudentsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectManagement;
