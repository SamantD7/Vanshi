import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Eye, CheckCircle, AlertTriangle, Database } from 'lucide-react';

const AdminDashboard = () => {
    const [forests, setForests] = useState([]);
    const [stats, setStats] = useState({ totalCredits: 0, villages: 0 });
    const [settings, setSettings] = useState({
        price_per_credit: 952,
        base_rates: { broadleaf: 30, mixed: 28, pine: 24, degraded: 20 }
    });

    const fetchData = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/forests');
            setForests(data);
            const { data: market } = await axios.get('http://localhost:5000/api/carbon/marketplace');
            const { data: globalSettings } = await axios.get('http://localhost:5000/api/admin/settings');

            setSettings(globalSettings);
            setStats({
                totalCredits: market.reduce((acc, a) => acc + (a.balance?.remaining_credits || 0), 0),
                villages: new Set(data.map(f => f.village_name)).size
            });
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleVerify = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/forests/${id}/verify`);
            await axios.post(`http://localhost:5000/api/carbon/${id}/activate`);
            alert('Forest verified and carbon asset activated!');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleSaveSettings = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/settings', settings);
            alert('Global ESG settings updated successfully!');
            fetchData();
        } catch (err) {
            alert('Failed to update settings');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this forest and all its carbon credits? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/forests/${id}`);
                alert('Forest and associated data removed successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Failed to remove forest');
            }
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Administrator Console</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Verification & Network Governance</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="card" style={{ padding: '10px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Credits</p>
                        <p style={{ fontWeight: '700' }}>{Math.floor(stats.totalCredits)}</p>
                    </div>
                    <div className="card" style={{ padding: '10px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Villages Joined</p>
                        <p style={{ fontWeight: '700' }}>{stats.villages}</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle color="var(--warning)" /> Pending Verifications
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Village</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Area (Ha)</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forests.filter(f => f.status === 'PENDING').map(f => (
                                        <tr key={f._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>{f.village_name}</td>
                                            <td style={{ padding: '12px' }}>{f.forest_area_ha}</td>
                                            <td style={{ padding: '12px' }}>{f.forest_type}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleVerify(f._id)}>
                                                    Verify & Issue
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {forests.filter(f => f.status === 'PENDING').length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No pending verifications</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle color="var(--primary)" /> Active Marketplace Forests
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Village</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Credits</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forests.filter(f => f.status === 'VERIFIED').map(f => (
                                        <tr key={f._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>{f.village_name}</td>
                                            <td style={{ padding: '12px' }}>{f.sales_data?.remaining_credits} / {f.sales_data?.total_issued}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#fee2e2', color: '#991b1b' }}
                                                    onClick={() => handleDelete(f._id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {forests.filter(f => f.status === 'VERIFIED').length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No active forests</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Database color="var(--primary)" /> Global Transaction Ledger
                        </h3>
                        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            <div style={{ color: '#4ade80', marginBottom: '10px' }}>{'>'} Ledger Synchronized with Simulated Blockchain</div>
                            <div style={{ marginBottom: '5px' }}>[BLOCK: 48102] Transaction: 0x8a...2e1 Completed. 50 Credits transferred.</div>
                            <div style={{ marginBottom: '5px' }}>[BLOCK: 48103] Transaction: 0x3c...fa9 Completed. 120 Credits transferred.</div>
                            <div style={{ color: '#6366f1' }}>{'>'} Status: DECENTRALIZED _ IMMUTABLE _ SECURE</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield color="var(--primary)" /> ESG Governance Settings
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Carbon Price (INR per TCO2e)</label>
                        <input
                            type="number"
                            className="glass"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                            value={settings.price_per_credit}
                            onChange={(e) => setSettings({ ...settings, price_per_credit: Number(e.target.value) })}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600' }}>Base Sequestration Rates (T/Ha)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {['broadleaf', 'mixed', 'pine', 'degraded'].map(type => (
                                <div key={type}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{type}</span>
                                    <input
                                        type="number"
                                        className="glass"
                                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                                        value={settings.base_rates[type]}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            base_rates: { ...settings.base_rates, [type]: Number(e.target.value) }
                                        })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }} onClick={handleSaveSettings}>
                        Update Global Settings
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '15px' }}>
                        Changes will reflect immediately in all new credit calculations and marketplace prices.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
