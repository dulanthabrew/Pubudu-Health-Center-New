import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Calendar,
  ClipboardList,
  User,
  Search,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ReceptionistDashboard = ({
  user,
  activeTab,
  onNavigate,
  onUpdateUser,
}) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Mock Data for Billing (Since backend billing isn't set up yet)
  const [unpaidPatients, setUnpaidPatients] = useState([
    {
      id: 101,
      name: "Kamal Perera",
      displayId: "PHE-2037",
      date: "2024-07-20",
      amount: "Lkr.1500",
    },
    {
      id: 102,
      name: "Wanisha Ekanayake",
      displayId: "PHE-9148",
      date: "2024-07-15",
      amount: "Lkr.2390",
    },
    {
      id: 103,
      name: "Jude Bevan",
      displayId: "PHE-6720",
      date: "2024-07-10",
      amount: "Lkr.1200",
    },
  ]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "123",
  });

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || "",
  });

  useEffect(() => {
    if (activeTab === "Queue" || activeTab === "Front Desk") {
      api.getUsersByRole("patient").then(setPatients);
    }

    // Fetch all appointments for the Front Desk dashboard
    if (activeTab === "Front Desk" || activeTab === "Bookings") {
      // Passing 'receptionist' (or any non-doc/patient role) to getAppointments returns ALL appointments based on current server logic
      api.getAppointments(user.id, "receptionist").then((data) => {
        // Sort by date descending
        const sorted = data.sort((a, b) => {
          const dateA = new Date(String(a.date_time).replace(" ", "T"));
          const dateB = new Date(String(b.date_time).replace(" ", "T"));
          return dateB - dateA;
        });
        setAppointments(sorted);
      });
    }
  }, [activeTab]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.register({ ...form, role: "patient" });
      alert("Patient Registered!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "123",
      });
    } catch (err) {
      alert("Error registering");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });

      // Update global user state
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

  const handleMarkPaid = (id) => {
    // Determine if we should really delete or just animate out. For now, simple state removal.
    if (confirm("Mark this invoice as PAID?")) {
      setUnpaidPatients(unpaidPatients.filter((p) => p.id !== id));
    }
  };

  const handleCancelAppointment = async (id) => {
    if (confirm("Are you sure you want to CANCEL this appointment?")) {
      await api.updateAppointmentStatus(id, "Cancelled");
      // Refresh list locally
      setAppointments(
        appointments.map((apt) =>
          apt.id === id ? { ...apt, status: "Cancelled" } : apt
        )
      );
    }
  };

  // --- Render Functions ---

  const renderFrontDesk = () => {
    const upcoming = appointments.filter(
      (a) =>
        new Date(String(a.date_time).replace(" ", "T")) > new Date() &&
        a.status !== "Cancelled"
    );

    return (
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Receptionist Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage patient admissions, bookings, and billing efficiently.
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate("Registration")}
              className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg font-medium shadow-md transition-colors"
            >
              Admit New Patient
            </button>
            <button
              onClick={() => onNavigate("Bookings")}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Make New Booking
            </button>
          </div>
        </div>

        {/* Unpaid Patients Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              Unpaid Patients
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Date of Service</th>
                  <th className="px-6 py-4">Amount Due</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        ({p.displayId})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{p.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {p.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="text-slate-500 hover:text-blue-600 font-medium text-xs transition-colors"
                      >
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
                {unpaidPatients.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No unpaid invoices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              Upcoming Appointments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcoming.slice(0, 5).map((apt) => {
                  const aptDate = new Date(
                    String(apt.date_time).replace(" ", "T")
                  );
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {apt.patient_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          (ID: {apt.patient_id})
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {aptDate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        Dr. {apt.doctor_name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-slate-400 hover:text-red-600 font-medium text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {upcoming.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No upcoming appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
              <button
                onClick={() => onNavigate("Bookings")}
                className="text-xs font-medium text-slate-500 hover:text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      {activeTab === "Front Desk" && renderFrontDesk()}

      {activeTab === "Queue" && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Patient Queue</h1>
          {patients.map((p) => (
            <div key={p.id} className="p-3 border-b flex justify-between">
              <span>
                {p.first_name} {p.last_name}
              </span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Waiting
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Registration" && (
        <div className="bg-white p-8 rounded-xl border shadow-sm max-w-lg mx-auto">
          <h3 className="font-bold mb-4 text-xl">Patient Registration</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
              />
              <Input
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Button type="submit" className="w-full bg-emerald-600">
              Register Patient
            </Button>
          </form>
        </div>
      )}

      {activeTab === "Bookings" && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
          {/* Reuse the table logic or create a similar view for full bookings */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => {
                  const aptDate = new Date(
                    String(apt.date_time).replace(" ", "T")
                  );
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">
                        {aptDate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {apt.patient_name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        Dr. {apt.doctor_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            apt.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : apt.status === "Declined" ||
                                apt.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Profile" && renderProfile()}
    </div>
  );
};
export default ReceptionistDashboard;
