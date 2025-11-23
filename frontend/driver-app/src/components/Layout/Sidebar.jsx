// frontend/driver-app/src/components/Layout/Sidebar.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bus, Users, Map, MapPin, Globe, Calendar } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", Icon: Home },
  { name: "Xe buýt của tôi", path: "/buses", Icon: Bus },
  { name: "Học sinh của tôi", path: "/students", Icon: Users },
  { name: "Tuyến đường", path: "/routes", Icon: Map },
  { name: "Điểm dừng", path: "/locations", Icon: MapPin },
  { name: "Vị trí xe", path: "/live", Icon: Globe },
  { name: "Lịch trình", path: "/schedules", Icon: Calendar },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      {/* Logo + Vai trò */}
      <div style={styles.logoContainer}>
        <h1 style={styles.logoText}>SmartSchoolBus</h1>
        <div style={styles.roleBadge}>DRIVER</div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map(({ name, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={name}
              to={path}
              style={{
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
              }}
            >
              <Icon size={18} style={{ marginRight: 12 }} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 220,
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "white",
    paddingTop: 18,
    boxShadow: "2px 0 8px rgba(2,6,23,0.5)",
    position: "sticky",
    top: 0,
    display: "flex",
    flexDirection: "column",
  },
  logoContainer: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: 18,
    margin: 0,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: 0.2,
  },
  roleBadge: {
    fontSize: 12,
    padding: "6px 8px",
    background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
    color: "white",
    borderRadius: 999,
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 12,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    padding: "10px 18px",
    textDecoration: "none",
    color: "#cbd5e1",
    fontSize: 15,
    transition: "background-color 0.15s ease, color 0.15s ease",
    margin: "6px 10px",
    borderRadius: 8,
  },
  activeNavLink: {
    backgroundColor: "rgba(99,102,241,0.12)",
    color: "#eef2ff",
    boxShadow: "inset 3px 0 0 0 #6366f1",
  },
};

export default Sidebar;
