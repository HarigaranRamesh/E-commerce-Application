import React, { useEffect, useState } from 'react';
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
                const response = await adminAPI.getStats();
                setStats(response.data);
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
        <div className="admin-dashboard">
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon sales">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Sales</p>
                            <h3 className="stat-value">${stats.totalSales.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon orders">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Orders</p>
                            <h3 className="stat-value">{stats.totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon users">
                            <UsersIcon size={24} />
                        </div>
                        <div>
                            <p className="stat-label">Total Users</p>
                            <h3 className="stat-value">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for charts or more detailed data */}
            <div className="admin-card">
                <h3>Order Status Distribution</h3>
                <div className="status-grid">
                    {stats.salesByStatus.map((status) => (
                        <div key={status._id} className="status-item">
                            <span className={`status-badge status-${status._id}`}>
                                {status._id}
                            </span>
                            <span className="status-count">{status.count} orders</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardData;
