import './App.css';
import React, {Component} from "react";
import {BrowserRouter as Router, Redirect, Route, Routes} from "react-router-dom";
import Login from './components/Login-Register/login.js'
import Register from './components/Login-Register/register.js';
import HomePage from './pages/homepage.js';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: !!localStorage.getItem("jwt"),
    };
  }

  onLogin = () => {
    this.setState({ isLoggedIn: true }, this.loadTrips);
  };

  render() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={this.onLogin} />} />
          <Route path="/filedashboard" element={<FileDashboard />} />
        </Routes>
      </Router>
    );
  }
}

export default App;