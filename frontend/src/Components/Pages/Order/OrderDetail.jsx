import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Package, Truck, MapPin, CreditCard, ChevronLeft } from "lucide-react";
import "./OrderDetail.css";

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(id);
                setOrder(response.data);
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) return <div className="loading">Loading order details...</div>;

    if (!order) return <div className="error">Order not found</div>;

    return (
        <div className="order-detail-container">
            <Link to="/my-orders" className="back-link">
                <ChevronLeft size={20} /> Back to My Orders
            </Link>

            <div className="order-header-detail">
                <h1>Order #{order._id}</h1>
                <span className={`status-badge status-${order.status}`}>
                    {order.status}
                </span>
            </div>

            <div className="order-date">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </div>

            <div className="order-content">
                <div className="order-main">
                    <div className="card">
                        <h3><Package className="icon" /> Items</h3>
                        <div className="order-items-list">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item-detail">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ₹{item.price}</p>
                                    </div>
                                    <div className="item-total">
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="order-sidebar">
                    <div className="card">
                        <h3><Truck className="icon" /> Shipping</h3>
                        <div className="info-group">
                            <strong>{order.shippingAddress.fullName}</strong>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p>{order.shippingAddress.phone}</p>
                        </div>
                    </div>

                    <div className="card">
                        <h3><CreditCard className="icon" /> Payment</h3>
                        <div className="info-group">
                            <p>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
                            <p>Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
                        </div>
                    </div>

                    <div className="card summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Items</span>
                            <span>₹{order.itemsPrice}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>₹{order.shippingPrice}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>₹{order.taxPrice}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{order.totalPrice}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
