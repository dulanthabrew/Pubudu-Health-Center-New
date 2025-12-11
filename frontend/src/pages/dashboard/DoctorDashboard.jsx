import React, { useState, useEffect } from "react";
import { Calendar, User, Clock, Plus, Trash2 } from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const DoctorDashboard = ({ user, activeTab, onUpdateUser }) => {
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
    if (activeTab === "Appointments" || activeTab === "My Dashboard") {
      const data = await api.getAppointments(user.id, "doctor");
      setAppointments(data);
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
    // 1. Find the specific appointment to get patient details
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    if (
      confirm(`Are you sure you want to mark this appointment as ${status}?`)
    ) {
      // 2. Update Status in DB
      await api.updateAppointmentStatus(id, status);

      // 3. Send SMS Notification (UPDATED MESSAGE LOGIC)
      if (appointment.patient_phone) {
        try {
          // Format the date nicely for the SMS
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: appointment.patient_phone,
              message: message,
            }),
          });
          console.log("SMS sent to:", appointment.patient_phone);
        } catch (err) {
          console.error("Failed to send SMS:", err);
          alert("Status updated, but failed to send SMS.");
        }
      } else {
        console.warn("No phone number found for patient.");
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

  const renderAppointments = () => (
    <div className="space-y-4">
      {appointments.map((apt) => {
        // Safe Date Parse
        const aptDate = new Date(String(apt.date_time).replace(" ", "T"));

        return (
          <div
            key={apt.id}
            className="p-4 border rounded bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{apt.patient_name}</p>
              <p className="text-sm text-slate-500">
                {aptDate.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  apt.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : apt.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
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
        <p className="text-slate-400">No appointments.</p>
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
      <h1 className="text-2xl font-bold mb-6">Doctor: {activeTab}</h1>
      {(activeTab === "My Dashboard" || activeTab === "Appointments") &&
        renderAppointments()}

      {activeTab === "Schedule" && (
        <div className="space-y-6">
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
                // Safe date parse
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
