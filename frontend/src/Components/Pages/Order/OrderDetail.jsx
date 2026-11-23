import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import {
    Package,
    Truck,
    CreditCard,
    ChevronLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Printer,
    RotateCcw,
    AlertCircle,
} from "lucide-react";
import "./OrderDetail.css";

const STATUS_STEPS = [
    { key: "pending", label: "Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
];

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [reason, setReason] = useState("");

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

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCancelOrder = async () => {
        if (!reason.trim()) {
            toast.error("Please enter a reason for cancellation");
            return;
        }

        setActionLoading(true);
        try {
            await ordersAPI.cancel(order._id || order.id, reason);
            toast.success("Order has been cancelled successfully");
            setShowCancelModal(false);
            setReason("");
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestReturn = async () => {
        if (!reason.trim()) {
            toast.error("Please enter a reason for return");
            return;
        }

        setActionLoading(true);
        try {
            await ordersAPI.requestReturn(order._id || order.id, reason);
            toast.success("Return request submitted successfully");
            setShowReturnModal(false);
            setReason("");
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit return request");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) return <div className="loading" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="loader"></div></div>;

    if (!order) return <div className="error" style={{ textAlign: "center", padding: "6rem 1rem" }}>Order not found</div>;

    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === "cancelled";
    const isReturned = order.status === "returned" || order.status === "refunded";
    const canCancel = order.status === "pending" || order.status === "confirmed";
    const canReturn = order.status === "delivered";

    return (
        <div className="order-detail-container">
            <div className="order-actions-top">
                <Link to="/profile" className="back-link">
                    <ChevronLeft size={20} /> Back to My Orders
                </Link>

                <button onClick={handlePrintInvoice} className="btn-print-invoice">
                    <Printer size={16} /> Print / Save Invoice
                </button>
            </div>

            {/* Header */}
            <div className="order-header-detail">
                <div>
                    <h1>Order #{String(order.id || order._id).substring(0, 8).toUpperCase()}</h1>
                    {order.invoiceNumber && <span className="invoice-badge">Invoice: {order.invoiceNumber}</span>}
                </div>
                <span className={`status-badge status-${order.status}`}>
                    {order.status.replace("_", " ").toUpperCase()}
                </span>
            </div>

            <div className="order-date">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </div>

            {/* Visual Tracking Progress Timeline */}
            {!isCancelled && !isReturned ? (
                <div className="order-progress-stepper">
                    {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                            <div key={step.key} className={`step-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                                <div className="step-circle">
                                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                                <span className="step-label">{step.label}</span>
                                {idx < STATUS_STEPS.length - 1 && <div className="step-line"></div>}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`order-alert-box ${isCancelled ? "cancelled" : "returned"}`}>
                    <AlertCircle size={20} />
                    <div>
                        <strong>Order {order.status.toUpperCase()}</strong>
                        <p>{isCancelled ? "This order was cancelled and inventory has been released." : "A return request has been recorded for this order."}</p>
                    </div>
                </div>
            )}

            {/* Shipping Carrier and Tracking Number if available */}
            {order.trackingNumber && (
                <div className="tracking-info-bar">
                    <Truck size={18} color="#10b981" />
                    <span>Tracking Number: <strong>{order.trackingNumber}</strong> via <strong>{order.carrier || "Express Courier"}</strong></span>
                </div>
            )}

            {/* Main Order Content */}
            <div className="order-content">
                <div className="order-main">
                    <div className="card">
                        <h3><Package className="icon" /> Purchased Items ({order.orderItems?.length || 0})</h3>
                        <div className="order-items-list">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item-detail">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>Size: <strong>{item.size || "M"}</strong> {item.color && `• Color: ${item.color}`}</p>
                                        <p>Quantity: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="item-total">
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Event Log */}
                    {order.timeline && order.timeline.length > 0 && (
                        <div className="card mt-4">
                            <h3><Clock className="icon" /> Order Activity History</h3>
                            <div className="timeline-activity-list">
                                {order.timeline.map((event, idx) => (
                                    <div key={idx} className="timeline-event">
                                        <div className="event-marker"></div>
                                        <div className="event-body">
                                            <div className="event-header">
                                                <strong>{event.title}</strong>
                                                <span className="event-time">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            {event.note && <p className="event-note">{event.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="order-sidebar">
                    {/* Shipping Address */}
                    <div className="card">
                        <h3><Truck className="icon" /> Delivery Address</h3>
                        <div className="info-group">
                            <strong>{order.shippingAddress?.fullName}</strong>
                            <p>{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            <p>{order.shippingAddress?.country || "India"}</p>
                            <p>Phone: {order.shippingAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <h3><CreditCard className="icon" /> Payment Details</h3>
                        <div className="info-group">
                            <p>Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
                            <p>Status: <strong style={{ color: order.isPaid ? "#10b981" : "#f59e0b" }}>{order.isPaid ? "PAID" : "PENDING"}</strong></p>
                            {order.paidAt && <p>Paid at: {new Date(order.paidAt).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card summary-card">
                        <h3>Price Breakdown</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{Number(order.itemsPrice).toLocaleString("en-IN")}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="summary-row" style={{ color: "#16a34a" }}>
                                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                <span>-₹{Number(order.discountAmount).toLocaleString("en-IN")}</span>
                            </div>
                        )}
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
                        </div>
                        <div className="summary-row">
                            <span>Estimated Tax</span>
                            <span>₹{Number(order.taxPrice).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Grand Total</span>
                            <span>₹{Number(order.totalPrice).toLocaleString("en-IN")}</span>
                        </div>

                        {/* Order Management Actions */}
                        <div className="order-actions-box mt-3">
                            {canCancel && (
                                <button
                                    className="btn-cancel-order"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    <XCircle size={16} /> Cancel Order
                                </button>
                            )}
                            {canReturn && (
                                <button
                                    className="btn-return-order"
                                    onClick={() => setShowReturnModal(true)}
                                >
                                    <RotateCcw size={16} /> Request Return / Refund
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Cancel Order</h3>
                        <p>Are you sure you want to cancel this order? Please tell us why:</p>
                        <textarea
                            rows="3"
                            placeholder="Reason for cancellation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Order</button>
                            <button className="btn-danger" onClick={handleCancelOrder} disabled={actionLoading}>
                                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Request Return / Exchange</h3>
                        <p>We are sorry this item didn't meet your expectations. Please describe the issue:</p>
                        <textarea
                            rows="3"
                            placeholder="Reason for return (size issue, defect, etc.)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowReturnModal(false)}>Close</button>
                            <button className="btn-primary" onClick={handleRequestReturn} disabled={actionLoading}>
                                {actionLoading ? "Submitting..." : "Submit Return Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
