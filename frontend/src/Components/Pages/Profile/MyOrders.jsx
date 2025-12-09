import React, { useEffect, useState } from "react";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersAPI.getMyOrders();
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'processing': return 'blue';
            case 'shipped': return 'indigo';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    if (orders.length === 0) {
        return (
            <div className="empty-orders">
                <Package size={64} color="#ccc" />
                <h3>No orders yet</h3>
                <p>Looks like you haven't placed any orders yet.</p>
                <button onClick={() => navigate('/')} className="shop-now-btn">Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-header" onClick={() => toggleOrder(order._id)}>
                            <div className="order-info">
                                <span className="order-id">Order #{order._id.substring(0, 8)}...</span>
                                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="order-status">
                                <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                    {order.status}
                                </span>
                                <span className="order-total">₹{order.totalPrice.toLocaleString("en-IN")}</span>
                                {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>

                        {expandedOrder === order._id && (
                            <div className="order-details">
                                <div className="order-items">
                                    {order.orderItems.map((item) => (
                                        <div key={item._id} className="order-item">
                                            <img src={item.image} alt={item.name} className="item-image" />
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p>Size: {item.size}</p>
                                                <p>Qty: {item.quantity}</p>
                                            </div>
                                            <p className="item-price">₹{item.price.toLocaleString("en-IN")}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-shipping">
                                    <h4>Shipping Details</h4>
                                    <p>{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                                    <p>Phone: {order.shippingAddress.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
