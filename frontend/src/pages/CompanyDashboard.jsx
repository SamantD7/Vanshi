import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, History, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketplaceCard = ({ asset, onBuy }) => {
    const [amount, setAmount] = useState(1);
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck color="var(--primary)" />
                    <span style={{ fontWeight: '600' }}>Sentinel-2 Verified</span>
                </div>
                <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>₹{asset.current_market_price || 952} / credit</span>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{asset.forest_id?.village_name} Forest Asset</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                <MapPin size={14} /> {asset.forest_id?.district}, {asset.forest_id?.state}
            </div>
            <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Available Credits</span>
                    <span style={{ fontWeight: '700' }}>{asset.balance?.remaining_credits || 0} / {Math.floor(asset.total_carbon_tco2e)} TCO2e</span>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Quantity to Buy</label>
                <input
                    type="number"
                    className="glass"
                    style={{ width: '100%', padding: '10px' }}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                />
            </div>

            <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onBuy(asset._id, amount)}
            >
                Purchase {amount} Credits
            </button>
        </div>
    );
};

const CompanyDashboard = () => {
    const [marketplace, setMarketplace] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('market');

    const fetchData = async () => {
        try {
            const { data: marketData } = await axios.get('http://localhost:5000/api/carbon/marketplace');
            setMarketplace(marketData);
            const { data: histData } = await axios.get('http://localhost:5000/api/transactions/history');
            setHistory(histData);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleBuy = async (carbonId, credits) => {
        try {
            await axios.post('http://localhost:5000/api/transactions/buy', {
                carbon_id: carbonId,
                credits_to_buy: credits
            });
            alert('Credits purchased successfully!');
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Purchase failed';
            alert('Purchase failed: ' + msg);
        }
    };

    const chartData = [
        { name: 'Jan', credits: 400 },
        { name: 'Feb', credits: 700 },
        { name: 'Mar', credits: 1200 },
        { name: 'Apr', credits: 1500 },
        { name: 'May', credits: 2100 },
    ];

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Corporate ESG Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Offset your carbon footprint with verified local credits</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '5px', borderRadius: '12px' }}>
                    <button className={`btn ${activeTab === 'market' ? 'btn-primary' : ''}`} style={{ padding: '8px 16px' }} onClick={() => setActiveTab('market')}>
                        <ShoppingCart size={18} /> Marketplace
                    </button>
                    <button className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`} style={{ padding: '8px 16px' }} onClick={() => setActiveTab('history')}>
                        <History size={18} /> History
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', marginBottom: '40px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>ESG Impact Summary</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Credits Retired</p>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }}>
                            {history.reduce((acc, t) => acc + t.credits_purchased, 0)} <span style={{ fontSize: '1rem' }}>TCO2e</span>
                        </h2>
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Financial Overview</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total ESG Investment</p>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
                            ₹{history.reduce((acc, t) => acc + t.amount_paid_inr, 0).toLocaleString()}
                        </h2>
                    </div>
                </div>
            </div>

            {activeTab === 'market' ? (
                <>
                    <h3 style={{ marginBottom: '20px' }}>Verified Carbon Marketplace</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {marketplace.map(asset => (
                            <MarketplaceCard key={asset._id} asset={asset} onBuy={handleBuy} />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h3 style={{ marginBottom: '20px' }}>Transaction Ledger</h3>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '15px' }}>Date</th>
                                    <th style={{ padding: '15px' }}>Asset ID</th>
                                    <th style={{ padding: '15px' }}>Credits</th>
                                    <th style={{ padding: '15px' }}>Amount</th>
                                    <th style={{ padding: '15px' }}>Ledger Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(t => (
                                    <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}>{new Date(t.timestamp).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '600' }}>{t.carbon_id?.forest_id?.village_name || 'Forest Asset'}</div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.carbon_id?._id?.slice(-8)}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>{t.credits_purchased} TCO2e</td>
                                        <td style={{ padding: '15px', fontWeight: '600' }}>₹{t.amount_paid_inr.toLocaleString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>IMMUTABLE</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompanyDashboard;
