import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassItem {
  time: string;
  subject: string;
  room: string;
  isNext?: boolean;
}

interface UpcomingClassesProps {
  classes: ClassItem[];
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ classes }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today's Classes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No classes today</p>
        ) : (
          classes.map((classItem, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border transition-all',
                classItem.isNext
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border hover:border-primary/20'
              )}
            >
              {classItem.isNext && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full mb-2">
                  Next Class
                </span>
              )}
              <h4 className="font-semibold text-foreground">{classItem.subject}</h4>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {classItem.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {classItem.room}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
