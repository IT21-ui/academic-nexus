import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/services/apiClient';
import { Save, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type AttendanceStatus = 'present' | 'absent' | 'late';

const AttendanceEntry: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const classesRes = await api.get(`/api/teachers/${user.id}/classes`);
        setClasses(classesRes.data || []);
        
        if (classesRes.data?.length > 0) {
          setSelectedClassId(classesRes.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [user?.id]);

  useEffect(() => {
    const fetchClassStudents = async () => {
      if (!selectedClassId) return;

      try {
        const classRes = await api.get(`/api/classes/${selectedClassId}`);
        const classData = classRes.data;
        setStudents(classData.students || []);
        
        // Initialize attendance with existing data if available
        const initialAttendance: Record<number, AttendanceStatus> = {};
        classData.students?.forEach((student: any) => {
          initialAttendance[student.id] = 'present'; // Default to present
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error('Error fetching class students:', error);
      }
    };

    fetchClassStudents();
  }, [selectedClassId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading attendance entry...</div>
      </div>
    );
  }

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    
    try {
      setSaving(true);
      
      // Prepare attendance data for API
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        date: selectedDate,
        status: status,
        class_id: parseInt(selectedClassId)
      }));

      await api.post(`/api/classes/${selectedClassId}/attendance`, { attendance: attendanceData });
      
      toast({
        title: 'Attendance Saved',
        description: 'Attendance has been recorded successfully.',
      });
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  const getStatusButton = (studentId: number, status: AttendanceStatus, icon: React.ElementType, label: string) => {
    const Icon = icon;
    const isSelected = attendance[studentId] === status;
    
    return (
      <Button
        size="sm"
        variant={isSelected ? 'default' : 'outline'}
        className={cn(
          'gap-1',
          isSelected && status === 'present' && 'bg-success hover:bg-success/90',
          isSelected && status === 'absent' && 'bg-destructive hover:bg-destructive/90',
          isSelected && status === 'late' && 'bg-warning hover:bg-warning/90'
        )}
        onClick={() => handleStatusChange(studentId, status)}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Entry</h1>
          <p className="text-muted-foreground">Record student attendance for your classes</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Attendance
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mark Attendance</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.subject?.code} - {classItem.subject?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-0 outline-none text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {getStatusButton(student.id, 'present', CheckCircle, 'Present')}
                      {getStatusButton(student.id, 'absent', XCircle, 'Absent')}
                      {getStatusButton(student.id, 'late', Clock, 'Late')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No students found for this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceEntry;