// AuthPage.jsx
import { useState } from "react";
import api from "../api";
import "./AuthPage.css";

function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    const url = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email: form.email, password: form.password } : form;

    try {
      const res = await api.post(url, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data._id);
      onAuthSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL: Features */}
      <div className="auth-features">
        <h1>Welcome to Co-Learn AI</h1>
        <p>
          Collaborate in study groups, chat in real-time, upload PDFs, and get AI-powered summaries of your discussions and files. Stay productive and organized.
        </p>
        <ul className="feature-list">
          <li>💬 Real-time group chat</li>
          <li>📄 Share PDFs and documents</li>
          <li>🤖 AI-generated summaries</li>
          <li>👥 Manage group members</li>
        </ul>
      </div>

      {/* RIGHT PANEL: Auth Form */}
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {error && <p className="auth-error">{error}</p>}
        {!isLogin && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={submit} disabled={loading}>
          {loading ? (isLogin ? "Logging in…" : "Registering…") : isLogin ? "Login" : "Register"}
        </button>
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Already have an account?"}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
