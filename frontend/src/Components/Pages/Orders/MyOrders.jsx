import React, { useEffect, useState } from "react";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import "./MyOrders.css";

const MyOrders = () => {
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

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    return (
        <div className="my-orders-page">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <span>Order ID: {order._id}</span>
                                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className={`status ${order.isPaid ? "paid" : "unpaid"}`}>
                                    {order.isPaid ? "Paid" : "Not Paid"}
                                </span>
                                <span className={`status ${order.isDelivered ? "delivered" : "processing"}`}>
                                    {order.isDelivered ? "Delivered" : "Processing"}
                                </span>
                            </div>
                            <div className="order-items">
                                {order.orderItems.map((item) => (
                                    <div key={item.product} className="order-item-detail">
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-info">
                                            <p>{item.name}</p>
                                            <p>
                                                {item.quantity} x ${item.price} = ${item.quantity * item.price}
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
    );
};

export default MyOrders;
