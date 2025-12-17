import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { UpcomingClasses } from '@/components/dashboard/UpcomingClasses';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentGrades } from '@/components/dashboard/RecentGrades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, ClipboardCheck, TrendingUp, FileSpreadsheet, GraduationCap } from 'lucide-react';
import studentApi from '@/services/studentApi';
import classApi from '@/services/classApi';
import subjectApi from '@/services/subjectApi';
import type { Grade, Attendance, Class, Subject } from '@/types/models';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch data with fallbacks for missing endpoints
        try {
          // Try student-specific endpoints first
          const [gradesRes, attendanceRes] = await Promise.all([
            studentApi.getStudentGrades(user.id),
            studentApi.getStudentAttendance(user.id)
          ]);
          
          // Handle paginated responses - extract data property if it exists
          const gradesData = (gradesRes?.data || gradesRes || []);
          console.log('Raw grades response:', gradesRes);
          console.log('Processed grades data:', gradesData);
          console.log('Grades data length:', gradesData?.length);
          setGrades(gradesData);
          const attendanceData = (attendanceRes?.data || attendanceRes || []);
          setAttendance(attendanceData);
        } catch (error) {
          console.error('Student API failed, using fallbacks:', error);
          // Set empty arrays for now - could add fallback logic here
          setGrades([]);
          setAttendance([]);
        }

        // Try student classes endpoint, fallback to general class API
        try {
          const classesRes = await studentApi.getStudentClasses(user.id);
          setClasses((classesRes?.data || classesRes || []));
        } catch (error) {
          console.log('Student classes endpoint not available, using fallback');
          // Fallback to general class API and filter for student
          const allClassesRes = await classApi.getClasses(1, 100, '');
          const studentClasses = (allClassesRes.data || []).filter(c => 
            (c.students || []).some(s => s.id === user.id)
          );
          setClasses(studentClasses);
        }

        // Fetch subjects (always works)
        const subjectsRes = await subjectApi.getSubjects(1, 100);
        setSubjects(subjectsRes.data || []);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Helper function to format time
  const formatTime = (time: string): string => {
    if (!time || typeof time !== "string") return "";
    
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    if (isNaN(hour) || isNaN(parseInt(minutes))) return "";
    
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get today's classes and transform to ClassItem format with safety checks
  const todayClasses = (classes || []).filter(c => 
    c?.schedules?.some(s => {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const scheduleDay = typeof s?.day_of_week === 'string' ? parseInt(s.day_of_week) : s?.day_of_week;
        return scheduleDay === dayOfWeek;
      } catch (error) {
        return false;
      }
    })
  ).map((c, i) => {
    try {
      // Get today's schedule for this class
      const todaySchedule = c?.schedules?.find(s => {
        try {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const scheduleDay = typeof s?.day_of_week === 'string' ? parseInt(s.day_of_week) : s?.day_of_week;
          return scheduleDay === dayOfWeek;
        } catch (error) {
          return false;
        }
      });
      
      return {
        time: todaySchedule ? `${formatTime(todaySchedule.start_time)} - ${formatTime(todaySchedule.end_time)}` : 'Time TBD',
        subject: c?.subject?.name || 'Unknown Subject',
        room: todaySchedule?.room || 'Room TBD',
        isNext: i === 0,
      };
    } catch (error) {
      console.error('Error processing class:', error);
      return {
        time: 'Time TBD',
        subject: 'Unknown Subject',
        room: 'Room TBD',
        isNext: i === 0,
      };
    }
  });

  // Calculate attendance statistics with safety checks
  const presentCount = attendance?.filter(a => a?.status === 'present')?.length || 0;
  const totalAttendance = attendance?.length || 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Calculate average grade with safety checks
  const averageGrade = grades?.length > 0
    ? Math.round(grades.reduce((acc, g) => {
        // Average midterm and final grades together, or use whatever is available
        const midterm = g?.midterm || 0;
        const final = g?.final_grade || g?.finals || 0;
        let grade = 0;
        
        if (midterm && final) {
          // Both midterm and final exist - average them
          grade = (midterm + final) / 2;
        } else if (final) {
          // Only final exists
          grade = final;
        } else if (midterm) {
          // Only midterm exists
          grade = midterm;
        }
        
        return acc + (typeof grade === 'number' ? grade : 0);
      }, 0) / grades.length)
    : 0;

  const quickActions = [
    { icon: FileSpreadsheet, label: 'View Grades', onClick: () => navigate('/grades') },
    { icon: Calendar, label: 'Schedule', onClick: () => navigate('/schedule') },
    { icon: ClipboardCheck, label: 'Attendance', onClick: () => navigate('/attendance') },
    { icon: BookOpen, label: 'Subjects', onClick: () => navigate('/subjects') },
  ];

  // Get subject info from section for recent grades with safety checks
  const getGradeSubjectInfo = (sectionId: number) => {
    try {
      // Find subject from classes
      const classWithSection = classes?.find(c => c?.section?.id === sectionId);
      if (classWithSection?.subject?.name) {
        return classWithSection.subject.name;
      }
      
      return 'Unknown Subject';
    } catch (error) {
      console.error('Error getting subject info:', error);
      return 'Unknown Subject';
    }
  };

  const recentGrades = grades?.slice(0, 4).map(g => {
    // Calculate grade using same logic as average calculation
    const midterm = g?.midterm || 0;
    const final = g?.final_grade || g?.finals || 0;
    let grade = 0;
    
    if (midterm && final) {
      // Both midterm and final exist - average them
      grade = (midterm + final) / 2;
    } else if (final) {
      // Only final exists
      grade = final;
    } else if (midterm) {
      // Only midterm exists
      grade = midterm;
    }
    
    // If grade exists but status is undefined, consider it approved
    const hasGrade = grade > 0;
    const gradeStatus = g?.status || (hasGrade ? 'approved' : 'pending');
    
    // Handle "posted" status - treat it as "approved" (type-safe check)
    const displayStatus = (gradeStatus as string) === 'posted' ? 'approved' : gradeStatus;
    
    return {
      subject: getGradeSubjectInfo(g?.section_id),
      grade: grade,
      status: displayStatus,
    };
  }) || [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.first_name}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
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
              <h2 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
              <p className="text-primary-foreground/80">Student ID: {user?.student_id}</p>
              <p className="text-primary-foreground/80">{user?.department?.name} • {user?.year_level ? `${user.year_level} Year` : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Subjects"
          value={(() => {
            // Count unique subjects from student's enrolled classes
            const uniqueSubjects = new Set();
            classes?.forEach(c => {
              if (c?.subject?.id) {
                uniqueSubjects.add(c.subject.id);
              }
            });
            return uniqueSubjects.size;
          })()}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          title="Average Grade"
          value={averageGrade}
          icon={TrendingUp}
          variant="secondary"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={ClipboardCheck}
          variant="accent"
        />
        <StatCard
          title="Total Units"
          value={(() => {
            // Get unique subjects from student's enrolled classes
            const uniqueSubjects = new Set();
            classes?.forEach(c => {
              if (c?.subject?.id) {
                uniqueSubjects.add(c.subject.id);
              }
            });
            
            // Calculate units from unique subjects
            let totalUnits = 0;
            uniqueSubjects.forEach(subjectId => {
              const subject = subjects?.find(s => s?.id === subjectId);
              if (subject?.units) {
                totalUnits += subject.units;
              }
            });
            
            return totalUnits;
          })()}
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