import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/services/apiClient';
import { Save, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const GradeEntry: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<number, { midterm: string; finals: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const classesRes = await api.get(`/api/teachers/${user.id}/classes`);
        setClasses(classesRes.data || []);
        
        if (classesRes.data?.length > 0) {
          setSelectedClassId(classesRes.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [user?.id]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClassId) return;

      try {
        const classRes = await api.get(`/api/classes/${selectedClassId}`);
        const classData = classRes.data;
        setStudents(classData.students || []);
        
        // Initialize grades with existing data if available
        const initialGrades: Record<number, { midterm: string; finals: string }> = {};
        classData.students?.forEach((student: any) => {
          initialGrades[student.id] = {
            midterm: student.pivot?.midterm || '',
            finals: student.pivot?.finals || ''
          };
        });
        setGrades(initialGrades);
      } catch (error) {
        console.error('Error fetching class students:', error);
      }
    };

    fetchClassStudents();
  }, [selectedClassId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading grade entry...</div>
      </div>
    );
  }

  const handleGradeChange = (studentId: number, field: 'midterm' | 'finals', value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    
    try {
      setSaving(true);
      
      // Prepare grades data for API
      const gradesData = Object.entries(grades).map(([studentId, grade]) => ({
        student_id: parseInt(studentId),
        midterm: grade.midterm ? parseFloat(grade.midterm) : null,
        finals: grade.finals ? parseFloat(grade.finals) : null,
        final_grade: grade.midterm && grade.finals 
          ? parseFloat(((parseFloat(grade.midterm) + parseFloat(grade.finals)) / 2).toFixed(1))
          : null
      }));

      await api.post(`/api/classes/${selectedClassId}/grades`, { grades: gradesData });
      
      toast({
        title: "Grades Saved",
        description: "Student grades have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving grades:', error);
      toast({
        title: "Error",
        description: "Failed to save grades. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.subject?.code} - {classItem.subject?.name}
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
              {students.map((student) => {
                const studentGrades = grades[student.id] || { midterm: '', finals: '' };
                const midterm = parseFloat(studentGrades.midterm) || 0;
                const finals = parseFloat(studentGrades.finals) || 0;
                const finalGrade = midterm && finals 
                  ? parseFloat(((midterm + finals) / 2).toFixed(1))
                  : '-';
                const isPassed = finalGrade !== '-' && finalGrade <= 3.0;

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="1.0-5.0"
                        value={studentGrades.midterm}
                        onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="1.0-5.0"
                        value={studentGrades.finals}
                        onChange={(e) => handleGradeChange(student.id, 'finals', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className={`font-bold ${isPassed ? 'text-success' : 'text-destructive'}`}>
                      {finalGrade} {finalGrade !== '-' && (isPassed ? '(PASSED)' : '(FAILED)')}
                    </TableCell>
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