import { useState } from 'react';
import instance from '../../custom-axios/axios';
import {useNavigate} from "react-router-dom";
import './login.css'

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

      // Store data in localStorage
      localStorage.setItem('jwt', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      console.log("Logged in successfully:", { username, userId });

      setForm({ username: '', password: '' });
      navigate(`/`);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container px-6">
      <h2 className="my-3">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}