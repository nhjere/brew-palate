import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'
import UserProfile from './pages/UserProfile'
import FindBreweries from './pages/FindBreweries'
import Registration from './pages/Registration'
import NoPage from './pages/NoPage';
import BreweryPage from './pages/BreweryPage';
import About from './pages/About';
import UserDashboard from './pages/UserDashboard'
import BrewerDashboard from './pages/BrewerPages/BrewerDashboard';
import Analytics from './pages/BrewerPages/AnalyticsDash';
import BrewerProfile from './pages/BrewerPages/BrewerProfile';
import SignedOutModal from './components/SignedOutModal';

import { BreweryProvider } from './context/BreweryContext';
import { BrewerProvider } from './context/BrewerContext';

function App() {
  return (
    <BrewerProvider>
      <BreweryProvider>
        <Router>
        <SignedOutModal loginPath="/login" />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/about" element={<About />} />
            <Route path="/brewer/dashboard/:userId" element={<BrewerDashboard />} />
            <Route path="/brewer/analytics/:brewerId" element={<Analytics />} />
            <Route path="/brewer/profile/:brewerId" element={<BrewerProfile />} />
            <Route path="/user/dashboard/:userId" element={<UserDashboard />} />
            <Route path="/user/profile/:userId" element={<UserProfile />} />
            <Route path="/user/find-breweries" element={<FindBreweries />} />
            <Route path="/brewery/:breweryId" element={<BreweryPage />} /> 
            <Route path="*" element={<NoPage />} />
          </Routes>
        </Router>
      </BreweryProvider>
    </BrewerProvider>
  );
}

export default App