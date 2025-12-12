import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/apiClient";
import { BookOpen, Clock, MapPin, User } from "lucide-react";
import type { Subject, Class } from "@/types/models";

const Subjects: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassesData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching classes for user ID:", user.id);

        const scheduleRes = await api.get(`/api/students/${user.id}/schedule`);
        console.log("Schedule API response:", scheduleRes);

        if (scheduleRes.data && scheduleRes.data.length > 0) {
          console.log("Classes data:", scheduleRes.data);
          setClasses(scheduleRes.data);
        } else {
          console.log("No classes found for student.");
          setClasses([]);
        }
      } catch (error: any) {
        console.error("Error fetching classes data:", error);
        setError("Failed to load classes. Please try again.");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesData();
  }, [user?.id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-muted-foreground">
          No classes enrolled for the current semester.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">
          Current semester enrolled classes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem: any) => {
          return (
            <Card key={classItem.id} className="hover:shadow-soft transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {classItem.subject?.code || 'N/A'}
                    </Badge>
                    <CardTitle className="text-lg">{classItem.subject?.name || 'Unknown Subject'}</CardTitle>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    {classItem.teacher
                      ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
                      : "TBA"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {classItem.schedules && classItem.schedules.length > 0
                      ? classItem.schedules
                          .map(
                            (s: any) =>
                              `${getDayName(s.day)} ${formatTime(
                                s.timeStart
                              )}-${formatTime(s.timeEnd)}`
                          )
                          .join(", ")
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{classItem.room || "TBD"}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    {classItem.subject?.units || 0} Units
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Subjects;