import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout.jsx";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRedirect
} from "./components/Routes.jsx";
import {
  LandingPage,
  LoginPage,
  RecruiterRegisterPage,
  StudentRegisterPage
} from "./pages/AuthPages.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import {
  AvailableJobsPage,
  MyApplicationsPage,
  StudentDashboard,
  StudentJobDetailsPage,
  StudentProfilePage,
  StudentSlotBookingPage
} from "./pages/StudentPages.jsx";
import {
  ApplicationStatusPage,
  ApplicationsForJobPage,
  InterviewSlotsPage,
  JobFormPage,
  RecruiterDashboard,
  RecruiterJobDetailsPage,
  RecruiterJobsPage
} from "./pages/RecruiterPages.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/recruiter" element={<RecruiterRegisterPage />} />
      </Route>

      <Route path="/dashboard" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/jobs" element={<AvailableJobsPage />} />
          <Route path="/student/jobs/:id" element={<StudentJobDetailsPage />} />
          <Route path="/student/applications" element={<MyApplicationsPage />} />
          <Route
            path="/student/applications/:applicationId/slots"
            element={<StudentSlotBookingPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["RECRUITER"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
          <Route path="/recruiter/jobs/new" element={<JobFormPage />} />
          <Route path="/recruiter/jobs/:id" element={<RecruiterJobDetailsPage />} />
          <Route path="/recruiter/jobs/:id/edit" element={<JobFormPage />} />
          <Route
            path="/recruiter/jobs/:id/applications"
            element={<ApplicationsForJobPage />}
          />
          <Route path="/recruiter/jobs/:id/slots" element={<InterviewSlotsPage />} />
          <Route
            path="/recruiter/applications/:applicationId/status"
            element={<ApplicationStatusPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
