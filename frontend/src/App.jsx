import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./components/Layout/AdminLayout";
import LoginPage from "./pages/Auth/LoginPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import AccountManagement from "./pages/Dashboard/AccountManagement";
import SchedulePage from "./pages/Schedules/SchedulePage";
import AssignmentPage from "./pages/Assignments/AssignmentPage";
import StudentsPage from "./pages/Students/StudentsPage";
import DriversPage from "./pages/Drivers/DriversPage";
import BusesPage from "./pages/Buses/BusesPage";
import RoutesPage from "./pages/Routes/RoutesPage";
import LiveLocationPage from "./pages/Live/LiveLocationPage";
import RouteEdit from "./pages/Routes/RouteEdit";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login/admin" replace />} />

        {/* Login Route - Public */}
        <Route path="/login/admin" element={<LoginPage />} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="buses" element={<BusesPage />} />
          <Route path="routes">
            <Route index element={<RoutesPage />} />
            <Route path="edit/:id" element={<RouteEdit />} />
          </Route>
          <Route path="live" element={<LiveLocationPage />} />
          <Route path="schedules" element={<SchedulePage />} />
          <Route path="assignments" element={<AssignmentPage />} />
          <Route path="accounts" element={<AccountManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
