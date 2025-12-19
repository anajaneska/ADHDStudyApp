import { useState } from 'react';
import instance from '../../custom-axios/axios';
import { useNavigate } from "react-router-dom";
import './login.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await instance.post('/auth/login', form);
      const { token, userId, username } = response.data;

      if (!token || !userId) {
        throw new Error("Invalid login response: missing token or userId");
      }

      localStorage.setItem('jwt', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      console.log("Logged in successfully:", { username, userId });

      setForm({ username: '', password: '' });
      navigate(`/focus`);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Добредојде Назад 👋</h2>
        <p className="login-subtitle">Фокус почнува со најава</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Корисничко име"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Лозинка"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">Најава</button>
        </form>
        <p className="register-login-link">
          Немаш Корисничка Сметка?{" "}<br/>
          <span onClick={() => navigate('/register')} className="link">Креирај Корисничка Сметка</span>
        </p>
      </div>
    </div>
  );
}
