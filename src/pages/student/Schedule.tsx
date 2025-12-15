import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import classApi from "@/services/classApi";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Class } from "@/types/models";

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const allClasses: Class[] = [];
        let page = 1;
        let lastPage = 1;

        do {
          const res = await classApi.getClasses(page, 50, "");
          allClasses.push(...(res.data || []));
          lastPage = res.last_page || 1;
          page += 1;
        } while (page <= lastPage);

        const enrolled = allClasses.filter((c) =>
          (c.students || []).some((s) => s.id === user.id)
        );

        setSchedule(enrolled);
      } catch (error: any) {
        console.error("Failed to fetch schedule:", error);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.id]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading schedule...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (schedule.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
          <p className="text-muted-foreground">Weekly class timetable</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No classes scheduled for the current semester.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
        <p className="text-muted-foreground">Weekly class timetable</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayClasses = schedule.filter((c) =>
            c.schedules?.some(
              (scheduleItem) => getDayName(scheduleItem.day) === day
            )
          );

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
              <CardContent className="p-4">
                {dayClasses.length > 0 ? (
                  <div className="space-y-3">
                    {dayClasses.map((dayClass) => {
                      const schedulesForDay = (dayClass.schedules || []).filter(
                        (s) => getDayName(s.day) === day
                      );

                      return schedulesForDay.map((scheduleItem, index) => (
                        <div
                          key={`${dayClass.id}-${index}`}
                          className="space-y-2"
                        >
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {dayClass.subject?.name || "Subject"}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {formatTime(scheduleItem.timeStart)} -{" "}
                                {formatTime(scheduleItem.timeEnd)}
                              </span>
                            </div>
                            <div className="flex flex-row align-center gap-2 text-xs text-muted-foreground">
                              <div className="text-xs text-muted-foreground">
                                {dayClass.subject?.code || ""}
                              </div>
                              •
                              <div>
                                <span>{dayClass.section?.name || "TBD"}</span>
                              </div>
                              •
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                <span>{dayClass.section?.room || "TBD"}</span>
                              </div>
                            </div>
                            {dayClass.teacher && (
                              <div className="text-xs text-muted-foreground">
                                {dayClass.teacher.first_name}{" "}
                                {dayClass.teacher.last_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No classes
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions
const getDayName = (dayNumber: number): string => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return days[dayNumber - 1] || "Unknown";
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default Schedule;
