import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { DollarSign, ShoppingBag, Users as UsersIcon } from 'lucide-react';

const DashboardData = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalSales: 0,
        salesByStatus: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes] = await Promise.allSettled([
                    adminAPI.getStats(),
                    adminAPI.getOrders(),
                ]);

                if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
                    setStats(statsRes.value.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="dashboard-content">
            <div className="dashboard-header-banner">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back, Admin. Here's what's happening with your store today.</p>
                </div>
                <div className="date-badge">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card total-sales">
                    <div className="stat-content">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper">
                                <DollarSign size={28} />
                            </div>
                            <span className="trend-badge positive">+12.5%</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Total Sales</p>
                            <h3 className="stat-value">${Number(stats.totalSales || 0).toFixed(2)}</h3>
                            <p className="stat-desc">Total revenue generated</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card total-orders">
                    <div className="stat-content">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper">
                                <ShoppingBag size={28} />
                            </div>
                            <span className="trend-badge positive">+5.2%</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Total Orders</p>
                            <h3 className="stat-value">{stats.totalOrders}</h3>
                            <p className="stat-desc">Orders pending processing</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card total-users">
                    <div className="stat-content">
                        <div className="stat-header">
                            <div className="stat-icon-wrapper">
                                <UsersIcon size={28} />
                            </div>
                            <span className="trend-badge neutral">+1.0%</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Total Users</p>
                            <h3 className="stat-value">{stats.totalUsers}</h3>
                            <p className="stat-desc">Active registered customers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-panels-grid">
                <div className="admin-card chart-panel">
                    <div className="card-header">
                        <h3>Order Status Distribution</h3>
                    </div>
                    <div className="card-body">
                        <div className="status-grid">
                            {stats.salesByStatus.map((status) => (
                                <div key={status._id} className="status-stat-item">
                                    <div className={`status-indicator status-${status._id}`}></div>
                                    <div className="status-details">
                                        <span className="status-name">{status._id}</span>
                                        <span className="status-count">{status.count} orders</span>
                                    </div>
                                    <div className="status-progress-bar">
                                        <div
                                            className={`progress-fill status-${status._id}`}
                                            style={{ width: `${stats.totalOrders > 0 ? (status.count / stats.totalOrders) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strapi CMS Quick Management Card */}
                <div className="admin-card activity-panel">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Strapi Headless CMS</h3>
                        <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                            DYNAMIC CATALOG
                        </span>
                    </div>
                    <div className="card-body">
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                            Upload product photos, multi-image galleries, and manage ratings & categories dynamically via Strapi Headless CMS.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link
                                to="/admin/strapi-cms"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: '#01579b',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Open CMS Sync Manager
                            </Link>
                            <a
                                href="http://localhost:1337/admin"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    border: '1px solid #cbd5e1',
                                }}
                            >
                                Strapi Admin (1337)
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardData;
