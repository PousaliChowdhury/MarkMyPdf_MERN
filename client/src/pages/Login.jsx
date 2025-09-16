import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import "../styles/index.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/library");
    } catch (err) {
      alert("Login failed. Please check your credentials or sign up first.");
    }
  }

return (
    <div className="fullscreen-bg bg-login">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Welcome Back 👋</h2>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="form-footer">
          Don’t have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
