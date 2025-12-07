import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockGrades, mockSections, getSubjectById } from '@/data/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Grades: React.FC = () => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-success';
    if (grade >= 80) return 'text-primary';
    if (grade >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getGradeBadge = (grade: number): { label: string; variant: 'success' | 'default' | 'secondary' | 'destructive' } => {
    if (grade >= 90) return { label: 'Excellent', variant: 'success' };
    if (grade >= 80) return { label: 'Good', variant: 'default' };
    if (grade >= 70) return { label: 'Fair', variant: 'secondary' };
    return { label: 'Needs Improvement', variant: 'destructive' };
  };

  // Filter grades for student 1 and calculate average
  const studentGrades = mockGrades.filter(g => g.student_id === 1);
  const averageGrade = studentGrades.length > 0
    ? Math.round(studentGrades.reduce((acc, g) => acc + (g.final_grade || 0), 0) / studentGrades.length)
    : 0;

  // Get subject info from section
  const getGradeSubjectInfo = (sectionId: number) => {
    const section = mockSections.find(s => s.id === sectionId);
    if (section && section.subject) {
      return {
        code: section.subject.code,
        name: section.subject.name,
      };
    }
    return { code: 'N/A', name: 'Unknown Subject' };
  };

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
            <p className="text-3xl font-bold text-foreground mt-2">{studentGrades.length}</p>
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
              {studentGrades.map((grade) => {
                const subjectInfo = getGradeSubjectInfo(grade.section_id);
                const finalGrade = grade.final_grade || 0;
                return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{subjectInfo.code}</TableCell>
                    <TableCell>{subjectInfo.name}</TableCell>
                    <TableCell className="text-center">{grade.midterm || '-'}</TableCell>
                    <TableCell className="text-center">{grade.finals || '-'}</TableCell>
                    <TableCell className={cn('text-center font-bold', getGradeColor(finalGrade))}>
                      {finalGrade}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadge(finalGrade).variant}>
                        {grade.remarks || grade.status}
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