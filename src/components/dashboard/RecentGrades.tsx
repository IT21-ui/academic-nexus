import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GradeItem {
  subject: string;
  grade: number;
  status: string;
}

interface RecentGradesProps {
  grades: GradeItem[];
}

export const RecentGrades: React.FC<RecentGradesProps> = ({ grades }) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-success bg-success/10';
    if (grade >= 80) return 'text-primary bg-primary/10';
    if (grade >= 70) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Grades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {grades.map((grade, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div>
              <p className="font-medium text-foreground">{grade.subject}</p>
              <p className="text-sm text-muted-foreground">{grade.status}</p>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-lg font-semibold text-lg',
                getGradeColor(grade.grade)
              )}
            >
              {grade.grade}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
