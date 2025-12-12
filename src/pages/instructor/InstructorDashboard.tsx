import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/apiClient';
import { BookOpen, Users, FileSpreadsheet, ClipboardCheck, Calendar, GraduationCap } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
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
        
        // Fetch classes for this teacher
        const classesRes = await api.get(`/api/teachers/${user.id}/classes`);
        const teacherClasses = classesRes.data || [];
        setClasses(teacherClasses);

        // Calculate stats
        const totalStudents = teacherClasses.reduce((acc: number, cls: any) => 
          acc + (cls.students?.length || 0), 0
        );

        setStats({
          totalClasses: teacherClasses.length,
          totalStudents,
          pendingGrades: 8, // TODO: Calculate from actual data
          todayClasses: 3 // TODO: Calculate from schedule
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
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
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
              <p className="text-primary-foreground/80">Instructor ID: {user?.id}</p>
              <p className="text-primary-foreground/80">{user?.department?.name || 'Department'}</p>
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
                      <p className="text-sm text-muted-foreground mt-1">
                        {classItem.schedules && classItem.schedules.length > 0
                          ? `${getDayName(classItem.schedules[0].day)} ${formatTime(classItem.schedules[0].timeStart)}-${formatTime(classItem.schedules[0].timeEnd)}`
                          : 'Schedule TBD'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">{classItem.room || 'TBD'}</p>
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