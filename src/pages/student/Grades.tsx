import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/apiClient';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Grades: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradesData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const [gradesRes, sectionsRes] = await Promise.all([
          api.get(`/api/students/${user.id}/grades`),
          api.get('/api/sections')
        ]);

        setGrades(gradesRes.data || []);
        setSections(sectionsRes.data || []);
      } catch (error) {
        console.error('Error fetching grades data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGradesData();
  }, [user?.id]);

  // Filter grades for student and calculate average
  const averageGrade = grades.length > 0
    ? parseFloat((grades.reduce((acc, g) => acc + (g.final_grade || 0), 0) / grades.length).toFixed(1))
    : 0;

  const getGradeColor = (grade: number) => {
    if (grade <= 3.0) return 'text-success'; // PASSED
    return 'text-destructive'; // FAILED
  };

  const getGradeBadge = (grade: number): { label: string; variant: 'success' | 'default' | 'secondary' | 'destructive' } => {
    if (grade <= 3.0) return { label: 'PASSED', variant: 'success' };
    return { label: 'FAILED', variant: 'destructive' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading grades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Grades</h1>
        <p className="text-muted-foreground">Academic performance for current semester</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Average Grade</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold text-primary">{averageGrade}</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
            <p className="text-3xl font-bold text-foreground mt-2">{grades.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Passing Rate</p>
            <p className="text-3xl font-bold text-success mt-2">100%</p>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-center">Midterm</TableHead>
                <TableHead className="text-center">Finals</TableHead>
                <TableHead className="text-center">Final Grade</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => {
                const finalGrade = grade.final_grade || 0;
                return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.subject_code}</TableCell>
                    <TableCell>{grade.subject_name}</TableCell>
                    <TableCell className="text-center">{grade.midterm || '-'}</TableCell>
                    <TableCell className="text-center">{grade.finals || '-'}</TableCell>
                    <TableCell className={cn('text-center font-bold', getGradeColor(finalGrade))}>
                      {finalGrade}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadge(finalGrade).variant}>
                        {grade.remarks || 'N/A'}
                      </Badge>
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

export default Grades;