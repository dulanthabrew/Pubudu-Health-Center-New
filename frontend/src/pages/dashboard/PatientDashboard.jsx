import React, { useState, useEffect } from "react";
import { Calendar, UserPlus, Search, Stethoscope } from "lucide-react";
import { api } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PatientDashboard = ({ user, activeTab, onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (activeTab === "Overview" || activeTab === "Appointments") {
      api.getAppointments(user.id, "patient").then(setAppointments);
    }
    if (activeTab === "Find Doctor") {
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
    if (
      confirm(
        `Book with Dr. ${doc.last_name} at ${new Date(
          slot.date_time
        ).toLocaleString()}?`
      )
    ) {
      await api.createAppointment({
        patientId: user.id,
        doctorId: selectedDoc,
        patientName: `${user.first_name} ${user.last_name}`,
        doctorName: `${doc.first_name} ${doc.last_name}`,
        date: slot.date_time,
      });
      await api.deleteSlot(slot.id); // Consumes the slot
      alert("Appointment Booked!");
      setSlots(slots.filter((s) => s.id !== slot.id));
      if (onNavigate) onNavigate("Appointments");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-slate-500">Welcome, {user.first_name}</p>
        </div>
        <Button onClick={() => onNavigate("Find Doctor")}>
          <UserPlus size={18} /> New Appointment
        </Button>
      </div>

      {(activeTab === "Overview" || activeTab === "Appointments") && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4">My Appointments</h3>
          <div className="space-y-2">
            {appointments.map((apt) => (
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
                      {new Date(apt.date_time).toLocaleString()}
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
            ))}
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
                {slots.map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    onClick={() => handleBook(s)}
                    className="text-xs"
                  >
                    {new Date(s.date_time).toLocaleDateString()} <br />{" "}
                    {new Date(s.date_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </div>
            )}
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
export default PatientDashboard;
