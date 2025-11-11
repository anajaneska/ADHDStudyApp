import React, { useState } from 'react';
import instance from '../../custom-axios/axios';
import { useNavigate } from "react-router-dom";
import './register.css'; // separate CSS file

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.post('/auth/register', form);
      alert("Registered successfully!");
      navigate(`/login`);
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Your Account ✨</h2>
        <p className="register-subtitle">Let’s get started on your focus journey</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">Register</button>
        </form>

        <p className="register-login-link">
          Already have an account?{" "}
          <span onClick={() => navigate('/login')} className="link">Login</span>
        </p>
      </div>
    </div>
  );
}
