import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile'
import BreweryDashboard from './pages/BreweryDashboard'
import Registration from './pages/Registration'
import NoPage from './pages/NoPage';
import BreweryPage from './pages/BreweryPage';
import About from './pages/About';
import NewUserDash from './NewLayout/NewUserDash'


import { BreweryProvider } from './context/BreweryContext';
import { BeerProvider } from './context/BeerContext';

function App() {
  return (
    <BeerProvider>
      <BreweryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* temp mock up  */}
            {/* <Route path="/temp-dash" element={<NewUserDash />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/about" element={<About />} />
            <Route path="/user/dashboard/:userId" element={<NewUserDash />} />
            <Route path="/user/profile/:userId" element={<UserProfile />} />
            <Route path="/brewery/dashboard" element={<BreweryDashboard />} />
            <Route path="/brewery/:breweryId" element={<BreweryPage />} /> 
            <Route path="*" element={<NoPage />} />
          </Routes>
        </Router>
      </BreweryProvider>
    </BeerProvider>
  );
}

export default App