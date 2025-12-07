import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSubjects, mockSections, getTeacherFullName } from '@/data/mockData';
import { BookOpen, Clock, MapPin, User } from 'lucide-react';

const Subjects: React.FC = () => {
  // Get the first section for each subject to display schedule/room/instructor info
  const getSubjectSectionInfo = (subjectId: number) => {
    const section = mockSections.find(s => s.subject_id === subjectId);
    if (section) {
      return {
        instructor: section.teacher ? getTeacherFullName(section.teacher) : 'TBA',
        schedule: `${section.schedule_day} ${section.schedule_time}`,
        room: section.room,
      };
    }
    return {
      instructor: 'TBA',
      schedule: 'TBA',
      room: 'TBA',
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Subjects</h1>
        <p className="text-muted-foreground">Current semester enrolled subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSubjects.map((subject) => {
          const sectionInfo = getSubjectSectionInfo(subject.id);
          return (
            <Card key={subject.id} className="hover:shadow-soft transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">{subject.code}</Badge>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{sectionInfo.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{sectionInfo.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{sectionInfo.room}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    {subject.units} Units
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Subjects;