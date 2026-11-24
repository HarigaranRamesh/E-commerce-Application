import React, { useState, useEffect } from 'react';
import { strapiAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
    Layers, 
    RefreshCw, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    Upload, 
    Star, 
    Sparkles, 
    Database, 
    Webhook, 
    Terminal 
} from 'lucide-react';
import './Admin.css';

const StrapiManager = () => {
    const [status, setStatus] = useState({ online: false, url: 'http://localhost:1337', checking: true });
    const [syncing, setSyncing] = useState(false);
    const [syncStats, setSyncStats] = useState(null);

    const checkCmsStatus = async () => {
        setStatus((prev) => ({ ...prev, checking: true }));
        try {
            const res = await strapiAPI.getStatus();
            setStatus({
                online: res.data?.strapi?.online || false,
                url: res.data?.strapi?.url || 'http://localhost:1337',
                checking: false,
            });
        } catch {
            setStatus({ online: false, url: 'http://localhost:1337', checking: false });
        }
    };

    useEffect(() => {
        checkCmsStatus();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await strapiAPI.triggerSync();
            setSyncStats(res.data);
            toast.success(`Synced ${res.data.totalSynced || 0} products from Strapi CMS! 🎉`);
        } catch (error) {
            console.error('Strapi sync error:', error);
            toast.error(error.response?.data?.message || 'Failed to sync from Strapi CMS. Ensure Strapi is running on port 1337.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="admin-content">
            <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                        <Layers size={28} color="#01579b" /> Strapi CMS Integration
                    </h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
                        Manage dynamic product catalogs, media galleries, ratings, and real-time storefront synchronization
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={checkCmsStatus} 
                        className="btn-secondary"
                        disabled={status.checking}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={status.checking ? 'animate-spin' : ''} />
                        Refresh Status
                    </button>
                    <a 
                        href={`${status.url}/admin`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#01579b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}
                    >
                        <ExternalLink size={16} /> Open Strapi Admin
                    </a>
                </div>
            </div>

            {/* Health & Connection Status Card */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                marginBottom: '28px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: status.online ? '#ecfdf5' : '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {status.online ? <CheckCircle2 size={26} color="#10b981" /> : <AlertCircle size={26} color="#ef4444" />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                                    Strapi Headless CMS Server
                                </h3>
                                <span style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    background: status.online ? '#d1fae5' : '#fee2e2',
                                    color: status.online ? '#065f46' : '#991b1b',
                                }}>
                                    {status.online ? 'ONLINE & CONNECTED' : 'OFFLINE / STANDBY'}
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                                Instance URL: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{status.url}</code>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #01579b 0%, #0284c7 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: syncing ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(1, 87, 155, 0.3)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing Catalog...' : 'Sync Catalog from Strapi CMS'}
                    </button>
                </div>

                {syncStats && (
                    <div style={{ marginTop: '18px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.9rem' }}>
                        ✅ Last Sync: {syncStats.message}
                    </div>
                )}
            </div>

            {/* Feature Capabilities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Upload size={20} color="#0284c7" />
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Dynamic Media Galleries</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        Upload multiple high-resolution images per product in the Strapi media library. The storefront automatically renders responsive photo carousels and zoom views.
                    </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Star size={20} color="#f59e0b" />
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Dynamic Ratings & Reviews</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        Control product review scores, rating averages, and customer feedback directly from the CMS Content Manager without editing code.
                    </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Webhook size={20} color="#10b981" />
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Real-Time Webhook Sync</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        Endpoint <code>/api/strapi/webhook</code> automatically captures publish, update, and unpublish actions to keep PostgreSQL and checkout in sync.
                    </p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Database size={20} color="#8b5cf6" />
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Enterprise Consistency</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        Shopping bag, Razorpay checkout, orders, stock reservations, and user wishlists remain transactional in PostgreSQL while enjoying Strapi UI.
                    </p>
                </div>
            </div>

            {/* Quick Setup Instructions */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0', fontSize: '1.15rem' }}>
                    <Terminal size={20} color="#334155" /> How to Launch Strapi CMS Locally
                </h3>
                <ol style={{ paddingLeft: '20px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.7' }}>
                    <li>Open a terminal and navigate to the CMS directory: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>cd cms</code></li>
                    <li>Install packages if not already installed: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>npm install</code></li>
                    <li>Launch the development server: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>npm run develop</code></li>
                    <li>Open <a href="http://localhost:1337/admin" target="_blank" rel="noreferrer" style={{ color: '#01579b', fontWeight: 600 }}>http://localhost:1337/admin</a> and create your Super Admin credentials.</li>
                    <li>Under <strong>Content Manager</strong> $\rightarrow$ <strong>Product</strong>, click <strong>Create new entry</strong> to upload images, set ratings, and publish products!</li>
                </ol>
            </div>
        </div>
    );
};

export default StrapiManager;
