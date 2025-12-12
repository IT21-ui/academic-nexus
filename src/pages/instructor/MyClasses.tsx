import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/apiClient';
import { Users, Clock, MapPin, FileSpreadsheet, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const classesRes = await api.get(`/api/teachers/${user.id}/classes`);
        setClasses(classesRes.data || []);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [user?.id]);

  const getDayName = (dayNumber: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return days[dayNumber - 1] || "Unknown";
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">Manage your assigned classes and students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-soft transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{classItem.subject?.code}</Badge>
                  <CardTitle>{classItem.subject?.name}</CardTitle>
                </div>
                <span className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Users className="w-4 h-4" />
                  {classItem.students?.length || 0} students
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {classItem.schedules && classItem.schedules.length > 0
                      ? `${getDayName(classItem.schedules[0].day)} ${formatTime(classItem.schedules[0].timeStart)}-${formatTime(classItem.schedules[0].timeEnd)}`
                      : 'Schedule TBD'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{classItem.room || 'TBD'}</span>
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
        {classes.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No classes assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClasses;