import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Truck, CreditCard, ShieldCheck, CheckCircle2, Zap, Smartphone, RefreshCw } from "lucide-react";
import { AuthContext } from "../../../Context/AuthContext";
import { CartContext } from "../../../Context/CartContext";
import { ordersAPI, paymentAPI } from "../../../services/api";
import "./CheckoutStyles.css";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to proceed with checkout");
      navigate("/Login", { state: { redirect: "/checkout" } });
    }
  }, [user, navigate]);

  const checkoutState = location.state || {};
  const cart = checkoutState.cart || [];
  const discountAmount = checkoutState.discountAmount || 0;
  const couponCode = checkoutState.couponCode || null;

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
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
    if (e) e.preventDefault();
    if (processingPayment) return;

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
      if (paymentMethod === "razorpay") {
        // 1. Request Order Creation from Backend (Server-side validation)
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
          deliveryMethod,
          couponCode,
          paymentMethod: "razorpay",
        };

        const { data } = await paymentAPI.createRazorpayOrder(orderPayload);
        const { orderId, razorpayOrderId, amount, currency, keyId } = data;

        // 2. Load Razorpay Checkout SDK
        const isScriptLoaded = await loadRazorpayScript();

        // Check if official Razorpay client can be opened
        if (isScriptLoaded && window.Razorpay && keyId && !keyId.includes("placeholder")) {
          toast("Opening Razorpay Secure Checkout...", { icon: "🔒" });

          const options = {
            key: keyId,
            amount: amount,
            currency: currency || "INR",
            name: "Men's Hub Luxury Apparel",
            description: `Order Payment #${String(orderId).substring(0, 8).toUpperCase()}`,
            image: "/assets/mens_hub_logo.png",
            order_id: razorpayOrderId,
            handler: async function (response) {
              try {
                toast("Verifying payment security signature...", { icon: "🔐" });
                const verifyRes = await paymentAPI.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                });

                if (verifyRes.data.verified) {
                  clearCart();
                  toast.success("Payment verified! Order confirmed 🎉");
                  navigate(`/order/${orderId}`);
                } else {
                  throw new Error("Payment signature verification failed");
                }
              } catch (verifyErr) {
                console.error("Payment verification failed:", verifyErr);
                toast.error(verifyErr.response?.data?.message || "Payment verification failed");
                setProcessingPayment(false);
              }
            },
            prefill: {
              name: shippingInfo.fullName,
              email: user.email,
              contact: shippingInfo.phone,
            },
            notes: {
              orderId,
            },
            theme: {
              color: "#01579b",
            },
            modal: {
              ondismiss: function () {
                setProcessingPayment(false);
                toast("Checkout cancelled. You can complete your order when ready.", { icon: "ℹ️" });
              },
            },
          };

          const rzpInstance = new window.Razorpay(options);
          rzpInstance.on("payment.failed", function (failResponse) {
            console.error("Razorpay payment failed:", failResponse.error);
            setProcessingPayment(false);
            toast.error(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
          });
          rzpInstance.open();
        } else {
          // Test Mode Sandbox Verification Simulation when live credentials are in test mode
          toast("Authorizing test order via Sandbox...", { icon: "🧪" });
          const testPaymentId = `pay_test_${Date.now()}`;
          const testSignature = `sim_sig_${Date.now()}`;

          const verifyRes = await paymentAPI.verifyRazorpayPayment({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: testPaymentId,
            razorpay_signature: testSignature,
            orderId,
          });

          if (verifyRes.data.verified) {
            clearCart();
            toast.success("Test Payment Verified! Order confirmed 🎉");
            navigate(`/order/${orderId}`);
          } else {
            throw new Error("Sandbox payment verification failed.");
          }
        }
      } else {
        // Cash on Delivery (COD) flow
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
          paymentMethod: "cod",
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          couponCode,
          discountAmount,
          isPaid: false,
          paymentResult: {
            id: `COD-${Date.now()}`,
            status: "pending",
            update_time: new Date().toISOString(),
          },
        };

        const response = await ordersAPI.create(orderPayload);
        clearCart();
        toast.success("Order confirmed successfully with Cash on Delivery! 🎉");
        setTimeout(() => {
          navigate(`/order/${response.data._id || response.data.id}`);
        }, 1200);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to complete checkout");
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
            <label className={`payment-option ${paymentMethod === "razorpay" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                  <ShieldCheck size={18} color="#01579b" /> Razorpay Secure Checkout
                  <span style={{ fontSize: "0.75rem", background: "#e0f2fe", color: "#0284c7", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                    RECOMMENDED
                  </span>
                </span>
                <span style={{ fontSize: "0.82rem", color: "#64748b", marginLeft: "26px" }}>
                  UPI (GPay, PhonePe, Paytm), Credit / Debit Cards, NetBanking, & Wallets
                </span>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                  <Truck size={18} /> Cash on Delivery (COD)
                </span>
                <span style={{ fontSize: "0.82rem", color: "#64748b", marginLeft: "26px" }}>
                  Pay in cash or UPI directly at your doorstep upon delivery
                </span>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              form="checkout-form"
              className="pay-button cod-btn"
              disabled={processingPayment}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: processingPayment ? 0.75 : 1,
                cursor: processingPayment ? "not-allowed" : "pointer",
              }}
            >
              {processingPayment ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing Payment...
                </>
              ) : paymentMethod === "razorpay" ? (
                `Pay with Razorpay • ₹${totalPrice.toLocaleString("en-IN")}`
              ) : (
                `Place COD Order • ₹${totalPrice.toLocaleString("en-IN")}`
              )}
            </button>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#6b7280", marginTop: "0.75rem", justifyContent: "center" }}>
              <ShieldCheck size={16} color="#10b981" /> 256-bit SSL encrypted & Razorpay server-verified checkout
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
