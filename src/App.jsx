import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
// Signup is disabled — admin accounts are provisioned manually, not self-registered.
// import SignupPage from "./pages/SignupPage.jsx";
import QuotesPage from "./pages/QuotesPage.jsx";
import JobApplicationsPage from "./pages/JobApplicationsPage.jsx";
import ContactsPage from "./pages/ContactsPage.jsx";
import ProposalsPage from "./pages/ProposalsPage.jsx";
import ConsultationsPage from "./pages/ConsultationsPage.jsx";
import PageEditorPage from "./pages/PageEditorPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignupPage />} /> */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="job-applications" element={<JobApplicationsPage />} />
          <Route path="pages/:slug" element={<PageEditorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
