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
      alert("Успешна регистрација!");
      navigate(`/login`);
    } catch (err) {
      alert("Неуспешна регистрација. Обиди се повторно.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Креирај Koрисничка Сметка ✨</h2>
        <p className="register-subtitle">Започни со твојата фокус патека</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Корисничко име"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Лозинка"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">Регистрација</button>
        </form>

        <p className="register-login-link">
          Веќе имаш корисничка сметка?{" "}
          <span onClick={() => navigate('/login')} className="link">Најава</span>
        </p>
      </div>
    </div>
  );
}
