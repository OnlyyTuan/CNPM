// frontend/driver-app/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import ProtectedRoute from './pages/Auth/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BusListPage from './pages/Buses/BusListPage';
import StudentListPage from './pages/Students/StudentListPage';
import RoutesPage from './pages/Routes/RoutesPage';
import RouteEdit from './pages/Routes/RouteEdit';
import LocationsPage from './pages/Locations/LocationsPage';
import LiveLocationPage from './pages/Live/LiveLocationPage';
import SchedulePage from './pages/Schedules/SchedulePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes - Chỉ dành cho driver đã đăng nhập */}
        <Route element={<ProtectedRoute allowedRoles={['driver', 'admin']} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/buses" element={<BusListPage />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/routes">
            <Route index element={<RoutesPage />} />
            <Route path="edit/:id" element={<RouteEdit />} />
          </Route>
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/live" element={<LiveLocationPage />} />
          <Route path="/schedules" element={<SchedulePage />} />
        </Route>

        {/* Redirect mọi route không hợp lệ về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
