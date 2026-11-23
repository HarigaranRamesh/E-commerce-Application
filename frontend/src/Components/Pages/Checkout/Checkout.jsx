import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Truck, CreditCard, ShieldCheck, CheckCircle2, Zap } from "lucide-react";
import { AuthContext } from "../../../Context/AuthContext";
import { CartContext } from "../../../Context/CartContext";
import { ordersAPI, paymentAPI } from "../../../services/api";
import "./CheckoutStyles.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);

  const checkoutState = location.state || {};
  const cart = checkoutState.cart || [];
  const discountAmount = checkoutState.discountAmount || 0;
  const couponCode = checkoutState.couponCode || null;

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
    phone: user?.phone || "",
  });

  // Calculate pricing
  const itemsPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = deliveryMethod === "express" ? 150 : itemsPrice >= 999 ? 0 : 60;
  const taxPrice = Math.round((itemsPrice - discountAmount) * 0.05); // 5% GST
  const totalPrice = Math.max(0, itemsPrice - discountAmount + shippingPrice + taxPrice);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleOrderSubmission = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to complete your order");
      navigate("/Login");
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.phone) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    setProcessingPayment(true);
    try {
      let paymentResult = {
        id: `TXN-${Date.now()}`,
        status: paymentMethod === "cod" ? "pending" : "succeeded",
        update_time: new Date().toISOString(),
        email_address: user.email,
      };

      // Server-side payment verification for card/UPI
      if (paymentMethod !== "cod") {
        toast("Initiating secure payment gateway...", { icon: "🔒" });
        const intentRes = await paymentAPI.createIntent(totalPrice, "inr");
        const { clientSecret, paymentIntentId } = intentRes.data;

        // Verify intent on the server
        const verifyRes = await paymentAPI.verify(paymentIntentId);
        if (!verifyRes.data.verified) {
          throw new Error("Payment verification failed on the server.");
        }
        paymentResult = verifyRes.data.transaction;
      }

      const orderPayload = {
        orderItems: cart.map((item) => ({
          product: item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size || "M",
          color: item.selectedColor || undefined,
        })),
        shippingAddress: shippingInfo,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discountAmount,
        isPaid: paymentMethod !== "cod",
      };

      const response = await ordersAPI.create(orderPayload);
      clearCart();
      toast.success("Order confirmed successfully! 🎉");
      setTimeout(() => {
        navigate(`/order/${response.data._id || response.data.id}`);
      }, 1500);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to complete checkout");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page container text-center" style={{ paddingTop: "160px", minHeight: "60vh" }}>
        <h2>Your Cart is Empty</h2>
        <p>Please add products to your cart before proceeding to checkout.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/Category")}>
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left Section: Details & Methods */}
        <div className="checkout-left">
          <h2>1. Shipping Address</h2>
          <form id="checkout-form" onSubmit={handleOrderSubmission} className="shipping-form">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={shippingInfo.fullName}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (10 digits) *"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Street Address, Apartment, Suite *"
              value={shippingInfo.address}
              onChange={handleInputChange}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={shippingInfo.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal / PIN Code *"
                value={shippingInfo.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={shippingInfo.country}
              onChange={handleInputChange}
              readOnly
            />
          </form>

          {/* Delivery Options */}
          <h2 className="mt-4">2. Delivery Speed</h2>
          <div className="payment-options">
            <label className={`payment-option ${deliveryMethod === "standard" ? "selected" : ""}`}>
              <input
                type="radio"
                name="deliveryMethod"
                value="standard"
                checked={deliveryMethod === "standard"}
                onChange={() => setDeliveryMethod("standard")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={18} /> Standard Delivery (3-5 business days)
                </span>
                <strong>{itemsPrice >= 999 ? "FREE" : "₹60"}</strong>
              </div>
            </label>

            <label className={`payment-option ${deliveryMethod === "express" ? "selected" : ""}`}>
              <input
                type="radio"
                name="deliveryMethod"
                value="express"
                checked={deliveryMethod === "express"}
                onChange={() => setDeliveryMethod("express")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={18} color="#f59e0b" /> Express Priority Delivery (1-2 business days)
                </span>
                <strong>₹150</strong>
              </div>
            </label>
          </div>

          {/* Payment Method */}
          <h2 className="mt-4">3. Payment Option</h2>
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} /> Cash on Delivery (Pay at Doorstep)
              </span>
            </label>

            <label className={`payment-option ${paymentMethod === "stripe" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
              />
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={18} /> Credit / Debit Card (Secure Stripe Server-Verified)
              </span>
            </label>

            <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
              />
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} color="#10b981" /> Instant UPI / Net Banking (GooglePay, PhonePe, Paytm)
              </span>
            </label>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              form="checkout-form"
              className="pay-button cod-btn"
              disabled={processingPayment}
            >
              {processingPayment
                ? "Processing Secure Order..."
                : `Place Order • ₹${totalPrice.toLocaleString("en-IN")}`}
            </button>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#6b7280", marginTop: "0.75rem", justifyContent: "center" }}>
              <ShieldCheck size={16} color="#10b981" /> 256-bit SSL encrypted checkout with server-side validation
            </p>
          </div>
        </div>

        {/* Right Section: Order Summary */}
        <div className="checkout-right">
          <h2>Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.itemKey || item.id} className="order-item">
                <img src={item.image} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    Size: {item.size || "M"} • Qty: {item.quantity}
                  </p>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <div className="summary-breakdown" style={{ marginTop: "1.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#4b5563" }}>Items Subtotal</span>
              <span>₹{itemsPrice.toLocaleString("en-IN")}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#16a34a" }}>
                <span>Coupon Discount ({couponCode})</span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#4b5563" }}>Shipping ({deliveryMethod})</span>
              <span>{shippingPrice === 0 ? <strong style={{ color: "#16a34a" }}>FREE</strong> : `₹${shippingPrice}`}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#4b5563" }}>Estimated Tax (5% GST)</span>
              <span>₹{taxPrice.toLocaleString("en-IN")}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb", fontSize: "1.25rem", fontWeight: 700 }}>
              <span>Total Payable</span>
              <span style={{ color: "#10b981" }}>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
