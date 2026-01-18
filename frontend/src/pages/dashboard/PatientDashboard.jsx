import React, { useState, useEffect } from "react";
import {
  Calendar,
  UserPlus,
  Search,
  Stethoscope,
  User,
  CreditCard,
  FileText,
  ChevronRight,
  Clock,
  Activity,
} from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PatientDashboard = ({ user, activeTab, onNavigate, onUpdateUser }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || "",
  });

  useEffect(() => {
    // Fetch Data based on active tab
    if (activeTab === "Overview" || activeTab === "Appointments") {
      api.getAppointments(user.id, "patient").then((data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(String(a.date_time).replace(" ", "T"));
          const dateB = new Date(String(b.date_time).replace(" ", "T"));
          return dateB - dateA;
        });
        setAppointments(sortedData);
      });
    }

    // Always fetch doctors for Overview (Key Doctors section) and Find Doctor tab
    if (activeTab === "Overview" || activeTab === "Find Doctor") {
      api.getUsersByRole("doctor").then(setDoctors);
    }
  }, [activeTab, user.id]);

  const handleSelectDoctor = async (docId) => {
    const docSlots = await api.getSlots(docId);
    setSlots(docSlots);
    setSelectedDoc(docId);
  };

  const handleBook = async (slot) => {
    const doc = doctors.find((d) => d.id === selectedDoc);

    // Safe parsing helper
    const safeDate = new Date(String(slot.date_time).replace(" ", "T"));

    if (
      confirm(`Book with Dr. ${doc.last_name} at ${safeDate.toLocaleString()}?`)
    ) {
      await api.createAppointment({
        patientId: user.id,
        doctorId: selectedDoc,
        patientName: `${user.first_name} ${user.last_name}`,
        doctorName: `${doc.first_name} ${doc.last_name}`,
        date: slot.date_time,
      });

      await api.deleteSlot(slot.id);

      try {
        await fetch("http://localhost:5000/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: user.phone,
            message: `Hello ${
              user.first_name
            }, your appointment request with Dr. ${
              doc.last_name
            } on ${safeDate.toLocaleString()} has been submitted. Please wait for the doctor's confirmation.`,
          }),
        });
      } catch (err) {
        console.error("Failed to send SMS:", err);
      }

      alert("Appointment Booked!");
      setSlots(slots.filter((s) => s.id !== slot.id));
      if (onNavigate) onNavigate("Appointments");
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

  // --- NEW: Render Overview Section Matching the Image ---
  const renderOverview = () => {
    // Get top 2 upcoming appointments
    const upcoming = appointments
      .filter((a) => {
        const aptDate = new Date(String(a.date_time).replace(" ", "T"));
        const now = new Date();
        console.log(
          `Checking Apt ID: ${a.id} | Date: ${
            a.date_time
          } | Parsed: ${aptDate} | Now: ${now} | Future? ${aptDate > now}`
        );
        return (
          aptDate > now && a.status !== "Declined" && a.status !== "Cancelled"
        );
      })
      .sort((a, b) => {
        const dateA = new Date(String(a.date_time).replace(" ", "T"));
        const dateB = new Date(String(b.date_time).replace(" ", "T"));
        return dateA - dateB; // Ascending: Soonest first
      })
      .slice(0, 2);

    // Get top 3 doctors
    const keyDoctors = doctors.slice(0, 3);

    return (
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {user.first_name}
          </h1>
          <p className="text-slate-500 mt-1">
            Your personalized health overview.
          </p>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Upcoming Appointments
          </h2>
          <div className="space-y-4">
            {upcoming.length > 0 ? (
              upcoming.map((apt) => {
                const aptDate = new Date(
                  String(apt.date_time).replace(" ", "T")
                );
                return (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        Specialist Consultation
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Dr. {apt.doctor_name} • {aptDate.toLocaleString()}
                      </p>

                      {apt.status === "Confirmed" ? (
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                          <CreditCard size={16} /> Pay Now
                        </button>
                      ) : (
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                          <FileText size={16} /> View Details
                        </button>
                      )}
                    </div>
                    {/* Visual Placeholder for Doctor Image */}
                    <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="text-blue-300" size={48} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
                <p className="text-slate-500">No upcoming appointments.</p>
                <button
                  onClick={() => onNavigate("Find Doctor")}
                  className="mt-2 text-blue-600 font-medium hover:underline"
                >
                  Book one now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate("Find Doctor")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Book New Appointment
            </button>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all active:scale-95">
              Pay Bill
            </button>
          </div>
        </div>

        {/* Key Doctors */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-800">Key Doctors</h2>
            <button
              onClick={() => onNavigate("Find Doctor")}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All Doctors
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {keyDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => onNavigate("Find Doctor")}
              >
                <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                  {/* Avatar Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-300">
                    <User size={64} />
                  </div>
                </div>
                <h3 className="font-bold text-slate-800">
                  Dr. {doc.first_name} {doc.last_name}
                </h3>
                <p className="text-sm text-slate-500">{doc.specialty}</p>
              </div>
            ))}
            {keyDoctors.length === 0 && (
              <p className="text-slate-400 col-span-3 text-center py-8">
                No doctors available.
              </p>
            )}
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
      {/* Show Standard Header ONLY if NOT in Overview (Overview has its own header) */}
      {activeTab !== "Overview" && (
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
            <p className="text-slate-500">Welcome, {user.first_name}</p>
          </div>
          {activeTab !== "Find Doctor" && (
            <Button onClick={() => onNavigate("Find Doctor")}>
              <UserPlus size={18} /> New Appointment
            </Button>
          )}
        </div>
      )}

      {activeTab === "Overview" && renderOverview()}

      {activeTab === "Appointments" && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4">My Appointments</h3>
          <div className="space-y-2">
            {appointments.map((apt) => {
              const aptDate = new Date(String(apt.date_time).replace(" ", "T"));

              return (
                <div
                  key={apt.id}
                  className="p-4 border rounded flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Dr. {apt.doctor_name}</p>
                      <p className="text-sm text-slate-500">
                        {aptDate.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      apt.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              );
            })}
            {appointments.length === 0 && (
              <p className="text-slate-400">No upcoming appointments.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "Find Doctor" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4">Select Doctor</h3>
            <div className="space-y-2">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDoctor(d.id)}
                  className={`p-4 border rounded cursor-pointer flex justify-between items-center ${
                    selectedDoc === d.id
                      ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <p className="font-bold">
                        Dr. {d.first_name} {d.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{d.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4">Available Slots</h3>
            {!selectedDoc ? (
              <p className="text-slate-400 text-center py-10">
                Select a doctor to view slots.
              </p>
            ) : slots.length === 0 ? (
              <p className="text-slate-400 text-center py-10">
                No available slots.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {slots.map((s) => {
                  const slotDate = new Date(
                    String(s.date_time).replace(" ", "T")
                  );
                  return (
                    <Button
                      key={s.id}
                      variant="outline"
                      onClick={() => handleBook(s)}
                      className="text-xs"
                    >
                      {slotDate.toLocaleDateString()} <br />{" "}
                      {slotDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "Profile" && renderProfile()}
    </div>
  );
};
export default PatientDashboard;
