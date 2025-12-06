import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentGrades } from '@/components/dashboard/RecentGrades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSubjects, mockGrades, mockSchedule, mockAttendance } from '@/data/mockData';
import { BookOpen, Calendar, ClipboardCheck, TrendingUp, FileSpreadsheet, GraduationCap } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const todayClasses = mockSchedule.find(s => s.day === 'Monday')?.classes.map((c, i) => ({
    ...c,
    isNext: i === 0,
  })) || [];

  const presentCount = mockAttendance.filter(a => a.status === 'Present').length;
  const totalAttendance = mockAttendance.length;
  const attendanceRate = Math.round((presentCount / totalAttendance) * 100);

  const averageGrade = Math.round(
    mockGrades.reduce((acc, g) => acc + g.finalGrade, 0) / mockGrades.length
  );

  const quickActions = [
    { icon: FileSpreadsheet, label: 'View Grades', onClick: () => navigate('/grades') },
    { icon: Calendar, label: 'Schedule', onClick: () => navigate('/schedule') },
    { icon: ClipboardCheck, label: 'Attendance', onClick: () => navigate('/attendance') },
    { icon: BookOpen, label: 'Subjects', onClick: () => navigate('/subjects') },
  ];

  const recentGrades = mockGrades.slice(0, 4).map(g => ({
    subject: g.subjectName,
    grade: g.finalGrade,
    status: g.status,
  }));

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
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-primary-foreground/80">Student ID: {user?.studentId}</p>
              <p className="text-primary-foreground/80">{user?.department} • 2nd Year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Subjects"
          value={mockSubjects.length}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          title="Average Grade"
          value={averageGrade}
          icon={TrendingUp}
          variant="secondary"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={ClipboardCheck}
          variant="accent"
        />
        <StatCard
          title="Total Units"
          value={mockSubjects.reduce((acc, s) => acc + s.units, 0)}
          icon={Calendar}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingClasses classes={todayClasses} />
          <RecentGrades grades={recentGrades} />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
