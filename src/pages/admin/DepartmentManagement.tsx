import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDepartments } from '@/data/mockData';
import { Plus, Edit, Users, GraduationCap, Building } from 'lucide-react';

const DepartmentManagement: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">Manage academic departments and their heads</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-soft transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">{dept.code}</Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Department Head: <span className="text-foreground font-medium">{dept.head}</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Students</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{dept.students}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Instructors</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{dept.instructors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
