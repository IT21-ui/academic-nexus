import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import classApi from "@/services/classApi";
import { BookOpen, Clock, MapPin, User, Menu, Minimize, X } from "lucide-react";
import type { Class } from "@/types/models";
import { generateCorPdf } from "@/utils/corGenerator";
import api from '@/services/apiClient';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

const Subjects: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const getEnrollmentDate = (): string => {
    // Use the student's created_at date as the enrollment date
    if (user?.created_at) {
      return new Date(user.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
    
    // Fallback to current date if student created_at is not available
    return new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const handleGenerateCor = () => {
    const enrollmentDate = getEnrollmentDate();
    
    // Get program from user's department
    let program = 'Unknown Program';
    if (user?.department?.name) {
      // Extract year level from user data if available
      const yearLevel = user?.year_level ? `${user.year_level}${getOrdinalSuffix(user.year_level)}` : '';
      program = `${user.department.name}${yearLevel ? ' ' + yearLevel : ''}`;
    }
    
    generateCorPdf({
      user,
      classes,
      academicYear: '2025-2026 1st Term',
      program,
      registrarName: 'Grace B. Valde',
      registrarTitle: 'College Registrar',
      dateEnrolled: enrollmentDate,
      tuitionFee: 0.00,
      miscFee: 0.00,
    });
  };

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
    if (!time || typeof time !== "string") return "";
    
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    if (isNaN(hour) || isNaN(parseInt(minutes))) return "";
    
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Card
          className="overflow-hidden border-0 shadow-lg"
        >
          <div className="gradient-sidebar text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="ml-7 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-7 mt-2">
                    <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                  {/* Subject and Section */}
                  <div className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>
                      {classItem.subject?.code || "N/A"} (
                      {classItem.section?.name || "N/A"})
                    </span>
                  </div>
                  
                  {/* Schedules with bullet points and icons */}
                  <div className="ml-7 space-y-1">
                    {classItem.schedules && classItem.schedules.length > 0
                      ? classItem.schedules.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-600 text-sm font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>
                              {getDayName(s.day_of_week)} {formatTime(s.start_time)}-{formatTime(s.end_time)} {s.room || ""}
                            </span>
                          </div>
                        ))
                      : <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>No schedule</span>
                        </div>
                    }
                  </div>
                  
                  {/* Teacher name with icon */}
                  <div className="flex items-center gap-2 ml-7 mt-2 text-gray-600 font-semibold">
                    <User className="w-4 h-4" />
                    <span>
                      {classItem.teacher
                        ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
                        : "TBA"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleGenerateCor}
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
