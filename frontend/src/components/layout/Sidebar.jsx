import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  Stethoscope,
  FileText,
  LogOut,
  UserCheck,
  ClipboardList,
  User,
  Clock,
  Menu,
  X,
} from "lucide-react";
import Logo from "./Logo";

const Sidebar = ({ user, activeTab, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  let items = [];

  if (user.role === "admin") {
    items = [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Doctors" },
      { icon: UserCheck, label: "Receptionists" },
      { icon: Users, label: "Patients" },
      { icon: Activity, label: "Reports" },
      { icon: User, label: "Profile" },
    ];
  } else if (user.role === "doctor") {
    items = [
      { icon: LayoutDashboard, label: "My Dashboard" },
      { icon: Calendar, label: "Appointments" },
      { icon: Clock, label: "Schedule" },
      { icon: Users, label: "My Patients" },
      { icon: FileText, label: "Records" },
      { icon: User, label: "Profile" },
    ];
  } else if (user.role === "receptionist") {
    items = [
      { icon: LayoutDashboard, label: "Front Desk" },
      { icon: ClipboardList, label: "Queue" },
      { icon: UserCheck, label: "Registration" },
      { icon: Calendar, label: "Bookings" },
      { icon: User, label: "Profile" },
    ];
  } else {
    items = [
      { icon: LayoutDashboard, label: "Overview" },
      { icon: Calendar, label: "Appointments" },
      { icon: Stethoscope, label: "Find Doctor" },
      { icon: FileText, label: "Records" },
      { icon: User, label: "Profile" },
    ];
  }

  // Handle data inconsistency (SQL snake_case vs API camelCase)
  const firstName = user.first_name || user.firstName || "User";
  const lastName = user.last_name || user.lastName || "";

  // Helper to handle navigation and close sidebar on mobile
  const handleNavigation = (label) => {
    if (onNavigate) onNavigate(label);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-74 bg-white border-r border-slate-200 h-screen flex flex-col transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:h-screen md:shadow-none
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        <div className="p-6">
          <Logo />
        </div>
        <div className="px-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {firstName?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {items.map((item, i) => {
            const isActive =
              activeTab === item.label ||
              (activeTab === "Dashboard" &&
                (item.label === "Overview" ||
                  item.label === "My Dashboard" ||
                  item.label === "Front Desk"));

            return (
              <button
                key={i}
                onClick={() => handleNavigation(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
