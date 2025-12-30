import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, MapPin, Leaf, Activity, IndianRupee } from 'lucide-react';

const VillageDashboard = () => {
    const [forests, setForests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        village_name: '', district: '', state: '',
        forest_area_ha: '', forest_type: 'Broadleaf',
        latitude: 28.6139, longitude: 77.2090
    });

    const fetchForests = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/forests');
            setForests(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchForests(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/forests', {
                ...formData,
                location: { latitude: formData.latitude, longitude: formData.longitude }
            });
            setShowModal(false);
            fetchForests();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Village Forest Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your community forest carbon assets</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Register New Forest
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ background: 'var(--primary-dark)', color: 'white' }}>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Area</p>
                    <h2 style={{ color: 'white' }}>{forests.reduce((acc, f) => acc + f.forest_area_ha, 0)} Ha</h2>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified Forests</p>
                    <h2>{forests.filter(f => f.status === 'VERIFIED').length}</h2>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Credits Sold</p>
                    <h2>{forests.reduce((acc, f) => acc + (f.sales_data?.sold_credits || 0), 0)} TCO2e</h2>
                </div>
                <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Revenue</p>
                    <h2 style={{ color: 'var(--primary)' }}>₹{forests.reduce((acc, f) => acc + (f.sales_data?.revenue_earned || 0), 0).toLocaleString()}</h2>
                </div>
            </div>

            <h3 style={{ marginBottom: '20px' }}>Your Registered Forests</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {forests.map(forest => (
                    <motion.div key={forest._id} className="card" whileHover={{ scale: 1.02 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary-dark)' }}>
                                <Leaf size={24} />
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                background: forest.status === 'VERIFIED' ? '#dcfce7' : '#fef9c3',
                                color: forest.status === 'VERIFIED' ? '#166534' : '#854d0e'
                            }}>
                                {forest.status}
                            </span>
                        </div>
                        <h4 style={{ marginBottom: '5px' }}>{forest.village_name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                            <MapPin size={14} /> {forest.district}, {forest.state}
                        </div>

                        {forest.sales_data && forest.sales_data.total_issued > 0 && (
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>Remaining Credits</span>
                                    <span style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{forest.sales_data.remaining_credits} / {forest.sales_data.total_issued}</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(forest.sales_data.remaining_credits / forest.sales_data.total_issued) * 100}%`,
                                        height: '100%',
                                        background: 'var(--primary)'
                                    }} />
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#166534' }}>
                                    Earned: ₹{forest.sales_data.revenue_earned.toLocaleString()}
                                </div>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Area</p>
                                <p style={{ fontWeight: '600' }}>{forest.forest_area_ha} Ha</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type</p>
                                <p style={{ fontWeight: '600' }}>{forest.forest_type}</p>
                            </div>
                        </div>
                        {forest.status === 'VERIFIED' && !forest.sales_data?.total_issued && (
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                                onClick={async () => {
                                    try {
                                        await axios.post(`http://localhost:5000/api/forests/${forest._id}/activate`);
                                        alert('Carbon credits activated and listed on marketplace!');
                                        fetchForests();
                                    } catch (err) {
                                        alert(err.response?.data || 'Activation failed');
                                    }
                                }}
                            >
                                <Activity size={16} /> Activate Carbon Credits
                            </button>
                        )}

                        <button
                            className="btn"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                background: '#fee2e2',
                                color: '#991b1b',
                                marginTop: '10px'
                            }}
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to remove this forest and all its carbon credits?')) {
                                    try {
                                        await axios.delete(`http://localhost:5000/api/forests/${forest._id}`);
                                        fetchForests();
                                    } catch (err) {
                                        alert('Failed to remove forest');
                                    }
                                }
                            }}
                        >
                            Remove Forest
                        </button>
                    </motion.div>
                ))}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2>Register Forest</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Village Name</label>
                                    <input type="text" className="glass" style={{ width: '100%', padding: '10px' }} value={formData.village_name} onChange={e => setFormData({ ...formData, village_name: e.target.value })} required />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>District</label>
                                    <input type="text" className="glass" style={{ width: '100%', padding: '10px' }} value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>State</label>
                                <input type="text" className="glass" style={{ width: '100%', padding: '10px' }} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Area (Hectares)</label>
                                    <input type="number" className="glass" style={{ width: '100%', padding: '10px' }} value={formData.forest_area_ha} onChange={e => setFormData({ ...formData, forest_area_ha: e.target.value })} required />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Forest Type</label>
                                    <select className="glass" style={{ width: '100%', padding: '10px' }} value={formData.forest_type} onChange={e => setFormData({ ...formData, forest_type: e.target.value })}>
                                        <option>Broadleaf</option>
                                        <option>Mixed</option>
                                        <option>Pine</option>
                                        <option>Degraded</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Registration</button>
                                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillageDashboard;
