import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Globe, TrendingUp, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="gradient-bg" style={{ padding: '100px 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'white' }}
                    >
                        Quantifying Forest Carbon <br /> with Satellite Precision
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9, maxWidth: '800px', margin: '0 auto 40px' }}
                    >
                        VANSHI connects village forests to the global carbon market. Using Sentinel-2 satellite data and AI, we turn forest health into verified carbon credits.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', fontSize: '1.1rem', padding: '15px 30px' }}>
                            Start Your Impact <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{ padding: '80px 0', background: 'white' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <Globe size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Local Community Driven</h3>
                            <p>Directly empowering village forest committees through carbon revenue.</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <Shield size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>Satellite Verified</h3>
                            <p>Immutable NDVI-based quantification using Sentinel-2 imagery.</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <TrendingUp size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                            <h3>ESG Transparency</h3>
                            <p>Companies get real-time dashboards of their carbon offset impact.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Metrics Section */}
            <section style={{ padding: '80px 0', background: 'var(--primary-light)' }}>
                <div className="container text-center" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '50px', fontSize: '2.5rem' }}>Our Collective Impact</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', flexWrap: 'wrap' }}>
                        <div>
                            <h2 style={{ fontSize: '3rem', color: 'var(--primary-dark)' }}>25k+</h2>
                            <p>Hectares Monitored</p>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '3rem', color: 'var(--primary-dark)' }}>1.2M</h2>
                            <p>Carbon Credits Generated</p>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '3rem', color: 'var(--primary-dark)' }}>₹150M</h2>
                            <p>Revenue to Villages</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
