import React, { useEffect, useState } from 'react';
import { adminAPI, ordersAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await adminAPI.getOrders(); // Need to add this specific endpoint or reuse ordersAPI.getAll() if admin permitted
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            if (status === 'delivered') {
                await ordersAPI.updateToDelivered(id);
            }
            // For other statuses we might need a general update endpoint, 
            // but for now only 'delivered' is explicitly requested/implemented in backend.
            // Refresh orders
            const response = await adminAPI.getOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div>
            <h2>Orders Management</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Delivered</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id.substring(0, 10)}...</td>
                                <td>{order.user && order.user.name}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>${order.totalPrice.toFixed(2)}</td>
                                <td>
                                    {order.isPaid ? (
                                        <span className="status-badge status-delivered">Paid</span>
                                    ) : (
                                        <span className="status-badge status-pending">Not Paid</span>
                                    )}
                                </td>
                                <td>
                                    {order.isDelivered ? (
                                        <span className="status-badge status-delivered">Delivered</span>
                                    ) : (
                                        <button
                                            className="status-badge status-pending"
                                            onClick={() => handleStatusChange(order._id, 'delivered')}
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </td>
                                <td>
                                    <Link to={`/order/${order._id}`} className="btn-icon">
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
