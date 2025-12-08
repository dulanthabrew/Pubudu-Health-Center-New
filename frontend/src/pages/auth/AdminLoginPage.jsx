import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "../../api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const AdminLoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      if (user.role === "admin") {
        onLogin(user);
      } else {
        alert("Access Denied. Admins Only.");
      }
    } catch (err) {
      alert("Admin Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => onNavigate("login")}
            className="mt-4 text-sm text-slate-500 hover:text-slate-800"
          >
            Return to Main Site
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
