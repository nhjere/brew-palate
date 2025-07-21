import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard';
import BrewerDashboard from './pages/BrewerDashboard'
import Registration from './pages/Registration'
import NoPage from './pages/NoPage';
import BreweryPage from './pages/BreweryPage';
import './App.css'
import './index.css'
import { BreweryProvider } from './context/BreweryContext';
import { BeerProvider } from './context/BeerContext';

function App() {
  return (
    <BeerProvider>
      <BreweryProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register/" element={<Registration />} />
            <Route path="/user/dashboard/:userId" element={<UserDashboard />} />
            <Route path="/brewer/dashboard" element={<BrewerDashboard />} />
            <Route path="/brewery/:breweryId" element={<BreweryPage />} /> 
            <Route path="*" element={<NoPage />} />
          </Routes>
        </Router>
      </BreweryProvider>
    </BeerProvider>
  );
}

export default App