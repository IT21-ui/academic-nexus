import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockSubjects, mockStudents } from '@/data/mockData';
import { Users, Clock, MapPin, FileSpreadsheet, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const myClasses = mockSubjects.slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">Manage your assigned classes and students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myClasses.map((cls) => (
          <Card key={cls.id} className="hover:shadow-soft transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{cls.code}</Badge>
                  <CardTitle>{cls.name}</CardTitle>
                </div>
                <span className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Users className="w-4 h-4" />
                  {mockStudents.length} students
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{cls.room}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/grade-entry')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Grades
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/attendance-entry')}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;
