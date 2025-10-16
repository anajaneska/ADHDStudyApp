import React, { useState } from 'react';
import instance from '../../custom-axios/axios';
import {useNavigate} from "react-router-dom";
import './login.css'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.post('/auth/register', form);
      alert("Registered successfully");
      navigate(`/login`);
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className={'container px-6'}>
      <h2 className={'my-3'}>Register</h2>
    <form onSubmit={handleSubmit}>

      <input type="text" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
    </div>
  );
}