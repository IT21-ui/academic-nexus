export const mockSubjects = [
  { id: '1', code: 'CS101', name: 'Introduction to Programming', units: 3, instructor: 'Dr. Sarah Mitchell', schedule: 'MWF 9:00-10:00 AM', room: 'Room 201' },
  { id: '2', code: 'CS102', name: 'Data Structures', units: 3, instructor: 'Prof. James Wilson', schedule: 'TTH 1:00-2:30 PM', room: 'Room 305' },
  { id: '3', code: 'MATH201', name: 'Calculus II', units: 4, instructor: 'Dr. Emily Brown', schedule: 'MWF 11:00-12:00 PM', room: 'Room 102' },
  { id: '4', code: 'ENG101', name: 'Technical Writing', units: 3, instructor: 'Prof. Michael Lee', schedule: 'TTH 9:00-10:30 AM', room: 'Room 408' },
  { id: '5', code: 'PHYS101', name: 'Physics I', units: 4, instructor: 'Dr. Robert Chen', schedule: 'MWF 2:00-3:00 PM', room: 'Lab 101' },
];

export const mockGrades = [
  { subjectCode: 'CS101', subjectName: 'Introduction to Programming', midterm: 88, finals: 92, finalGrade: 90, status: 'Passed' },
  { subjectCode: 'CS102', subjectName: 'Data Structures', midterm: 85, finals: 88, finalGrade: 87, status: 'Passed' },
  { subjectCode: 'MATH201', subjectName: 'Calculus II', midterm: 78, finals: 82, finalGrade: 80, status: 'Passed' },
  { subjectCode: 'ENG101', subjectName: 'Technical Writing', midterm: 90, finals: 94, finalGrade: 92, status: 'Passed' },
  { subjectCode: 'PHYS101', subjectName: 'Physics I', midterm: 75, finals: 80, finalGrade: 78, status: 'Passed' },
];

export const mockAttendance = [
  { date: '2024-01-15', subject: 'CS101', status: 'Present' },
  { date: '2024-01-15', subject: 'MATH201', status: 'Present' },
  { date: '2024-01-16', subject: 'CS102', status: 'Present' },
  { date: '2024-01-16', subject: 'ENG101', status: 'Absent' },
  { date: '2024-01-17', subject: 'CS101', status: 'Present' },
  { date: '2024-01-17', subject: 'PHYS101', status: 'Late' },
  { date: '2024-01-18', subject: 'CS102', status: 'Present' },
  { date: '2024-01-19', subject: 'CS101', status: 'Present' },
];

export const mockStudents = [
  { id: 'STU001', name: 'John Anderson', email: 'john.anderson@university.edu', department: 'Computer Science', yearLevel: '2nd Year' },
  { id: 'STU002', name: 'Emma Williams', email: 'emma.williams@university.edu', department: 'Computer Science', yearLevel: '2nd Year' },
  { id: 'STU003', name: 'Michael Brown', email: 'michael.brown@university.edu', department: 'Computer Science', yearLevel: '2nd Year' },
  { id: 'STU004', name: 'Sophia Davis', email: 'sophia.davis@university.edu', department: 'Computer Science', yearLevel: '2nd Year' },
  { id: 'STU005', name: 'James Miller', email: 'james.miller@university.edu', department: 'Computer Science', yearLevel: '2nd Year' },
];

export const mockInstructors = [
  { id: 'INS001', name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@university.edu', department: 'Computer Science', subjects: 2 },
  { id: 'INS002', name: 'Prof. James Wilson', email: 'james.wilson@university.edu', department: 'Computer Science', subjects: 3 },
  { id: 'INS003', name: 'Dr. Emily Brown', email: 'emily.brown@university.edu', department: 'Mathematics', subjects: 2 },
  { id: 'INS004', name: 'Prof. Michael Lee', email: 'michael.lee@university.edu', department: 'English', subjects: 1 },
];

export const mockDepartments = [
  { id: '1', name: 'Computer Science', code: 'CS', head: 'Dr. Sarah Mitchell', students: 450, instructors: 12 },
  { id: '2', name: 'Mathematics', code: 'MATH', head: 'Dr. Emily Brown', students: 320, instructors: 8 },
  { id: '3', name: 'English', code: 'ENG', head: 'Prof. Michael Lee', students: 280, instructors: 6 },
  { id: '4', name: 'Physics', code: 'PHYS', head: 'Dr. Robert Chen', students: 200, instructors: 5 },
];

export const mockPendingUsers = [
  { id: 'REQ001', name: 'Alice Johnson', email: 'alice.j@email.com', role: 'student', requestDate: '2024-01-20', status: 'pending' },
  { id: 'REQ002', name: 'Bob Smith', email: 'bob.s@email.com', role: 'instructor', requestDate: '2024-01-19', status: 'pending' },
  { id: 'REQ003', name: 'Carol White', email: 'carol.w@email.com', role: 'student', requestDate: '2024-01-18', status: 'pending' },
];

export const mockSchedule = [
  { day: 'Monday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201' },
    { time: '11:00 AM - 12:00 PM', subject: 'MATH201', room: 'Room 102' },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101' },
  ]},
  { day: 'Tuesday', classes: [
    { time: '9:00 AM - 10:30 AM', subject: 'ENG101', room: 'Room 408' },
    { time: '1:00 PM - 2:30 PM', subject: 'CS102', room: 'Room 305' },
  ]},
  { day: 'Wednesday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201' },
    { time: '11:00 AM - 12:00 PM', subject: 'MATH201', room: 'Room 102' },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101' },
  ]},
  { day: 'Thursday', classes: [
    { time: '9:00 AM - 10:30 AM', subject: 'ENG101', room: 'Room 408' },
    { time: '1:00 PM - 2:30 PM', subject: 'CS102', room: 'Room 305' },
  ]},
  { day: 'Friday', classes: [
    { time: '9:00 AM - 10:00 AM', subject: 'CS101', room: 'Room 201' },
    { time: '11:00 AM - 12:00 PM', subject: 'MATH201', room: 'Room 102' },
    { time: '2:00 PM - 3:00 PM', subject: 'PHYS101', room: 'Lab 101' },
  ]},
];
