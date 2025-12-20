import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Calendar, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import userApi from '@/services/userApi';
import { studentApi } from '@/services/studentApi';
import api from '@/services/apiClient';

interface Notification {
  id: string;
  type: 'grade' | 'attendance' | 'schedule' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      const role = user.role?.toLowerCase();
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      try {
        setLoading(true);
        setError(null);

        // Admin notifications
        if (role === 'admin' || role === 'administrator') {
          const pending = await userApi.getRegistrationRequests('pending', 1, 5);
          const data = pending?.data || [];

          const mapped: Notification[] = data.map((req) => ({
            id: String(req.id),
            type: 'system',
            title: req.role === 'instructor' ? 'Instructor registration pending' : 'Student registration pending',
            message: `${req.first_name} ${req.last_name} (${req.email}) is awaiting approval.`,
            time: req.request_date || timeLabel,
            read: false,
          }));

          setNotifications(mapped);
          return;
        }

        // Instructor: basic reminders from real classes
        if (role === 'instructor') {
          const res = await api.get(`/api/teachers/${user.id}/classes`);
          const classes = res.data || [];

          const hasStudents = classes.some((c: any) => (c.students || []).length > 0);
          const hasSchedules = classes.some((c: any) => (c.schedules || []).length > 0);

          const mapped: Notification[] = [];

          if (hasStudents) {
            mapped.push({
              id: 'inst-grades',
              type: 'grade',
              title: 'Grades may need updating',
              message: 'You have classes with enrolled students. Check if there are grades that still need to be posted.',
              time: timeLabel,
              read: false,
            });
          }

          if (hasSchedules) {
            mapped.push({
              id: 'inst-attendance',
              type: 'attendance',
              title: 'Attendance may need updating',
              message: 'Some scheduled classes may still need attendance records.',
              time: timeLabel,
              read: false,
            });
          }

          setNotifications(mapped);
          return;
        }

        // Student: real latest grade and attendance events, plus enrollment
        if (role === 'student') {
          let grades: any[] = [];
          let attendance: any[] = [];
          let classes: any[] = [];

          try {
            const gradesRes = await studentApi.getStudentGrades(user.id);
            grades = (gradesRes?.data || gradesRes || []) as any[];
          } catch (e) {
            console.warn('Grades API failed:', e);
          }

          try {
            const attendanceRes = await studentApi.getStudentAttendance(user.id);
            attendance = (attendanceRes?.data || attendanceRes || []) as any[];
          } catch (e) {
            console.warn('Attendance API failed:', e);
          }

          try {
            const classesRes = await studentApi.getStudentClasses(user.id);
            classes = (classesRes?.data || classesRes || []) as any[];
          } catch (e) {
            console.warn('Classes API failed, using empty array:', e);
          }

          console.log('=== NOTIFICATION DEBUG ===');
          console.log('User role:', role);
          console.log('User ID:', user.id);
          console.log('Grades data:', grades);
          console.log('Grades length:', grades.length);
          console.log('Sample grade:', grades[0]);
          console.log('========================');

          const mapped: Notification[] = [];

          if (grades.length > 0) {
            const latest = grades[0];
            console.log('Creating grade notification for latest:', latest);
            mapped.push({
              id: `stud-grade-${latest.id || 'latest'}`,
              type: 'grade',
              title: 'New grade posted',
              message: `A new grade has been posted for one of your subjects.`,
              time: timeLabel,
              read: false,
            });
          } else {
            console.log('No grades found, skipping grade notification');
          }

          if (attendance.length > 0) {
            const latest = attendance[0];
            mapped.push({
              id: `stud-att-${latest.id || 'latest'}`,
              type: 'attendance',
              title: 'Attendance updated',
              message: `Your attendance for ${latest.date || 'a recent class'} has been recorded.`,
              time: timeLabel,
              read: false,
            });
          }

          // Enrollment notification: if the student is enrolled in at least one class
          if (classes.length > 0) {
            const firstClass = classes[0];
            const subjectName = firstClass.subject?.name || 'one of your subjects';

            mapped.push({
              id: `stud-enroll-${firstClass.id || 'any'}`,
              type: 'schedule',
              title: 'You are enrolled in a class',
              message: `You are enrolled in ${subjectName}. Check your schedule for full details.`,
              time: timeLabel,
              read: false,
            });
          }

          setNotifications(mapped);
          return;
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, user?.role]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'grade':
        return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
      case 'attendance':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        )}
        {unreadCount > 1 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b border-border hover:bg-muted/50 transition-colors',
                      !notification.read && 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              !notification.read && 'text-foreground'
                            )}
                          >
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-6"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
