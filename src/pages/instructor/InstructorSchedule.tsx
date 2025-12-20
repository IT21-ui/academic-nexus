import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import classApi from "@/services/classApi";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Class } from "@/types/models";
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.id) return;

      console.log('Instructor Schedule - User:', {
        id: user.id,
        formatted_id: user.formatted_id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      });

      try {
        setLoading(true);
        setError(null);

        // Fetch classes taught by this instructor
        const res = await classApi.getClassesByTeacher(user.id);

        // Debug: Log the actual response structure
        console.log('Instructor Schedule API Response:', res);
        console.log('Response data:', res.data);
        console.log('Is data array?', Array.isArray(res.data));
        console.log('Data length:', res.data?.length);

        // Handle ApiResponse structure
        const classesData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        console.log('Final classes data:', classesData);
        console.log('Classes with schedules:', classesData.map(c => ({
          id: c.id,
          subject: c.subject?.name,
          hasSchedules: !!c.schedules,
          scheduleCount: c.schedules?.length || 0
        })));
        
        setSchedule(classesData);
      } catch (error: any) {
        console.error("Failed to fetch schedule:", error);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.id]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
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
          <h1 className="text-2xl font-bold text-foreground">Teaching Schedule</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No classes assigned for the current semester.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teaching Schedule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {days.map((day) => {
          const dayClasses = schedule.filter((c) =>
            c.schedules?.some(
              (scheduleItem) => {
                const dayNumber = typeof scheduleItem.day_of_week === 'string' 
                  ? parseInt(scheduleItem.day_of_week) 
                  : (scheduleItem.day_of_week || 1);
                const dayName = getDayName(dayNumber);
                return dayName === day;
              }
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
                        (s) => {
                          const dayNumber = typeof s.day_of_week === 'string' 
                            ? parseInt(s.day_of_week) 
                            : (s.day_of_week || 1);
                          const dayName = getDayName(dayNumber);
                          return dayName === day;
                        }
                      );

                      return schedulesForDay.map((scheduleItem, index) => (
                        <div
                          key={`${dayClass.id}-${index}`}
                          className="space-y-2"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-sm">
                              {dayClass.subject?.name || "Subject"}
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: '#800000' }}>
                              <Clock className="w-4 h-4" style={{ color: '#800000' }} />
                              <span>
                                {formatTime(scheduleItem.start_time)} -{" "}
                                {formatTime(scheduleItem.end_time)}
                              </span>
                            </div>
                            <div className="flex flex-row align-center gap-2 text-xs text-muted-foreground">
                              <div className="text-xs" style={{ color: '#800000' }}>
                                {dayClass.subject?.code || ""}
                              </div>
                              •
                              <div>
                                <span>{dayClass.section?.name || "TBD"}</span>
                              </div>
                              •
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" style={{ color: '#800000' }} />
                                <span style={{ color: '#800000' }}>{scheduleItem.room || "TBD"}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dayClass.students?.length === 0 
                                ? 'No student enrolled' 
                                : `${dayClass.students?.length || 0} ${dayClass.students?.length === 1 ? 'student' : 'students'} enrolled`
                              }
                            </div>
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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayNumber - 1] || "Unknown";
};

const formatTime = (time: string): string => {
  if (!time || typeof time !== "string") return "";
  
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  if (isNaN(hour) || isNaN(parseInt(minutes))) return "";
  
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default Schedule;
