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
      const token = response.data;
      console.log("Received JWT token:", token);

      localStorage.setItem('jwt', token);
      alert("Logged in successfully");
      navigate(`/`);

      setForm({ username: '', password: '' });
    } catch (err) {
      alert("Login failed");
      console.error("Login error:", err);
    }
  };

  return (
    <div className={'container px-6'}>
     <h2 className={'my-3'}>Login</h2>
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