import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'VILLAGE'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await register(formData);
            if (user.role === 'VILLAGE') navigate('/village');
            else if (user.role === 'COMPANY') navigate('/company');
            else if (user.role === 'ADMIN') navigate('/admin');
        } catch (err) {
            console.error("REGISTRATION ERROR:", err);
            let message = 'Registration failed.';

            if (err.response) {
                // If backend sent the new JSON format { message: "..." }
                if (err.response.data && err.response.data.message) {
                    message = err.response.data.message;
                } else {
                    message = `Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`;
                }
            } else if (err.request) {
                message = 'Network Error: Backend is unreachable. Please ensure it is running on port 5000.';
            } else {
                message = `Request Error: ${err.message}`;
            }

            setError(message);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', padding: '15px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '15px' }}>
                        <UserPlus size={32} />
                    </div>
                    <h2>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join the VANSHI ecosystem</p>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>I am a...</label>
                        <select
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="VILLAGE">Village Forest Committee</option>
                            <option value="COMPANY">Company / Carbon Buyer</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                        Create Account
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

