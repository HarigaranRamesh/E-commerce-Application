import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { ordersAPI } from "../../../services/api";
import { useAuth } from "../../../Context/AuthContext";
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  Calendar,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import "./OrderConfirmation.css";

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Try to use order passed via router navigation state first
  const stateOrder = location.state?.order;
  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder && !!id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // If order was not passed in location state, fetch it from API
    if (!order && id) {
      setLoading(true);
      ordersAPI
        .getById(id)
        .then((res) => {
          setOrder(res.data);
        })
        .catch((err) => {
          console.error("Failed to load order for confirmation:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleCopyId = () => {
    const rawId = order?._id || order?.id || id;
    if (!rawId) return;
    navigator.clipboard.writeText(rawId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="order-confirmation-wrapper">
        <div className="order-confirmation-container">
          <div className="confirmation-hero-card" style={{ minHeight: "260px" }}>
            <div
              className="skeleton-box"
              style={{ width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 20px" }}
            ></div>
            <div
              className="skeleton-line"
              style={{ width: "320px", height: "32px", margin: "0 auto 12px" }}
            ></div>
            <div
              className="skeleton-line"
              style={{ width: "480px", height: "18px", margin: "0 auto 10px" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found fallback
  if (!order && !loading) {
    return (
      <div className="order-confirmation-wrapper">
        <div className="order-confirmation-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="confirmation-hero-card">
            <div className="confirmation-icon-ring" style={{ color: "var(--luxury-gold)" }}>
              <Package size={40} />
            </div>
            <h1>Booking Details</h1>
            <p className="confirmation-subtitle">
              We couldn't retrieve the details for this booking right now. You can check all your previous orders in your account.
            </p>
            <div className="confirmation-actions-bar" style={{ marginTop: "24px" }}>
              <Link to="/my-orders" className="btn-confirm-primary">
                View My Orders <ArrowRight size={16} />
              </Link>
              <Link to="/" className="btn-confirm-secondary">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderId = String(order._id || order.id || id);
  const displayId = orderId.length > 8 ? orderId.substring(0, 8).toUpperCase() : orderId.toUpperCase();
  const customerName =
    order.shippingAddress?.fullName || user?.name || user?.fullName || "Valued Customer";
  const customerEmail =
    order.user?.email || user?.email || (order.shippingAddress?.email ?? "");

  const items = order.orderItems || [];
  const itemsPrice = Number(order.itemsPrice || order.subtotal || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const shippingPrice = Number(order.shippingPrice || 0);
  const totalPrice = Number(order.totalPrice || itemsPrice - discountAmount + shippingPrice || 0);

  const isPaid = order.isPaid || order.paymentMethod === "razorpay" || order.paymentMethod === "online";
  const paymentMethodLabel =
    order.paymentMethod === "cod"
      ? "Cash on Delivery (COD)"
      : "Prepaid Online (Razorpay)";

  // Estimated delivery calculation (3 to 5 days from order date)
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const estDeliveryStart = new Date(orderDate);
  estDeliveryStart.setDate(estDeliveryStart.getDate() + 3);
  const estDeliveryEnd = new Date(orderDate);
  estDeliveryEnd.setDate(estDeliveryEnd.getDate() + 5);

  const deliveryDateString = `${estDeliveryStart.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} – ${estDeliveryEnd.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="order-confirmation-wrapper">
      <div className="order-confirmation-container">
        {/* 1. Hero Celebration Card */}
        <div className="confirmation-hero-card">
          <div className="confirmation-badge-pill">
            <Sparkles size={14} /> Booking Confirmed
          </div>

          <div className="confirmation-icon-ring">
            <CheckCircle2 size={44} strokeWidth={2.5} />
          </div>

          <h1>Thank You, {customerName.split(" ")[0]}!</h1>
          <p className="confirmation-subtitle">
            Your booking has been received and is now being processed. We have reserved your items and our warehouse is preparing your parcel.
          </p>

          {customerEmail && (
            <div className="confirmation-email-notify">
              <ShieldCheck size={16} color="#10b981" />
              <span>
                Booking confirmation and invoice sent to <strong>{customerEmail}</strong>
              </span>
            </div>
          )}
        </div>

        {/* 2. Order Snapshot Bar */}
        <div className="confirmation-snapshot-grid">
          {/* Order ID */}
          <div className="snapshot-card">
            <div className="snapshot-icon">
              <Package size={22} />
            </div>
            <div className="snapshot-meta">
              <span className="snapshot-label">Booking Reference</span>
              <span className="snapshot-value">
                #{displayId}
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="copy-id-btn"
                  title="Copy full reference ID"
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </span>
            </div>
          </div>

          {/* Booking Date */}
          <div className="snapshot-card">
            <div className="snapshot-icon">
              <Calendar size={22} />
            </div>
            <div className="snapshot-meta">
              <span className="snapshot-label">Date & Time</span>
              <span className="snapshot-value">
                {orderDate.toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="snapshot-card">
            <div className="snapshot-icon">
              <CreditCard size={22} />
            </div>
            <div className="snapshot-meta">
              <span className="snapshot-label">Payment Mode</span>
              <span className="snapshot-value" style={{ fontSize: "0.88rem" }}>
                {isPaid ? "Paid Online" : "Pay on Delivery"}
              </span>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="snapshot-card">
            <div className="snapshot-icon">
              <Truck size={22} />
            </div>
            <div className="snapshot-meta">
              <span className="snapshot-label">Estimated Delivery</span>
              <span className="snapshot-value" style={{ fontSize: "0.88rem" }}>
                {deliveryDateString}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Order Journey Stepper */}
        <div className="confirmation-journey-card">
          <h3>
            <Clock size={18} color="var(--luxury-navy)" /> What Happens Next
          </h3>
          <div className="journey-steps-flow">
            <div className="journey-connector-line">
              <div className="journey-connector-progress"></div>
            </div>

            <div className="journey-step done">
              <div className="journey-step-circle">
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="journey-step-label">Booking Placed</span>
              <span className="journey-step-time">Confirmed</span>
            </div>

            <div className="journey-step active">
              <div className="journey-step-circle">2</div>
              <span className="journey-step-label">Processing</span>
              <span className="journey-step-time">Quality Check</span>
            </div>

            <div className="journey-step">
              <div className="journey-step-circle">3</div>
              <span className="journey-step-label">Dispatched</span>
              <span className="journey-step-time">Express Courier</span>
            </div>

            <div className="journey-step">
              <div className="journey-step-circle">4</div>
              <span className="journey-step-label">Delivered</span>
              <span className="journey-step-time">{estDeliveryEnd.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* 4. Details Split: Booked Items & Summary */}
        <div className="confirmation-details-split">
          {/* Left: Purchased Items List */}
          <div className="confirmation-section-card">
            <h3>
              <span>Booked Items ({items.length})</span>
              <ShoppingBag size={18} color="#6b7280" />
            </h3>

            <div className="booked-items-list">
              {items.map((item, idx) => {
                const price = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                return (
                  <div key={idx} className="booked-item-row">
                    <img
                      src={item.image || "/assets/mens_hub_logo.png"}
                      alt={item.name}
                      className="booked-item-thumb"
                    />
                    <div className="booked-item-details">
                      <h4 className="booked-item-name">{item.name}</h4>
                      <p className="booked-item-meta">
                        Size: <strong>{item.size || "M"}</strong>
                        {item.color ? ` • Color: ${item.color}` : ""}
                        {" • "}Qty: {qty}
                      </p>
                    </div>
                    <div className="booked-item-price">
                      ₹{(price * qty).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Delivery Address & Cost Summary */}
          <div className="confirmation-section-card">
            <h3>
              <span>Delivery Address</span>
              <MapPin size={18} color="#6b7280" />
            </h3>

            <div className="address-info-box">
              <strong>{order.shippingAddress?.fullName || customerName}</strong>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.postalCode ? ` - ${order.shippingAddress.postalCode}` : ""}
              </p>
              <p>{order.shippingAddress?.country || "India"}</p>
              {order.shippingAddress?.phone && (
                <p style={{ marginTop: "4px" }}>
                  Phone: <strong>{order.shippingAddress.phone}</strong>
                </p>
              )}
            </div>

            <h3 style={{ marginTop: "18px" }}>
              <span>Payment Summary</span>
              <CreditCard size={18} color="#6b7280" />
            </h3>

            <div className="payment-receipt-lines">
              <div className="receipt-line">
                <span>Items Subtotal</span>
                <span>₹{itemsPrice.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="receipt-line discount">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="receipt-line">
                <span>Delivery / Shipping</span>
                <span>{shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toLocaleString("en-IN")}`}</span>
              </div>

              <div className="receipt-line total-line">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Navigation Actions */}
        <div className="confirmation-actions-bar">
          <Link to={`/order/${orderId}`} className="btn-confirm-primary">
            Track & Manage Order <ArrowRight size={16} />
          </Link>
          <Link to="/Category" className="btn-confirm-secondary">
            Continue Shopping
          </Link>
          <button type="button" onClick={handlePrint} className="btn-confirm-ghost">
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
