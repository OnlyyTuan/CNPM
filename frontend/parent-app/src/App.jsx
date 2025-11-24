import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import ParentDashboard from "./pages/Dashboard/ParentDashboard";
import ChildrenPage from "./pages/Children/ChildrenPage";
import LiveMap from "./pages/Live/LiveMap";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/" element={<ParentDashboard />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route path="/live" element={<LiveMap />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
