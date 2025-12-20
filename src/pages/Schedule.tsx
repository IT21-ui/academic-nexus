import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import StudentSchedule from "./student/Schedule";
import InstructorSchedule from "./instructor/InstructorSchedule";

const Schedule: React.FC = () => {
  const { user } = useAuth();

  console.log('Schedule Component - User Role Check:', {
    user: user,
    role: user?.role,
    isInstructor: user?.role === "instructor",
    isStudent: user?.role === "student",
    isAdmin: user?.role === "admin"
  });

  if (user?.role === "instructor") {
    console.log('Schedule Component - Loading InstructorSchedule');
    return <InstructorSchedule />;
  }

  console.log('Schedule Component - Loading StudentSchedule (default)');
  // Default to student schedule for students and any other roles
  return <StudentSchedule />;
};

export default Schedule;
