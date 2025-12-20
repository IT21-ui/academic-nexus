import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/services/apiClient';
import { Users, Clock, MapPin, FileSpreadsheet, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const itemsPerPage = 4;

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

  // Pagination calculations
  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = classes.slice(startIndex, endIndex);

  // Reset to page 1 when classes change
  useEffect(() => {
    setCurrentPage(1);
  }, [classes]);

  const getDayName = (dayNumber: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return days[dayNumber - 1] || "Unknown";
  };

  const formatTime = (time: string | undefined | null): string => {
    if (!time || typeof time !== "string") return "";
    
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    if (isNaN(hour) || isNaN(parseInt(minutes))) return "";
    
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
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
        {currentClasses.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-soft transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{classItem.subject?.code}</Badge>
                  <CardTitle>{classItem.subject?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Section: {classItem.section?.name || 'TBD'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Users className="w-4 h-4" />
                  {classItem.students?.length || 0} students
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Multiple Schedules */}
              <div className="space-y-2">
                {classItem.schedules && classItem.schedules.length > 0 ? (
                  classItem.schedules.map((schedule: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {getDayName(schedule.day_of_week)} {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)}
                      </span>
                      <MapPin className="w-4 h-4" />
                      <span>{schedule.room || 'TBD'}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Schedule TBD</span>
                  </div>
                )}
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
        {currentClasses.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {classes.length === 0 ? 'No classes assigned yet.' : 'No classes on this page.'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-sm text-muted-foreground">
              ({classes.length} total classes)
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyClasses;