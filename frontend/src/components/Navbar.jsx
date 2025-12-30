import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <Leaf size={32} />
                    VANSHI
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {user ? (
                        <>
                            <Link to={user.role === 'VILLAGE' ? '/village' : user.role === 'COMPANY' ? '/company' : '/admin'} style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>
                                Dashboard
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--primary-light)', borderRadius: '20px', color: 'var(--primary-dark)' }}>
                                <UserIcon size={18} />
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name} ({user.role})</span>
                            </div>
                            <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '5px' }}>
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary">Join VANSHI</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
