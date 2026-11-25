import React, { useEffect, useState, useMemo } from "react";
import { ordersAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Package, Truck, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchOrders = async () => {
            try {
                const response = await ordersAPI.getMyOrders();
                if (isMounted) {
                    const data = Array.isArray(response.data) ? response.data : (response.data?.orders || []);
                    setOrders(data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                if (isMounted) {
                    toast.error("Failed to load orders");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const filteredOrders = useMemo(() => {
        let list = [...orders];

        // Status filtering
        if (statusFilter === "delivered") {
            list = list.filter((o) => (o.status || "").toLowerCase() === "delivered");
        } else if (statusFilter === "in_transit") {
            list = list.filter((o) => ["shipped", "out_for_delivery"].includes((o.status || "").toLowerCase()));
        } else if (statusFilter === "processing") {
            list = list.filter((o) => ["processing", "confirmed", "pending"].includes((o.status || "").toLowerCase()));
        } else if (statusFilter === "cancelled") {
            list = list.filter((o) => ["cancelled", "returned"].includes((o.status || "").toLowerCase()));
        }

        // Sorting
        if (sortBy === "oldest") {
            list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === "amount_high") {
            list.sort((a, b) => Number(b.totalPrice || 0) - Number(a.totalPrice || 0));
        } else if (sortBy === "amount_low") {
            list.sort((a, b) => Number(a.totalPrice || 0) - Number(b.totalPrice || 0));
        } else {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        return list;
    }, [orders, statusFilter, sortBy]);

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ordersPerPage;
        return filteredOrders.slice(start, start + ordersPerPage);
    }, [filteredOrders, currentPage, ordersPerPage]);

    const getStatusBadge = (status) => {
        const s = (status || "pending").toLowerCase();
        switch (s) {
            case "delivered":
                return { label: "Delivered", color: "#166534", bg: "#dcfce7", border: "#86efac", icon: CheckCircle2 };
            case "shipped":
            case "out_for_delivery":
                return { label: "In Transit", color: "#1e40af", bg: "#dbeafe", border: "#93c5fd", icon: Truck };
            case "processing":
            case "confirmed":
                return { label: "Processing", color: "#854d0e", bg: "#fef9c3", border: "#fde047", icon: Clock };
            case "cancelled":
                return { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", icon: AlertCircle };
            default:
                return { label: "Order Placed", color: "#92400e", bg: "#fef3c7", border: "#fcd34d", icon: Package };
        }
    };

    if (loading) {
        return (
            <div className="profile-orders-card">
                <div className="card-section-header">
                    <h2>My Orders</h2>
                </div>
                <div className="profile-orders-list">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="profile-order-card skeleton-card" style={{ padding: "20px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                <div className="skeleton-line" style={{ width: "180px", height: "18px" }}></div>
                                <div className="skeleton-box" style={{ width: "90px", height: "26px", borderRadius: "20px" }}></div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <div className="skeleton-box" style={{ width: "65px", height: "65px", borderRadius: "4px", flexShrink: 0 }}></div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div className="skeleton-line" style={{ width: "60%", height: "16px" }}></div>
                                    <div className="skeleton-line" style={{ width: "30%", height: "14px" }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="profile-orders-card">
                <div className="card-section-header">
                    <h2>My Orders</h2>
                </div>
                <div className="profile-orders-empty">
                    <div className="empty-icon-circle">
                        <Package size={38} color="#d5a249" />
                    </div>
                    <h3>No Orders Placed Yet</h3>
                    <p>When you purchase your favorite clothing styles, track their live delivery status right here.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/Category")}
                        className="profile-orders-shop-btn"
                    >
                        <span>Start Shopping</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-orders-card">
            <div className="card-section-header">
                <h2>My Orders</h2>
                <span className="orders-count-pill">{orders.length} {orders.length === 1 ? "Order" : "Orders"}</span>
            </div>

            {/* Orders Filtering & Sorting Toolbar */}
            <div className="orders-filter-toolbar">
                <div className="orders-status-tabs">
                    <button
                        type="button"
                        className={`orders-status-tab ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                    >
                        All ({orders.length})
                    </button>
                    <button
                        type="button"
                        className={`orders-status-tab ${statusFilter === "processing" ? "active" : ""}`}
                        onClick={() => { setStatusFilter("processing"); setCurrentPage(1); }}
                    >
                        Processing
                    </button>
                    <button
                        type="button"
                        className={`orders-status-tab ${statusFilter === "in_transit" ? "active" : ""}`}
                        onClick={() => { setStatusFilter("in_transit"); setCurrentPage(1); }}
                    >
                        In Transit
                    </button>
                    <button
                        type="button"
                        className={`orders-status-tab ${statusFilter === "delivered" ? "active" : ""}`}
                        onClick={() => { setStatusFilter("delivered"); setCurrentPage(1); }}
                    >
                        Delivered
                    </button>
                    <button
                        type="button"
                        className={`orders-status-tab ${statusFilter === "cancelled" ? "active" : ""}`}
                        onClick={() => { setStatusFilter("cancelled"); setCurrentPage(1); }}
                    >
                        Cancelled
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Sort by:</span>
                    <select
                        className="orders-sort-select"
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_high">Total: High to Low</option>
                        <option value="amount_low">Total: Low to High</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                    <p style={{ margin: 0 }}>No orders found under "{statusFilter.replace("_", " ")}" status.</p>
                </div>
            ) : (
                <div className="profile-orders-list">
                    {paginatedOrders.map((order) => {
                    const orderId = String(order.id || order._id || "");
                    const displayId = orderId ? (orderId.length > 8 ? orderId.substring(0, 8).toUpperCase() : orderId) : "ORDER";
                    const orderDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                          })
                        : "Recent";
                    const statusInfo = getStatusBadge(order.status);
                    const StatusIcon = statusInfo.icon;
                    const items = Array.isArray(order.orderItems)
                        ? order.orderItems
                        : Array.isArray(order.order_items)
                        ? order.order_items
                        : [];
                    const isExpanded = expandedOrder === orderId;
                    const totalPrice = Number(order.totalPrice || order.total || 0);

                    return (
                        <div key={orderId || Math.random()} className={`profile-order-card ${isExpanded ? "expanded" : ""}`}>
                            {/* Order Header Summary */}
                            <div className="profile-order-header" onClick={() => toggleOrder(orderId)}>
                                <div className="profile-order-header-left">
                                    <div className="order-id-row">
                                        <span className="order-id-label">ORDER ID:</span>
                                        <span className="order-id-val">#{displayId}</span>
                                    </div>
                                    <span className="order-date-text">Placed on {orderDate}</span>
                                </div>

                                <div className="profile-order-header-right">
                                    <div
                                        className="profile-order-status-badge"
                                        style={{
                                            color: statusInfo.color,
                                            backgroundColor: statusInfo.bg,
                                            borderColor: statusInfo.border,
                                        }}
                                    >
                                        <StatusIcon size={13} />
                                        <span>{statusInfo.label}</span>
                                    </div>

                                    <div className="profile-order-total-group">
                                        <span className="order-total-price">₹{totalPrice.toLocaleString("en-IN")}</span>
                                        <button
                                            type="button"
                                            className="expand-toggle-btn"
                                            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                                        >
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Preview (Always Visible Summary) */}
                            <div className="profile-order-items-preview">
                                {items.slice(0, 3).map((item, idx) => (
                                    <div key={item.id || item._id || idx} className="preview-thumb-wrap">
                                        <img
                                            src={item.image || item.imageUrl || "/images/placeholder.png"}
                                            alt={item.name || "Item"}
                                            className="preview-item-thumb"
                                            onError={(e) => {
                                                e.target.src = "/images/placeholder.png";
                                            }}
                                        />
                                        {(item.quantity || 1) > 1 && (
                                            <span className="preview-qty-badge">x{item.quantity}</span>
                                        )}
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <span className="more-items-count">+{items.length - 3} more</span>
                                )}
                            </div>

                            {/* Expandable Detailed View */}
                            {isExpanded && (
                                <div className="profile-order-expanded-details">
                                    <div className="expanded-items-list">
                                        {items.map((item, idx) => (
                                            <div key={item.id || item._id || idx} className="expanded-order-item">
                                                <img
                                                    src={item.image || item.imageUrl || "/images/placeholder.png"}
                                                    alt={item.name || "Product"}
                                                    className="expanded-item-img"
                                                    onError={(e) => {
                                                        e.target.src = "/images/placeholder.png";
                                                    }}
                                                />
                                                <div className="expanded-item-info">
                                                    <h4 className="expanded-item-name">{item.name || "Apparel Item"}</h4>
                                                    <div className="expanded-item-specs">
                                                        {item.size && <span className="item-spec-pill">Size: {item.size}</span>}
                                                        <span className="item-spec-pill">Qty: {item.quantity || 1}</span>
                                                    </div>
                                                </div>
                                                <div className="expanded-item-pricing">
                                                    <span className="item-final-price">
                                                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shipping & Payment Summary */}
                                    <div className="expanded-order-meta-grid">
                                        <div className="meta-block">
                                            <h5>Delivery Address</h5>
                                            <p className="meta-name">{order.shippingAddress?.fullName || order.shippingAddress?.name || "Customer"}</p>
                                            <p className="meta-text">{order.shippingAddress?.address || order.shippingAddress?.street || "Address provided at checkout"}</p>
                                            <p className="meta-text">
                                                {[order.shippingAddress?.city, order.shippingAddress?.postalCode || order.shippingAddress?.zipCode, order.shippingAddress?.country || "India"]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                            {order.shippingAddress?.phone && (
                                                <p className="meta-text">Phone: {order.shippingAddress.phone}</p>
                                            )}
                                        </div>

                                        <div className="meta-block">
                                            <h5>Payment Details</h5>
                                            <p className="meta-text">
                                                Method: <strong>{String(order.paymentMethod || "Online Payment").toUpperCase()}</strong>
                                            </p>
                                            <p className="meta-text">
                                                Status: <span className="meta-payment-status">{order.isPaid ? "Paid in Full" : "Pending"}</span>
                                            </p>
                                            {order.invoiceNumber && (
                                                <p className="meta-text">Invoice: #{order.invoiceNumber}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="expanded-order-actions">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/order/${orderId}`);
                                            }}
                                            className="view-order-tracking-btn"
                                        >
                                            <Truck size={15} />
                                            <span>View Full Details & Live Tracking</span>
                                            <ExternalLink size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="orders-pagination-bar">
                    <span>
                        Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                    </span>
                    <div className="orders-pagination-actions">
                        <button
                            type="button"
                            className="orders-page-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            title="Previous Page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={`orders-page-btn ${currentPage === p ? "active" : ""}`}
                                onClick={() => setCurrentPage(p)}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="orders-page-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            title="Next Page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
