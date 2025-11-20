import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/Layout/AdminLayout.jsx';
import ParentLayout from './components/Layout/ParentLayout.jsx';
import LoginPage from './pages/Auth/LoginPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import SchedulePage from './pages/Schedules/SchedulePage';
import AssignmentPage from './pages/Assignments/AssignmentPage';
import StudentsPage from './pages/Students/StudentsPage';
import DriversPage from './pages/Drivers/DriversPage';
import BusesPage from './pages/Buses/BusesPage';
import RoutesPage from './pages/Routes/RoutesPage';
import LiveLocationPage from './pages/Live/LiveLocationPage';
// import DriverLoginPage from './pages/Auth/DriverLoginPage.jsx';
// import DriverLayout from './components/Layout/DriverLayout.jsx';
// import DriverDashboardPage from './pages/Drivers/DriverDashboardPage.jsx';
import ParentLogin from './pages/Auth/ParentLogin.jsx';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login/admin" replace />} />
        
        {/* Login Route - Public */}
        <Route path="/login/admin" element={<LoginPage />} />
        {/* <Route path="/login/driver" element={<DriverLoginPage />} /> */}
        <Route path="/login/parent" element={<ParentLogin />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="buses" element={<BusesPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="live" element={<LiveLocationPage />} />
          <Route path="schedules" element={<SchedulePage />} />
          <Route path="assignments" element={<AssignmentPage />} />
        </Route>

        {/* Driver Routes - Protected */}
        {/* <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DriverDashboardPage />} />
        </Route> */}

        {/* Parent Routes - Protected */}
        <Route path="/parent" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;

