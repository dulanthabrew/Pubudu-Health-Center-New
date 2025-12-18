import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import Logo from "./Logo";

const Navbar = ({ user, activeTab, onNavigate, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const items = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: Calendar, label: "Appointments" },
    { icon: Stethoscope, label: "Find Doctor" },
    { icon: FileText, label: "Records" },
  ];

  const handleNavigation = (label) => {
    if (onNavigate) onNavigate(label);
    setIsMobileOpen(false);
  };

  const firstName = user.first_name || user.firstName || "User";
  const lastName = user.last_name || user.lastName || "";

  return (
    <>
      {/* Spacer to prevent content jump since fixed navbar */}
      <div className="h-20" />

      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-2"
            : "bg-white border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="scale-90 origin-left">
                <Logo />
              </div>
            </div>

            {/* RIGHT: Navigation & Profile */}
            <div className="hidden md:flex items-center gap-8">
              {/* Nav Links */}
              <nav className="flex items-center gap-2">
                {items.map((item, i) => {
                  const isActive = activeTab === item.label;
                  return (
                    <button
                      key={i}
                      onClick={() => handleNavigation(item.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 transform scale-105"
                          : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`transition-transform duration-200 ${
                          isActive ? "" : "group-hover:scale-110"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200"></div>

              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNavigation("Profile")}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                    {firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="pr-3 text-left">
                    <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-700 transition-colors">
                      {firstName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:shadow-sm"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-5">
            <div className="p-4 space-y-2">
              {items.map((item, i) => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={i}
                    onClick={() => handleNavigation(item.label)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                );
              })}
              <div className="h-px bg-slate-100 my-4" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
