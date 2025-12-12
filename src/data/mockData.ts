// Mock data matching Laravel backend structure
import type {
  Department,
  YearLevel,
  Subject,
  Section,
  Student,
  Teacher,
  Grade,
  Attendance,
  RegistrationRequest,
} from '@/types/models';

// Year Levels
export const mockYearLevels: YearLevel[] = [
  { id: 1, name: '1st Year', level: 1 },
  { id: 2, name: '2nd Year', level: 2 },
  { id: 3, name: '3rd Year', level: 3 },
  { id: 4, name: '4th Year', level: 4 },
];

// Departments
export const mockDepartments: Department[] = [
  { id: 1, name: 'Computer Science', code: 'CS', description: 'Department of Computer Science', students_count: 450, teachers_count: 12 },
  { id: 2, name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics', students_count: 320, teachers_count: 8 },
  { id: 3, name: 'English', code: 'ENG', description: 'Department of English', students_count: 280, teachers_count: 6 },
  { id: 4, name: 'Physics', code: 'PHYS', description: 'Department of Physics', students_count: 200, teachers_count: 5 },
  { id: 5, name: 'Engineering', code: 'ENGR', description: 'Department of Engineering', students_count: 380, teachers_count: 10 },
];

// Teachers/Instructors
export const mockTeachers: Teacher[] = [
  { id: 1, user_id: 1, teacher_id: 'INS001', first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah.mitchell@university.edu', phone: '+1-555-0101', department_id: 1, status: 'approved', department: mockDepartments[0] },
  { id: 2, user_id: 2, teacher_id: 'INS002', first_name: 'James', last_name: 'Wilson', email: 'james.wilson@university.edu', phone: '+1-555-0102', department_id: 1, status: 'approved', department: mockDepartments[0] },
  { id: 3, user_id: 3, teacher_id: 'INS003', first_name: 'Emily', last_name: 'Brown', email: 'emily.brown@university.edu', phone: '+1-555-0103', department_id: 2, status: 'approved', department: mockDepartments[1] },
  { id: 4, user_id: 4, teacher_id: 'INS004', first_name: 'Michael', last_name: 'Lee', email: 'michael.lee@university.edu', phone: '+1-555-0104', department_id: 3, status: 'approved', department: mockDepartments[2] },
  { id: 5, user_id: 5, teacher_id: 'INS005', first_name: 'Robert', last_name: 'Chen', email: 'robert.chen@university.edu', phone: '+1-555-0105', department_id: 4, status: 'approved', department: mockDepartments[3] },
];

// Students
export const mockStudents: Student[] = [
  { id: 1, user_id: 10, student_id: 'STU001', first_name: 'John', last_name: 'Anderson', email: 'john.anderson@university.edu', phone: '+1-555-1001', department_id: 1, year_level_id: 2, status: 'approved', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 2, user_id: 11, student_id: 'STU002', first_name: 'Emma', last_name: 'Williams', email: 'emma.williams@university.edu', phone: '+1-555-1002', department_id: 1, year_level_id: 2, status: 'approved', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 3, user_id: 12, student_id: 'STU003', first_name: 'Michael', last_name: 'Brown', email: 'michael.brown@university.edu', phone: '+1-555-1003', department_id: 1, year_level_id: 2, status: 'approved', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 4, user_id: 13, student_id: 'STU004', first_name: 'Sophia', last_name: 'Davis', email: 'sophia.davis@university.edu', phone: '+1-555-1004', department_id: 1, year_level_id: 2, status: 'approved', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 5, user_id: 14, student_id: 'STU005', first_name: 'James', last_name: 'Miller', email: 'james.miller@university.edu', phone: '+1-555-1005', department_id: 1, year_level_id: 2, status: 'approved', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 6, user_id: 15, student_id: 'STU006', first_name: 'Olivia', last_name: 'Wilson', email: 'olivia.wilson@university.edu', phone: '+1-555-1006', department_id: 2, year_level_id: 1, status: 'approved', department: mockDepartments[1], year_level: mockYearLevels[0] },
  { id: 7, user_id: 16, student_id: 'STU007', first_name: 'William', last_name: 'Taylor', email: 'william.taylor@university.edu', phone: '+1-555-1007', department_id: 2, year_level_id: 3, status: 'approved', department: mockDepartments[1], year_level: mockYearLevels[2] },
];

// Subjects
export const mockSubjects: Subject[] = [
  { id: 1, code: 'CS101', name: 'Introduction to Programming', description: 'Fundamentals of programming using Python', units: 3, department_id: 1, year_level_id: 1, department: mockDepartments[0], year_level: mockYearLevels[0] },
  { id: 2, code: 'CS102', name: 'Data Structures', description: 'Study of data organization and algorithms', units: 3, department_id: 1, year_level_id: 2, department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 3, code: 'CS201', name: 'Object-Oriented Programming', description: 'OOP concepts and design patterns', units: 3, department_id: 1, year_level_id: 2, department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 4, code: 'CS301', name: 'Database Systems', description: 'Relational databases and SQL', units: 3, department_id: 1, year_level_id: 3, department: mockDepartments[0], year_level: mockYearLevels[2] },
  { id: 5, code: 'MATH101', name: 'Calculus I', description: 'Differential calculus', units: 4, department_id: 2, year_level_id: 1, department: mockDepartments[1], year_level: mockYearLevels[0] },
  { id: 6, code: 'MATH201', name: 'Calculus II', description: 'Integral calculus', units: 4, department_id: 2, year_level_id: 2, department: mockDepartments[1], year_level: mockYearLevels[1] },
  { id: 7, code: 'ENG101', name: 'Technical Writing', description: 'Writing skills for technical documentation', units: 3, department_id: 3, year_level_id: 1, department: mockDepartments[2], year_level: mockYearLevels[0] },
  { id: 8, code: 'PHYS101', name: 'Physics I', description: 'Mechanics and thermodynamics', units: 4, department_id: 4, year_level_id: 1, department: mockDepartments[3], year_level: mockYearLevels[0] },
];

// Sections
export const mockSections: Section[] = [
  { id: 1, name: 'Section A', subject_id: 1, teacher_id: 1, schedule_day: 'MWF', schedule_time: '9:00 AM - 10:00 AM', room: 'Room 201', max_students: 40, subject: mockSubjects[0], teacher: mockTeachers[0], student_count: 35 },
  { id: 2, name: 'Section B', subject_id: 1, teacher_id: 2, schedule_day: 'TTH', schedule_time: '1:00 PM - 2:30 PM', room: 'Room 202', max_students: 40, subject: mockSubjects[0], teacher: mockTeachers[1], student_count: 32 },
  { id: 3, name: 'Section A', subject_id: 2, teacher_id: 2, schedule_day: 'TTH', schedule_time: '9:00 AM - 10:30 AM', room: 'Room 305', max_students: 35, subject: mockSubjects[1], teacher: mockTeachers[1], student_count: 28 },
  { id: 4, name: 'Section A', subject_id: 3, teacher_id: 1, schedule_day: 'MWF', schedule_time: '11:00 AM - 12:00 PM', room: 'Room 301', max_students: 35, subject: mockSubjects[2], teacher: mockTeachers[0], student_count: 30 },
  { id: 5, name: 'Section A', subject_id: 5, teacher_id: 3, schedule_day: 'MWF', schedule_time: '10:00 AM - 11:00 AM', room: 'Room 102', max_students: 45, subject: mockSubjects[4], teacher: mockTeachers[2], student_count: 42 },
  { id: 6, name: 'Section A', subject_id: 6, teacher_id: 3, schedule_day: 'TTH', schedule_time: '2:00 PM - 3:30 PM', room: 'Room 103', max_students: 40, subject: mockSubjects[5], teacher: mockTeachers[2], student_count: 38 },
  { id: 7, name: 'Section A', subject_id: 7, teacher_id: 4, schedule_day: 'TTH', schedule_time: '9:00 AM - 10:30 AM', room: 'Room 408', max_students: 30, subject: mockSubjects[6], teacher: mockTeachers[3], student_count: 25 },
  { id: 8, name: 'Section A', subject_id: 8, teacher_id: 5, schedule_day: 'MWF', schedule_time: '2:00 PM - 3:00 PM', room: 'Lab 101', max_students: 25, subject: mockSubjects[7], teacher: mockTeachers[4], student_count: 22 },
];

// Grades for students
export const mockGrades: Grade[] = [
  { id: 1, student_id: 1, section_id: 3, midterm: 88, finals: 92, final_grade: 90, remarks: 'Excellent', status: 'approved', section: mockSections[2] },
  { id: 2, student_id: 1, section_id: 4, midterm: 85, finals: 88, final_grade: 87, remarks: 'Very Good', status: 'approved', section: mockSections[3] },
  { id: 3, student_id: 1, section_id: 6, midterm: 78, finals: 82, final_grade: 80, remarks: 'Good', status: 'approved', section: mockSections[5] },
  { id: 4, student_id: 1, section_id: 7, midterm: 90, finals: 94, final_grade: 92, remarks: 'Excellent', status: 'approved', section: mockSections[6] },
  { id: 5, student_id: 1, section_id: 8, midterm: 75, finals: 80, final_grade: 78, remarks: 'Good', status: 'approved', section: mockSections[7] },
  { id: 6, student_id: 2, section_id: 3, midterm: 92, finals: 95, final_grade: 94, remarks: 'Outstanding', status: 'approved', section: mockSections[2] },
  { id: 7, student_id: 2, section_id: 4, midterm: 88, finals: 90, final_grade: 89, remarks: 'Very Good', status: 'approved', section: mockSections[3] },
];

// Attendance records
export const mockAttendance: Attendance[] = [
  { id: 1, student_id: 1, section_id: 3, date: '2024-01-15', status: 'present' },
  { id: 2, student_id: 1, section_id: 6, date: '2024-01-15', status: 'present' },
  { id: 3, student_id: 1, section_id: 3, date: '2024-01-16', status: 'present' },
  { id: 4, student_id: 1, section_id: 7, date: '2024-01-16', status: 'absent' },
  { id: 5, student_id: 1, section_id: 4, date: '2024-01-17', status: 'present' },
  { id: 6, student_id: 1, section_id: 8, date: '2024-01-17', status: 'late' },
  { id: 7, student_id: 1, section_id: 3, date: '2024-01-18', status: 'present' },
  { id: 8, student_id: 1, section_id: 4, date: '2024-01-19', status: 'present' },
  { id: 9, student_id: 2, section_id: 3, date: '2024-01-15', status: 'present' },
  { id: 10, student_id: 2, section_id: 4, date: '2024-01-15', status: 'present' },
];

// Pending registration requests
export const mockPendingRegistrations: RegistrationRequest[] = [
  { id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.j@email.com', phone: '+1-555-2001', role: 'student', department_id: 1, year_level_id: 1, password: '', status: 'pending', request_date: '2024-01-20', department: mockDepartments[0], year_level: mockYearLevels[0] },
  { id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob.s@email.com', phone: '+1-555-2002', role: 'instructor', department_id: 2, password: '', status: 'pending', request_date: '2024-01-19', department: mockDepartments[1] },
  { id: 3, first_name: 'Carol', last_name: 'White', email: 'carol.w@email.com', phone: '+1-555-2003', role: 'student', department_id: 1, year_level_id: 2, password: '', status: 'pending', request_date: '2024-01-18', department: mockDepartments[0], year_level: mockYearLevels[1] },
  { id: 4, first_name: 'David', last_name: 'Green', email: 'david.g@email.com', phone: '+1-555-2004', role: 'student', department_id: 3, year_level_id: 1, password: '', status: 'pending', request_date: '2024-01-17', department: mockDepartments[2], year_level: mockYearLevels[0] },
];

// Schedule data for weekly view
export const mockSchedule = [
  { day: 'Monday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201', section: mockSections[0] },
    { time: '11:00 AM - 12:00 PM', subject: 'CS201', room: 'Room 301', section: mockSections[3] },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101', section: mockSections[7] },
  ]},
  { day: 'Tuesday', classes: [
    { time: '9:00 AM - 10:30 AM', subject: 'ENG101', room: 'Room 408', section: mockSections[6] },
    { time: '2:00 PM - 3:30 PM', subject: 'MATH201', room: 'Room 103', section: mockSections[5] },
  ]},
  { day: 'Wednesday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201', section: mockSections[0] },
    { time: '11:00 AM - 12:00 PM', subject: 'CS201', room: 'Room 301', section: mockSections[3] },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101', section: mockSections[7] },
  ]},
  { day: 'Thursday', classes: [
    { time: '9:00 AM - 10:30 AM', subject: 'CS102', room: 'Room 305', section: mockSections[2] },
    { time: '9:00 AM - 10:30 AM', subject: 'ENG101', room: 'Room 408', section: mockSections[6] },
    { time: '2:00 PM - 3:30 PM', subject: 'MATH201', room: 'Room 103', section: mockSections[5] },
  ]},
  { day: 'Friday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201', section: mockSections[0] },
    { time: '11:00 AM - 12:00 PM', subject: 'CS201', room: 'Room 301', section: mockSections[3] },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101', section: mockSections[7] },
  ]},
];

