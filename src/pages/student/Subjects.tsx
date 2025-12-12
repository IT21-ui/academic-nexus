import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { BookOpen, Clock, MapPin, User } from "lucide-react";
import type { Subject } from "@/types/models";

const Subjects: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching subjects for user ID:", user.id);

        const scheduleRes = await api.students.getSchedule(user.id);
        console.log("Schedule API response:", scheduleRes);

        if (scheduleRes.data && scheduleRes.data.length > 0) {
          console.log(
            "Schedule data structure:",
            JSON.stringify(scheduleRes.data, null, 2)
          );

          const enrolledSubjects = scheduleRes.data
            .filter((section: any) => {
              console.log("Processing section:", section);
              console.log("Section subjects:", section.subjects);
              return section.subjects && section.subjects.length > 0;
            })
            .flatMap((section: any) => {
              console.log(
                "Flat mapping subjects from section:",
                section.subjects
              );
              return section.subjects;
            })
            .filter((subject: any, index: number, self: any[]) => {
              const isUnique =
                self.findIndex((s) => s.id === subject.id) === index;
              console.log(`Subject ${subject.name} is unique:`, isUnique);
              return isUnique;
            });

          console.log("Final extracted subjects:", enrolledSubjects);
          setSubjects(enrolledSubjects);
          setSections(scheduleRes.data);
        } else {
          console.log(
            "No schedule/sections found for student. Full response:",
            scheduleRes
          );
          setSubjects([]);
          setSections([]);
        }
      } catch (error: any) {
        console.error("Error fetching subjects data:", error);
        setError("Failed to load subjects. Please try again.");
        setSubjects([]);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectsData();
  }, [user?.id]);

  // Get section info for a subject - use actual class data
  const getSubjectSectionInfo = (subject: Subject) => {
    const classWithSubject = sections.find(
      (section: any) =>
        section.subjects &&
        section.subjects.some((s: Subject) => s.id === subject.id)
    );

    if (classWithSubject) {
      return {
        instructor: classWithSubject.teacher
          ? `${classWithSubject.teacher.first_name} ${classWithSubject.teacher.last_name}`
          : "TBA",
        schedule:
          classWithSubject.schedules &&
          classWithSubject.schedules.length > 0
            ? classWithSubject.schedules
                .map(
                  (s: any) =>
                    `${getDayName(s.day)} ${formatTime(
                      s.timeStart
                    )}-${formatTime(s.timeEnd)}`
                )
                .join(", ")
            : "TBD",
        room: classWithSubject.room || "TBD",
      };
    }

    return {
      instructor: "TBA",
      schedule: "TBD",
      room: "TBD",
    };
  };

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
        <div className="text-muted-foreground">Loading subjects...</div>
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

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-muted-foreground">
          No subjects enrolled for the current semester.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Subjects</h1>
        <p className="text-muted-foreground">
          Current semester enrolled subjects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const sectionInfo = getSubjectSectionInfo(subject);
          return (
            <Card key={subject.id} className="hover:shadow-soft transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {subject.code}
                    </Badge>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{sectionInfo.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{sectionInfo.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{sectionInfo.room}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    {subject.units} Units
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