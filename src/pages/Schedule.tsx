import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import StudentSchedule from "./student/Schedule";
import InstructorSchedule from "./instructor/InstructorSchedule";

const Schedule: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === "instructor") {
    return <InstructorSchedule />;
  }

  // Default to student schedule for students and any other roles
  return <StudentSchedule />;
};

export default Schedule;
