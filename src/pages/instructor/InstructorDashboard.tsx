import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/apiClient';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';

import { BookOpen, Users, FileSpreadsheet, ClipboardCheck, Calendar, GraduationCap } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    todayClasses: 0
  });
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { icon: FileSpreadsheet, label: 'Grade Entry', onClick: () => navigate('/grade-entry') },
    { icon: ClipboardCheck, label: 'Attendance', onClick: () => navigate('/attendance-entry') },
    { icon: BookOpen, label: 'My Classes', onClick: () => navigate('/my-classes') },
    { icon: Calendar, label: 'Schedule', onClick: () => navigate('/schedule') },
  ];

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch teacher data
        const userRes = await api.get(`/api/users/${user.id}`);
        const userData = userRes.data;
        console.log('User department name from users table:', userData?.department?.name);
        setTeacherData(userData);
        
        // Fetch classes for this teacher
        const classesRes = await api.get(`/api/teachers/${user.id}/classes`);
        const teacherClasses = classesRes.data || [];
        setClasses(teacherClasses);

        // Calculate stats
        const totalStudents = teacherClasses.reduce((acc: number, cls: any) => 
          acc + (cls.students?.length || 0), 0
        );

        // Calculate pending grades by fetching grades for all students
        let pendingGradesCount = 0;
        if (teacherClasses.length > 0 && totalStudents > 0) {
          try {
            // Get all student IDs from all classes
            const allStudentIds = teacherClasses.flatMap((cls: any) => 
              cls.students?.map((student: any) => student.id) || []
            );
            
            // Remove duplicates
            const uniqueStudentIds = [...new Set(allStudentIds)];
            
            // Fetch grades for all students
            const gradePromises = uniqueStudentIds.map(studentId => 
              api.get(`/api/students/${studentId}/grades`).catch(() => ({ data: [] }))
            );
            
            const gradeResponses = await Promise.all(gradePromises);
            const allGrades = gradeResponses.flatMap(response => response.data || []);
            
            // Count pending grades (grades without final_grade or with status "pending")
            pendingGradesCount = allGrades.filter((grade: any) => {
              return !grade.final_grade || grade.status === 'pending';
            }).length;
            
            console.log('Pending grades calculation:', {
              totalStudents,
              uniqueStudentIds: uniqueStudentIds.length,
              totalGrades: allGrades.length,
              pendingGrades: pendingGradesCount
            });
            
          } catch (error) {
            console.error('Error fetching grades for pending calculation:', error);
            // Fallback to 0 if grade fetching fails
            pendingGradesCount = 0;
          }
        }

        // Calculate today's classes
        const today = new Date().getDay();
        const todayClasses = teacherClasses.filter((cls: any) => {
          if (!cls.schedules) return false;
          return cls.schedules.some((schedule: any) => {
            const scheduleDay = parseInt(schedule.day_of_week);
            return scheduleDay === today;
          });
        });

        setStats({
          totalClasses: teacherClasses.length,
          totalStudents,
          pendingGrades: pendingGradesCount,
          todayClasses: todayClasses.length
        });
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user?.id]);

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
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Summary */}
      <Card className="gradient-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{`${user?.first_name} ${user?.last_name}`}</h2>
              <p className="text-primary-foreground/80">Instructor ID: {user?.formatted_id || `IN${String(user?.id || '').padStart(2, '0')}`}</p>
              <p className="text-primary-foreground/80">{teacherData?.department?.name?.toUpperCase() || user?.department?.name?.toUpperCase() || 'DEPARTMENT'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Pending Grades"
          value={stats.pendingGrades}
          icon={FileSpreadsheet}
          variant="accent"
        />
        <StatCard
          title="Today's Classes"
          value={stats.todayClasses}
          icon={Calendar}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {classes.slice(0, 3).map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/my-classes')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {classItem.subject?.code} - {classItem.subject?.name}
                      </h4>
                      <div className="space-y-1">
                        {classItem.schedules && classItem.schedules.length > 0 ? (
                          classItem.schedules.map((schedule: any, index: number) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {getDayName(schedule.day_of_week)} {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)} • {schedule.room || 'TBD'}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Schedule TBD</p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {classItem.students?.length || 0} students
                    </span>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No classes assigned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;