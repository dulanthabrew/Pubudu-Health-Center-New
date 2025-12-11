import React, { useState, useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  Trash2,
  X,
  User,
  Users,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminDashboard = ({ user, activeTab, onUpdateUser, onNavigate }) => {
  const [doctors, setDoctors] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    receptionists: 0,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialty: "",
  });

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || "",
  });

  const fetchData = async () => {
    const docs = await api.getUsersByRole("doctor");
    const recs = await api.getUsersByRole("receptionist");
    const pats = await api.getUsersByRole("patient");
    setDoctors(docs);
    setReceptionists(recs);
    setPatients(pats);
    setStats({
      patients: pats.length,
      doctors: docs.length,
      receptionists: recs.length,
    });
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenModal = (role) => {
    setModalRole(role);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      specialty: "",
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await api.register({ ...formData, role: modalRole });
      alert(`${modalRole} created successfully!`);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to create user. Email might be taken.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this user?")) {
      await api.deleteUser(id);
      fetchData();
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

  const renderList = (list) => (
    <div className="space-y-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      {list.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded flex justify-between items-center hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
              {item.first_name[0]}
            </div>
            <div>
              <p className="font-bold">
                {item.first_name} {item.last_name}
              </p>
              <p className="text-sm text-slate-500">
                {item.email} {item.specialty && `• ${item.specialty}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-slate-400">No records found.</p>}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user.first_name}!
        </h2>
        <p className="text-blue-100 opacity-90">
          Here is an overview of your hospital's current status and quick
          actions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                Total Patients
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.patients}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                Active Doctors
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.doctors}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Stethoscope size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                Reception Staff
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.receptionists}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleOpenModal("doctor")}
            className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 text-lg">Add Doctor</h4>
            <p className="text-sm text-slate-500 mt-1">
              Register a new specialist
            </p>
          </button>

          <button
            onClick={() => handleOpenModal("receptionist")}
            className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck size={24} />
            </div>
            <h4 className="font-semibold text-slate-800 text-lg">
              Add Receptionist
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Register front desk staff
            </p>
          </button>

          <button
            onClick={() => onNavigate("Patients")}
            className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  View Patients
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Manage patient records
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-slate-300 group-hover:text-indigo-500 transition-colors"
              />
            </div>
          </button>

          <button
            onClick={() => onNavigate("Doctors")}
            className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope size={24} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  View Doctors
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Manage medical staff
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-slate-300 group-hover:text-indigo-500 transition-colors"
              />
            </div>
          </button>
        </div>
      </div>
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
    <div className="p-8 relative">
      <h1 className="text-2xl font-bold mb-6">Admin: {activeTab}</h1>
      {activeTab === "Dashboard" && renderDashboard()}
      {activeTab === "Doctors" && (
        <>
          <div className="mb-4">
            <Button onClick={() => handleOpenModal("doctor")}>
              <UserPlus size={18} /> Add Doctor
            </Button>
          </div>
          {renderList(doctors)}
        </>
      )}
      {activeTab === "Receptionists" && (
        <>
          <div className="mb-4">
            <Button
              variant="emerald"
              onClick={() => handleOpenModal("receptionist")}
            >
              <UserCheck size={18} /> Add Receptionist
            </Button>
          </div>
          {renderList(receptionists)}
        </>
      )}
      {activeTab === "Patients" && renderList(patients)}
      {activeTab === "Profile" && renderProfile()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="text-lg font-bold capitalize text-slate-800">
                Add New {modalRole}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              {modalRole === "doctor" && (
                <Input
                  placeholder="Specialty"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  required
                />
              )}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
