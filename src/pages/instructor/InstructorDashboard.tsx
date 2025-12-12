import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockStudents, mockSections, getTeacherFullName } from '@/data/mockData';
import { BookOpen, Users, FileSpreadsheet, ClipboardCheck, Calendar, GraduationCap } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    { icon: FileSpreadsheet, label: 'Grade Entry', onClick: () => navigate('/grade-entry') },
    { icon: ClipboardCheck, label: 'Attendance', onClick: () => navigate('/attendance-entry') },
    { icon: BookOpen, label: 'My Classes', onClick: () => navigate('/my-classes') },
    { icon: Calendar, label: 'Schedule', onClick: () => navigate('/schedule') },
  ];

  // Get sections assigned to instructor 1
  const mySections = mockSections.filter(s => s.teacher_id === 1).slice(0, 2);

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
              <p className="text-primary-foreground/80">Instructor ID: {user?.instructorId}</p>
              <p className="text-primary-foreground/80">{user?.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={mySections.length}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          title="Total Students"
          value={mockStudents.length * 2}
          icon={Users}
          variant="secondary"
        />
        <StatCard
          title="Pending Grades"
          value={8}
          icon={FileSpreadsheet}
          variant="accent"
        />
        <StatCard
          title="Today's Classes"
          value={3}
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
              {mySections.map((section) => (
                <div
                  key={section.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/my-classes')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {section.subject?.code} - {section.subject?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.schedule_day} {section.schedule_time}
                      </p>
                      <p className="text-sm text-muted-foreground">{section.room}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {section.student_count || 0} students
                    </span>
                  </div>
                </div>
              ))}
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