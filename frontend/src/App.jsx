import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VillageDashboard from './pages/VillageDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/village/*" element={
                        <PrivateRoute roles={['VILLAGE']}>
                            <VillageDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/company/*" element={
                        <PrivateRoute roles={['COMPANY']}>
                            <CompanyDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/admin/*" element={
                        <PrivateRoute roles={['ADMIN']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
