import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import React from 'react';

function App() {
  return (

    <UserDashboard/>

    // <Router>
    //   <Routes>
    //     <Route path="/" element={<Home />} />
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/user/dashboard" element={<UserDashboard />} />
    //     <Route path="/brewer/dashboard" element={<BrewerDashboard />} />
    //   </Routes>
    // </Router>
  );
}

export default App