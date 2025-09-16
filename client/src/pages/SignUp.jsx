import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import "../styles/index.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", { email, password });
      login(res.data.token, res.data.user);
      navigate("/library");
    } catch (err) {
      alert("Signup failed. Please try again with a new email.");
    }
  }

  return (
    <div className="fullscreen-bg bg-signup">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Create an Account ✨</h2>
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
        <button type="submit">Sign Up</button>
        <p className="form-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
