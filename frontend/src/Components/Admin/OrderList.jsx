import React, { useEffect, useState } from 'react';
import { adminAPI, ordersAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
];

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await adminAPI.getOrders();
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusSelect = async (id, newStatus) => {
        try {
            await ordersAPI.updateStatus(id, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h2>Orders Management ({orders.length})</h2>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Lifecycle Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>
                                    <strong>#{String(order.id || order._id).substring(0, 8).toUpperCase()}</strong>
                                </td>
                                <td>{order.user && (order.user.name || order.user.email)}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}</td>
                                <td>
                                    {order.isPaid ? (
                                        <span className="status-badge status-delivered">
                                            <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                                            Paid ({order.paymentMethod?.toUpperCase()})
                                        </span>
                                    ) : (
                                        <span className="status-badge status-pending">
                                            Unpaid ({order.paymentMethod?.toUpperCase() || 'COD'})
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusSelect(order._id, e.target.value)}
                                        className={`admin-status-select status-${order.status}`}
                                        style={{
                                            padding: '0.35rem 0.65rem',
                                            borderRadius: '20px',
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            border: '1px solid #d1d5db',
                                        }}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <Link to={`/order/${order._id}`} className="btn-icon" title="View Order & Invoice">
                                        <Eye size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;
