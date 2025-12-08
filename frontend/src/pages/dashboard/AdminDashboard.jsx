import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Trash2, X } from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminDashboard = ({ user, activeTab }) => {
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
      await api.register({
        ...formData,
        role: modalRole,
      });
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

  const renderList = (list) => (
    <div className="space-y-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      {list.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded flex justify-between items-center"
        >
          <div>
            <p className="font-bold">
              {item.first_name} {item.last_name}
            </p>
            <p className="text-sm text-slate-500">
              {item.email} {item.specialty && `• ${item.specialty}`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:bg-red-50 p-2 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-slate-400">No records found.</p>}
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p>Patients</p>
        <p className="text-3xl font-bold text-blue-600">{stats.patients}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p>Doctors</p>
        <p className="text-3xl font-bold text-indigo-600">{stats.doctors}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p>Receptionists</p>
        <p className="text-3xl font-bold text-emerald-600">
          {stats.receptionists}
        </p>
      </div>
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
      {activeTab === "Profile" && (
        <div className="p-4 bg-white rounded border">
          Admin Profile Management (Coming Soon)
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="text-lg font-bold capitalize text-slate-800">
                Add New {modalRole}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    First Name
                  </label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Email Address
                </label>
                <Input
                  placeholder="doctor@hospital.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Password
                </label>
                <Input
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              {modalRole === "doctor" && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Specialty
                  </label>
                  <Input
                    placeholder="e.g. Cardiology"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
