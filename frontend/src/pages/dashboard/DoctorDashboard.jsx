import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  Plus,
  Trash2,
  Users,
  Activity,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const DoctorDashboard = ({ user, activeTab, onUpdateUser, onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || "",
  });

  const fetchData = async () => {
    // Always fetch appointments for Dashboard & Appointments tab
    if (
      activeTab === "Appointments" ||
      activeTab === "My Dashboard" ||
      activeTab === "Overview"
    ) {
      const data = await api.getAppointments(user.id, "doctor");
      // Sorts by date_time in descending order (latest dates first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(String(a.date_time).replace(" ", "T"));
        const dateB = new Date(String(b.date_time).replace(" ", "T"));
        return dateB - dateA;
      });
      setAppointments(sortedData);
    }
    if (activeTab === "Schedule") {
      const data = await api.getSlots(user.id);
      setSlots(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, user.id]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (newSlot.date && newSlot.time) {
      await api.addSlot(user.id, `${newSlot.date} ${newSlot.time}`);
      setNewSlot({ date: "", time: "" });
      fetchData();
    }
  };

  const handleStatus = async (id, status) => {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    if (
      confirm(`Are you sure you want to mark this appointment as ${status}?`)
    ) {
      await api.updateAppointmentStatus(id, status);

      if (appointment.patient_phone) {
        try {
          const dateStr = new Date(
            String(appointment.date_time).replace(" ", "T")
          ).toLocaleString();

          let message = "";
          if (status === "Confirmed") {
            message = `Good news! Your appointment with Dr. ${user.last_name} on ${dateStr} has been CONFIRMED.`;
          } else {
            message = `Notice: Your appointment with Dr. ${user.last_name} on ${dateStr} was DECLINED. Please reschedule.`;
          }

          await fetch("http://localhost:5000/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: appointment.patient_phone,
              message: message,
            }),
          });
        } catch (err) {
          console.error("Failed to send SMS:", err);
        }
      }
      fetchData();
    }
  };

  const handleDeleteSlot = async (id) => {
    await api.deleteSlot(id);
    fetchData();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });

      if (onUpdateUser) {
        onUpdateUser({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
        });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  // --- NEW: Render Overview Dashboard (Matches the Image) ---
  const renderOverview = () => {
    const today = new Date().toDateString();

    // Stats Calculation
    const todaysAppointments = appointments.filter((apt) => {
      const aptDate = new Date(String(apt.date_time).replace(" ", "T"));
      return aptDate.toDateString() === today;
    });

    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(String(apt.date_time).replace(" ", "T"));
      return aptDate > new Date();
    });

    const uniquePatients = [...new Set(appointments.map((a) => a.patient_id))]
      .length;

    return (
      <div className="space-y-8 pb-10">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0EA5E9] p-6 rounded-xl text-white shadow-lg shadow-blue-200">
            <p className="text-blue-100 font-medium mb-1">
              Today's Appointments
            </p>
            <h3 className="text-4xl font-bold">{todaysAppointments.length}</h3>
          </div>
          <div className="bg-[#0284C7] p-6 rounded-xl text-white shadow-lg shadow-blue-200">
            <p className="text-blue-100 font-medium mb-1">New Patients</p>
            <h3 className="text-4xl font-bold">{uniquePatients}</h3>
          </div>
          <div className="bg-[#0369A1] p-6 rounded-xl text-white shadow-lg shadow-blue-200">
            <p className="text-blue-100 font-medium mb-1">
              Upcoming Appointments
            </p>
            <h3 className="text-4xl font-bold">
              {upcomingAppointments.length}
            </h3>
          </div>
        </div>

        {/* Today's Appointments Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              Today's Appointments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((apt) => {
                    const aptDate = new Date(
                      String(apt.date_time).replace(" ", "T")
                    );
                    const timeString = aptDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {timeString}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {apt.patient_name}
                          </div>
                          <div className="text-xs text-slate-400">
                            ID: #{apt.patient_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          Consultation
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              apt.status === "Confirmed"
                                ? "bg-green-100 text-green-700"
                                : apt.status === "Declined"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (onNavigate) onNavigate("Appointments");
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                          >
                            View Details <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-slate-400"
                      colSpan="5"
                    >
                      No appointments scheduled for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Visit Trends Graph Mockup */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Patient Visit Trends
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">+15%</span>
                <span className="text-sm text-green-600 font-medium">
                  Last 30 Days
                </span>
              </div>
            </div>
            {/* SVG Graph Mockup */}
            <div className="h-48 w-full flex items-end justify-between gap-2">
              <svg
                viewBox="0 0 500 150"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Smooth Curve */}
                <path
                  d="M0,150 C50,100 100,50 150,80 C200,110 250,40 300,60 C350,80 400,20 450,90 L500,40 L500,150 L0,150 Z"
                  fill="url(#gradient)"
                  opacity="0.2"
                />
                <path
                  d="M0,150 C50,100 100,50 150,80 C200,110 250,40 300,60 C350,80 400,20 450,90 L500,40"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#475569" stopOpacity="1" />
                    <stop offset="100%" stopColor="#475569" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  if (onNavigate) onNavigate("Schedule");
                }}
                className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-blue-100"
              >
                <Clock className="mr-2" size={20} /> Update Availability
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointments = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">All Appointments</h2>
      {appointments.map((apt) => {
        const aptDate = new Date(String(apt.date_time).replace(" ", "T"));
        return (
          <div
            key={apt.id}
            className="p-4 border rounded bg-white flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="font-bold text-slate-800">{apt.patient_name}</p>
              <p className="text-sm text-slate-500">
                {aptDate.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apt.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : apt.status === "Confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {apt.status}
              </span>
              {apt.status === "Pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatus(apt.id, "Confirmed")}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleStatus(apt.id, "Declined")}
                    className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none"
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {appointments.length === 0 && (
        <p className="text-slate-400">No appointments found.</p>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <User className="text-blue-600" /> Manage Profile
      </h2>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">First Name</label>
            <Input
              value={profileData.firstName}
              onChange={(e) =>
                setProfileData({ ...profileData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Last Name</label>
            <Input
              value={profileData.lastName}
              onChange={(e) =>
                setProfileData({ ...profileData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm mb-1 block">Phone</label>
          <Input
            value={profileData.phone}
            onChange={(e) =>
              setProfileData({ ...profileData, phone: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-sm mb-1 block">Email</label>
          <Input
            value={user.email}
            disabled
            className="bg-slate-50 cursor-not-allowed"
          />
        </div>
        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </div>
  );

  return (
    <div className="p-8">
      {/* Conditionally render views */}
      {activeTab === "My Dashboard" && renderOverview()}
      {activeTab === "Appointments" && renderAppointments()}

      {activeTab === "Schedule" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Manage Schedule</h2>
          <div className="bg-white p-6 rounded border shadow-sm">
            <h3 className="font-bold mb-4">Add Availability</h3>
            <form onSubmit={handleAddSlot} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm">Date</label>
                <Input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm">Time</label>
                <Input
                  type="time"
                  value={newSlot.time}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, time: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit">
                <Plus size={16} /> Add
              </Button>
            </form>
          </div>
          <div className="bg-white p-6 rounded border shadow-sm">
            <h3 className="font-bold mb-4">Current Slots</h3>
            <div className="grid grid-cols-3 gap-4">
              {slots.map((s) => {
                const slotDate = new Date(
                  String(s.date_time).replace(" ", "T")
                );
                return (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 border rounded flex justify-between items-center"
                  >
                    <span>{slotDate.toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteSlot(s.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {activeTab === "Profile" && renderProfile()}
    </div>
  );
};
export default DoctorDashboard;
