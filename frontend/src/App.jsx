import React, { useState, useEffect } from "react";
import { api } from "./api";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import ReceptionistDashboard from "./pages/dashboard/ReceptionistDashboard";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("pubudu_user"))
  );
  const [view, setView] = useState("login");
  const [activeTab, setActiveTab] = useState(() => {
    if (user) {
      const savedTab = localStorage.getItem(`activeTab_${user.id}`);
      if (savedTab) return savedTab;
      
      // Default fallback if no saved tab
      if (user.role === "admin") return "Dashboard";
      if (user.role === "doctor") return "My Dashboard";
      if (user.role === "patient") return "Overview";
      return "Front Desk";
    }
    return "Dashboard";
  });

  // Save tab on change
  useEffect(() => {
    if (user && activeTab) {
      localStorage.setItem(`activeTab_${user.id}`, activeTab);
    }
  }, [activeTab, user]);

  const handleLogin = (userData) => {
    localStorage.setItem("pubudu_user", JSON.stringify(userData));
    setUser(userData);
    
    // Set default tab based on role
    if (userData.role === "admin") setActiveTab("Dashboard");
    else if (userData.role === "doctor") setActiveTab("My Dashboard");
    else if (userData.role === "patient") setActiveTab("Overview");
    else setActiveTab("Front Desk");
  };

  const handleLogout = () => {
    localStorage.removeItem(`activeTab_${user.id}`); // Clear saved tab state
    localStorage.removeItem("pubudu_user");
    setUser(null);
    setView("login");
  };

  // NEW: Function to update user state locally without relogin
  const handleUserUpdate = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem("pubudu_user", JSON.stringify(updatedUser));
  };

  if (user) {
    let Dashboard = PatientDashboard;
    if (user.role === "admin") Dashboard = AdminDashboard;
    if (user.role === "doctor") Dashboard = DoctorDashboard;
    if (user.role === "receptionist") Dashboard = ReceptionistDashboard;

    const isPatient = user.role === "patient";

    return (
      <div
        className={`min-h-screen bg-slate-50 ${
          isPatient ? "flex flex-col" : "flex"
        }`}
      >
        {isPatient ? (
          <Navbar
            user={user}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            onLogout={handleLogout}
          />
        ) : (
          <Sidebar
            user={user}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            onLogout={handleLogout}
          />
        )}
        <main className="flex-1 overflow-auto">
          <Dashboard
            user={user}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            onUpdateUser={handleUserUpdate} // Pass the update function to dashboard
          />
        </main>
      </div>
    );
  }

  if (view === "signup")
    return <SignupPage onNavigate={setView} onLogin={handleLogin} />;
  if (view === "admin-login")
    return <AdminLoginPage onNavigate={setView} onLogin={handleLogin} />;
  return <LoginPage onNavigate={setView} onLogin={handleLogin} />;
}
