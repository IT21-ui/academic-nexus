import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAttendance, mockSubjects } from '@/data/mockData';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Attendance: React.FC = () => {
  const presentCount = mockAttendance.filter(a => a.status === 'Present').length;
  const absentCount = mockAttendance.filter(a => a.status === 'Absent').length;
  const lateCount = mockAttendance.filter(a => a.status === 'Late').length;
  const totalCount = mockAttendance.length;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Absent':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'Late':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Present':
        return 'default';
      case 'Absent':
        return 'destructive';
      case 'Late':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSubjectName = (code: string) => {
    return mockSubjects.find(s => s.code === code)?.name || code;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Record</h1>
        <p className="text-muted-foreground">Track your class attendance history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">{presentCount}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6 text-center">
            <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-destructive">{absentCount}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">{lateCount}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-primary">{attendanceRate}%</p>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendance.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.subject}</TableCell>
                  <TableCell>{getSubjectName(record.subject)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge
                        variant={getStatusBadgeVariant(record.status)}
                        className={cn(
                          record.status === 'Present' && 'bg-success text-success-foreground',
                          record.status === 'Late' && 'bg-warning text-warning-foreground'
                        )}
                      >
                        {record.status}
                      </Badge>
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

export default Attendance;
