import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockStudents, mockSections, getStudentFullName } from '@/data/mockData';
import { Save, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GradeEntry: React.FC = () => {
  const { toast } = useToast();
  
  // Get sections assigned to instructor 1
  const mySections = mockSections.filter(s => s.teacher_id === 1);
  const [selectedSectionId, setSelectedSectionId] = useState(mySections[0]?.id.toString() || '');
  const [grades, setGrades] = useState<Record<number, { midterm: string; finals: string }>>({});

  const handleGradeChange = (studentId: number, field: 'midterm' | 'finals', value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Grades Saved',
      description: 'All grades have been saved successfully.',
    });
  };

  const selectedSection = mySections.find(s => s.id.toString() === selectedSectionId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grade Entry</h1>
          <p className="text-muted-foreground">Enter and manage student grades</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Grades
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Grades</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {mySections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.subject?.code} - {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Midterm</TableHead>
                <TableHead className="w-32">Finals</TableHead>
                <TableHead className="w-32">Final Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => {
                const studentGrades = grades[student.id] || { midterm: '', finals: '' };
                const midterm = parseFloat(studentGrades.midterm) || 0;
                const finals = parseFloat(studentGrades.finals) || 0;
                const finalGrade = midterm && finals ? Math.round((midterm + finals) / 2) : '-';

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{getStudentFullName(student)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={studentGrades.midterm}
                        onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={studentGrades.finals}
                        onChange={(e) => handleGradeChange(student.id, 'finals', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-primary">{finalGrade}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeEntry;