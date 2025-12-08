import React, { useState, useEffect } from "react";
import { UserPlus, Calendar, ClipboardList, User } from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ReceptionistDashboard = ({ user, activeTab }) => {
  const [patients, setPatients] = useState([]);
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
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
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
      <h1 className="text-2xl font-bold mb-6">Reception: {activeTab}</h1>

      {(activeTab === "Front Desk" || activeTab === "Queue") && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">Patient Queue</h3>
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
        <div className="bg-white p-8 rounded-xl border shadow-sm max-w-lg">
          <h3 className="font-bold mb-4">Quick Register</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
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

      {activeTab === "Profile" && renderProfile()}
    </div>
  );
};
export default ReceptionistDashboard;
