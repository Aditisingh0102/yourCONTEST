import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';

import StudentDashboard from './pages/student/Dashboard';
import StudentContests from './pages/student/Contests';
import ContestRules from './pages/student/ContestRules';
import Arena from './pages/student/Arena';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import Profile from './pages/student/Profile';
import Reports from './pages/student/Reports';
import NoticeBoard from './pages/student/NoticeBoard';

import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyNoticeBoard from './pages/faculty/NoticeBoard';
import FacultyCourseHub from './pages/faculty/CourseHub';
import FacultyContestManager from './pages/faculty/ContestManager';
import ContestQuestions from './pages/faculty/ContestQuestions';
import ContestForm from './pages/faculty/ContestForm';
import FacultyBatches from './pages/faculty/Batches';
import StudentRecords from './pages/faculty/StudentRecords';
import FacultyProfile from './pages/faculty/Profile';
import QuestionBank from './pages/faculty/QuestionBank';

// Placeholders for other routes
const Placeholder = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
    <p className="text-gray-500">This feature is under development.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="notice" element={<NoticeBoard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="contests" element={<StudentContests />} />
          <Route path="leaderboard" element={<Placeholder title="Leaderboard" />} />
          <Route path="submissions" element={<Placeholder title="My Submissions" />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/student/contests/:id" element={<ContestRules />} />
        <Route path="/student/arena/:id" element={<Arena />} />

        {/* Faculty Routes */}
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="notice" element={<FacultyNoticeBoard />} />
          <Route path="course-hub" element={<FacultyCourseHub />} />
          <Route path="manage-contests" element={<FacultyContestManager />} />
          <Route path="create-contest" element={<ContestForm />} />
          <Route path="edit-contest/:id" element={<ContestForm />} />
          <Route path="manage-contests/:id/questions" element={<ContestQuestions />} />
          <Route path="batches" element={<FacultyBatches />} />
          <Route path="students" element={<StudentRecords />} />
          <Route path="student-records" element={<StudentRecords />} />
          <Route path="results" element={<Placeholder title="Results & Analytics" />} />
          <Route path="question-bank" element={<QuestionBank />} />
          <Route path="profile" element={<FacultyProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
