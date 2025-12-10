import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSchedule, mockSubjects } from "@/data/mockData";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Schedule: React.FC = () => {
  const getSubjectName = (code: string) => {
    return mockSubjects.find((s) => s.code === code)?.name || code;
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
        <p className="text-muted-foreground">Weekly class timetable</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySchedule = mockSchedule.find((s) => s.day === day);
          const isToday = day === currentDay;

          return (
            <Card
              key={day}
              className={cn(
                "transition-all",
                isToday ? "ring-2 ring-primary shadow-soft" : ""
              )}
            >
              <CardHeader
                className={cn(
                  "py-3",
                  isToday ? "bg-primary/10" : "bg-muted/50"
                )}
              >
                <CardTitle className="text-base flex items-center justify-between">
                  {day}
                  {isToday && (
                    <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {daySchedule?.classes.length ? (
                  daySchedule.classes.map((cls, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-sm text-foreground">
                        {getSubjectName(cls.subject)}
                      </p>
                      <p className="text-xs text-primary font-medium mt-1">
                        {cls.subject}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {cls.time}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No classes
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;
