import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import { api } from "../../api";
import Logo from "../../components/layout/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      if (["patient", "doctor", "receptionist"].includes(user.role)) {
        onLogin(user);
      } else {
        alert("Access Denied. Use Admin Portal.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <Logo />
        </header>
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            icon={User}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-center pt-4 space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onNavigate("signup")}
          >
            Register (Patients Only)
          </Button>
          <button
            onClick={() => onNavigate("admin-login")}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Admin Portal Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
