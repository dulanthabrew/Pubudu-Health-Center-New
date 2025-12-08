import React, { useState } from "react";
import { api } from "../../api";
import Logo from "../../components/layout/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const SignupPage = ({ onNavigate, onLogin }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await api.register({ ...form, role: "patient" });
      onLogin(user); // Auto login after signup
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <header className="text-center">
          <Logo />
        </header>
        <h1 className="text-2xl font-bold text-center">Patient Registration</h1>
        <div className="grid grid-cols-2 gap-4">
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
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Button type="submit" className="w-full">
          Register
        </Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};
export default SignupPage;
