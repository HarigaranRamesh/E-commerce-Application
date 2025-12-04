import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import { User, Mail, Phone, Calendar, MapPin, Package } from "lucide-react";
import "./Profile.css";

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await ordersAPI.getMyOrders();
                setOrders(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    <h2>Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* User Information Section */}
                <div className="profile-header">
                    <h1>My Profile</h1>
                </div>

                <div className="profile-info-card">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <User className="info-icon" />
                            <div className="info-content">
                                <label>Full Name</label>
                                <p>{user.fullname || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Mail className="info-icon" />
                            <div className="info-content">
                                <label>Email</label>
                                <p>{user.email || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="info-icon" />
                            <div className="info-content">
                                <label>Mobile</label>
                                <p>{user.mobile || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar className="info-icon" />
                            <div className="info-content">
                                <label>Gender</label>
                                <p>{user.gender || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar className="info-icon" />
                            <div className="info-content">
                                <label>Date of Birth</label>
                                <p>{user.dob || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item full-width">
                            <MapPin className="info-icon" />
                            <div className="info-content">
                                <label>Address</label>
                                <p>
                                    {user.street || user.city || user.state || user.zip || user.country
                                        ? `${user.street || ""} ${user.city || ""} ${user.state || ""} ${user.zip || ""} ${user.country || ""}`.trim()
                                        : "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="profile-orders-section">
                    <h2>
                        <Package className="section-icon" />
                        My Orders
                    </h2>

                    {loading ? (
                        <div className="loading">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="no-orders">
                            <p>You have no orders yet.</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-id">Order ID: {order._id}</span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="order-status">
                                        <span className={`status-badge ${order.isPaid ? "paid" : "unpaid"}`}>
                                            {order.isPaid ? "Paid" : "Not Paid"}
                                        </span>
                                        <span className={`status-badge ${order.isDelivered ? "delivered" : "processing"}`}>
                                            {order.isDelivered ? "Delivered" : "Processing"}
                                        </span>
                                    </div>

                                    <div className="order-items">
                                        {order.orderItems.map((item) => (
                                            <div key={item.product} className="order-item-detail">
                                                <img src={item.image} alt={item.name} />
                                                <div className="item-info">
                                                    <p className="item-name">{item.name}</p>
                                                    <p className="item-price">
                                                        {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <h3>Total: ${order.totalPrice.toFixed(2)}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
