import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/student/Subjects";
import Grades from "./pages/student/Grades";
import Attendance from "./pages/student/Attendance";
import MyClasses from "./pages/instructor/MyClasses";
import GradeEntry from "./pages/instructor/GradeEntry";
import AttendanceEntry from "./pages/instructor/AttendanceEntry";
import InstructorSchedule from "./pages/instructor/InstructorSchedule";
import UserManagement from "./pages/admin/UserManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import ProgramManagement from "./pages/admin/ProgramManagement";
import NotFound from "./pages/NotFound";
import CorValidation from "./pages/validation/CorValidation";

import Schedule from "./pages/Schedule";
import ClassManagement from "./pages/admin/ClassManagement";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Student Routes */}
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/attendance" element={<Attendance />} />

              {/* Instructor Routes */}
              <Route path="/my-classes" element={<MyClasses />} />
              <Route path="/grade-entry" element={<GradeEntry />} />
              <Route path="/attendance-entry" element={<AttendanceEntry />} />
              <Route path="/instructorschedule" element={<InstructorSchedule />} />

              {/* Admin Routes */}
              <Route path="/users" element={<UserManagement />} />
              <Route
                path="/subject-management"
                element={<SubjectManagement />}
              />
              <Route path="/teachers" element={<TeacherManagement />} />
              <Route path="/programs" element={<ProgramManagement />} />
              <Route path="/class-management" element={<ClassManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Public Routes - No authentication required */}
            <Route path="/validate/cor" element={<CorValidation />} />
            <Route path="/validate/cor/:validationCode" element={<CorValidation />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
