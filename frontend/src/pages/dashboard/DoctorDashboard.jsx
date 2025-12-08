import React, { useState, useEffect } from "react";
import { Calendar, User, Clock, Plus, Trash2 } from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const DoctorDashboard = ({ user, activeTab }) => {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

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
    await api.updateAppointmentStatus(id, status);
    fetchData();
  };

  const handleDeleteSlot = async (id) => {
    await api.deleteSlot(id);
    fetchData();
  };

  const renderAppointments = () => (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="p-4 border rounded bg-white flex justify-between items-center"
        >
          <div>
            <p className="font-bold">{apt.patient_name}</p>
            <p className="text-sm text-slate-500">
              {new Date(apt.date_time).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span
              className={`px-2 py-1 rounded text-xs ${
                apt.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {apt.status}
            </span>
            {apt.status === "Pending" && (
              <Button
                onClick={() => handleStatus(apt.id, "Confirmed")}
                className="h-8 text-xs"
              >
                Accept
              </Button>
            )}
          </div>
        </div>
      ))}
      {appointments.length === 0 && (
        <p className="text-slate-400">No appointments.</p>
      )}
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
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 border rounded flex justify-between items-center"
                >
                  <span>{new Date(s.date_time).toLocaleString()}</span>
                  <button
                    onClick={() => handleDeleteSlot(s.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === "Profile" && (
        <div className="p-4 bg-white rounded border">
          Profile Management (Coming Soon)
        </div>
      )}
    </div>
  );
};
export default DoctorDashboard;
