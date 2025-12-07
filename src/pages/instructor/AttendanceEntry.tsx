import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockStudents, mockSections, getStudentFullName } from '@/data/mockData';
import { Save, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'late';

const AttendanceEntry: React.FC = () => {
  const { toast } = useToast();
  
  // Get sections assigned to instructor 1
  const mySections = mockSections.filter(s => s.teacher_id === 1);
  const [selectedSectionId, setSelectedSectionId] = useState(mySections[0]?.id.toString() || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Attendance Saved',
      description: 'Attendance has been recorded successfully.',
    });
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
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {mySections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.subject?.code} - {section.name}
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
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{getStudentFullName(student)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {getStatusButton(student.id, 'present', CheckCircle, 'Present')}
                      {getStatusButton(student.id, 'absent', XCircle, 'Absent')}
                      {getStatusButton(student.id, 'late', Clock, 'Late')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceEntry;