import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/apiClient";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const scheduleRes = await api.get(`/api/students/${user.id}/schedule`);

        if (scheduleRes.data && scheduleRes.data.length > 0) {
          setSchedule(scheduleRes.data);
        }
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
    return <div className="p-6">Loading schedule...</div>;
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
          const daySchedule = schedule.find((s) => {
            return s.schedules?.some(
              (scheduleItem: any) => getDayName(scheduleItem.day) === day
            );
          });

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
                {daySchedule ? (
                  <div className="space-y-3">
                    {daySchedule.schedules?.map(
                      (scheduleItem: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {formatTime(scheduleItem.timeStart)} -{" "}
                              {formatTime(scheduleItem.timeEnd)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {daySchedule.subject?.name || "Subject"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {daySchedule.subject?.code || ""}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{daySchedule.room || "TBD"}</span>
                            </div>
                            {daySchedule.teacher && (
                              <div className="text-xs text-muted-foreground">
                                {daySchedule.teacher.first_name}{" "}
                                {daySchedule.teacher.last_name}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
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