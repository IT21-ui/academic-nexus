import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockStudents, mockSubjects } from '@/data/mockData';
import { Save, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GradeEntry: React.FC = () => {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState(mockSubjects[0].code);
  const [grades, setGrades] = useState<Record<string, { midterm: string; finals: string }>>({});

  const handleGradeChange = (studentId: string, field: 'midterm' | 'finals', value: string) => {
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
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {mockSubjects.slice(0, 2).map((subject) => (
                  <SelectItem key={subject.code} value={subject.code}>
                    {subject.code} - {subject.name}
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
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
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