// Helper functions
export const getTeacherFullName = (teacher: Teacher): string => 
  `${teacher.first_name} ${teacher.last_name}`;

export const getStudentFullName = (student: Student): string => 
  `${student.first_name} ${student.last_name}`;

export const getDepartmentById = (id: number): Department | undefined => 
  mockDepartments.find(d => d.id === id);

export const getYearLevelById = (id: number): YearLevel | undefined => 
  mockYearLevels.find(y => y.id === id);

export const getSubjectById = (id: number): Subject | undefined => 
  mockSubjects.find(s => s.id === id);

export const getSectionById = (id: number): Section | undefined => 
  mockSections.find(s => s.id === id);

export const getTeacherById = (id: number): Teacher | undefined => 
  mockTeachers.find(t => t.id === id);

export const getStudentById = (id: number): Student | undefined => 
  mockStudents.find(s => s.id === id);

export const getStudentByStudentId = (studentId: string): Student | undefined => 
  mockStudents.find(s => s.student_id === studentId);

export const getTeacherByTeacherId = (teacherId: string): Teacher | undefined => 
  mockTeachers.find(t => t.teacher_id === teacherId);

// Legacy exports for backward compatibility with existing components
export const mockInstructors = mockTeachers.map(t => ({
  id: t.teacher_id,
  name: getTeacherFullName(t),
  email: t.email,
  department: t.department?.name || '',
  subjects: mockSections.filter(s => s.teacher_id === t.id).length,
}));
