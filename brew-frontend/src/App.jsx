import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard';
import BrewerDashboard from './pages/BrewerDashboard'
import Registration from './pages/Registration'
import NoPage from './pages/NoPage';
import React from 'react';
import './App.css'
import './index.css'

function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/" element={<Registration />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/brewer/dashboard" element={<BrewerDashboard />} />
          <Route path="*" element={<NoPage/>} />
        </Routes>
      </Router>
    </div>

  );
}

export default App