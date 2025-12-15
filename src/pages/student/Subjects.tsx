import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import classApi from "@/services/classApi";
import { BookOpen, Clock, MapPin, User, Menu, Minimize, X } from "lucide-react";
import type { Class } from "@/types/models";
import { generateCorPdf } from "@/utils/corGenerator";

const Subjects: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const fetchClassesData = async () => {
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

        setClasses(enrolled);
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
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
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
    <div className="p-4 space-y-4">
      {/* Main Window Card */}
      <Card
        className={`overflow-hidden border-0 shadow-lg transition-all duration-300 ${
          isMinimized ? "h-auto" : ""
        }`}
      >
        {/* Blue Header Bar */}
        <div className="gradient-sidebar text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 cursor-pointer hover:opacity-80" />
            <h1 className="text-lg font-semibold">Subjects</h1>
          </div>
          <div className="flex items-center gap-2">
            <Minimize
              className="w-5 h-5 cursor-pointer hover:opacity-80"
              onClick={() => setIsMinimized(!isMinimized)}
            />
            <X className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Content Area - Only show when not minimized */}
        {!isMinimized && (
          <CardContent className="p-4">
            <div className="space-y-3">
              {classes.map((classItem: any) => (
                <div
                  key={classItem.id}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span>
                        {classItem.subject?.code || "N/A"} (
                        {classItem.section?.name || "N/A"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
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
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      {classItem.teacher
                        ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
                        : "TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{classItem.section?.room || "TBD"}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => generateCorPdf(user, classes)}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Generate COR PDF
            </button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Subjects;
