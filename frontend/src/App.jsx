import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import TeacherLandingPage from "./pages/teachers-landing/TeacherLandingPage";
import StudentLandingPage from "./pages/students-landing/StudentLandingPage";
import StudentPollPage from "./pages/students-poll/StudentPollPage";
import TeacherPollPage from "./pages/teachers-poll/TeacherPollPage";
import PollHistoryPage from "./pages/poll-historyy/Poll-history";
import TeacherProtectedRoute from "./components/route-project/TeacherProtect";
import StudentProtectedRoute from "./components/route-project/StudentProtect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/teacher-home-page"
          element={
            <TeacherProtectedRoute>
              <TeacherLandingPage />
            </TeacherProtectedRoute>
          }
        />

        <Route path="/student-home-page" element={<StudentLandingPage />} />

        <Route
          path="/poll-question"
          element={
            <StudentProtectedRoute>
              <StudentPollPage />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/teacher-poll"
          element={
            <TeacherProtectedRoute>
              <TeacherPollPage />
            </TeacherProtectedRoute>
          }
        />

        <Route
          path="/teacher-poll-history"
          element={
            <TeacherProtectedRoute>
              <PollHistoryPage />
            </TeacherProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
