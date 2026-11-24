import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Zap,
  RefreshCw,
  ShoppingBag,
  Tag,
  ArrowRight,
  Lock,
  PackageCheck,
  RotateCcw,
  BadgePercent,
  Check,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "../../../Context/AuthContext";
import { CartContext } from "../../../Context/CartContext";
import { ordersAPI, paymentAPI, couponsAPI } from "../../../services/api";
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
  const { cart: contextCart, clearCart } = useContext(CartContext);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to proceed with checkout");
      navigate("/Login", { state: { redirect: "/checkout" } });
    }
  }, [user, navigate]);

  const checkoutState = location.state || {};
  // Graceful fallback to contextCart if direct navigation or refresh occurs
  const cart = (checkoutState.cart && checkoutState.cart.length > 0)
    ? checkoutState.cart
    : (contextCart || []);

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Coupon state
  const [inputCoupon, setInputCoupon] = useState("");
  const [couponCode, setCouponCode] = useState(checkoutState.couponCode || null);
  const [discountAmount, setDiscountAmount] = useState(checkoutState.discountAmount || 0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: user?.address?.street || user?.address?.address || "",
    city: user?.address?.city || "",
    postalCode: user?.address?.postalCode || user?.address?.zip || "",
    country: "India",
  });

  // Calculate item subtotal
  const itemsPrice = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const shippingPrice = deliveryMethod === "express" ? 150 : itemsPrice >= 999 ? 0 : 60;
  const taxableAmount = Math.max(0, itemsPrice - discountAmount);
  const taxPrice = Math.round(taxableAmount * 0.05); // 5% GST
  const totalPrice = Math.max(0, taxableAmount + shippingPrice + taxPrice);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await couponsAPI.validate(inputCoupon.trim().toUpperCase(), itemsPrice);
      if (res.data.valid) {
        setCouponCode(res.data.coupon.code);
        setDiscountAmount(res.data.discount);
        toast.success(`Coupon ${res.data.coupon.code} applied! Saved ₹${res.data.discount} 🎉`);
        setInputCoupon("");
      } else {
        toast.error(res.data.message || "Invalid coupon code");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to validate coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
    toast("Coupon removed", { icon: "ℹ️" });
  };

  const handleOrderSubmission = async (e) => {
    if (e) e.preventDefault();
    if (processingPayment) return;

    if (!user) {
      toast.error("Please login to complete your order");
      navigate("/Login");
      return;
    }

    if (
      !shippingInfo.fullName ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.postalCode ||
      !shippingInfo.phone
    ) {
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

  // Glassmorphic Empty Cart View
  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-empty-container">
        <div className="checkout-empty-card">
          <div className="empty-icon-circle">
            <ShoppingBag size={48} color="#01579b" />
          </div>
          <span className="empty-eyebrow">YOUR SHOPPING BAG</span>
          <h2>Your Cart is Empty</h2>
          <p>
            It looks like you haven't added any luxury menswear essentials to your bag yet.
            Explore our curated collections and discover the latest trending styles.
          </p>
          <div className="empty-actions">
            <button className="btn-explore-shop" onClick={() => navigate("/Category")}>
              Explore Collections <ArrowRight size={18} />
            </button>
            <button className="btn-view-wishlist" onClick={() => navigate("/Wishlist")}>
              View Saved Wishlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Checkout Progress Stepper */}
      <div className="checkout-stepper-wrap">
        <div className="checkout-step completed">
          <div className="step-badge">
            <Check size={14} />
          </div>
          <span className="step-text">Shopping Bag</span>
        </div>
        <div className="stepper-line active"></div>
        <div className="checkout-step active">
          <div className="step-badge">2</div>
          <span className="step-text">Shipping & Delivery</span>
        </div>
        <div className="stepper-line"></div>
        <div className="checkout-step">
          <div className="step-badge">3</div>
          <span className="step-text">Payment & Confirmation</span>
        </div>
      </div>

      <div className="checkout-container">
        {/* Left Section: Details & Methods */}
        <div className="checkout-left">
          {/* Section 1: Shipping Address */}
          <div className="checkout-section-box">
            <div className="section-title-wrap">
              <span className="section-number-pill">1</span>
              <div>
                <h2>Shipping & Delivery Address</h2>
                <p className="section-subtext">Where should we deliver your order?</p>
              </div>
            </div>

            <form id="checkout-form" onSubmit={handleOrderSubmission} className="shipping-form">
              <div className="form-field full-width">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-field">
                <label>PIN / Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="e.g. 560001"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-field full-width">
                <label>Street Address, Apartment, Suite *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Flat No, Building, Street Name, Area"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingInfo.country}
                  readOnly
                  className="read-only-field"
                />
              </div>
            </form>
          </div>

          {/* Section 2: Delivery Speed */}
          <div className="checkout-section-box mt-4">
            <div className="section-title-wrap">
              <span className="section-number-pill">2</span>
              <div>
                <h2>Select Delivery Speed</h2>
                <p className="section-subtext">Choose your preferred shipping tier</p>
              </div>
            </div>

            <div className="delivery-speed-options">
              <label className={`speed-option-card ${deliveryMethod === "standard" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="standard"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                />
                <div className="speed-icon-box">
                  <Truck size={22} color="#01579b" />
                </div>
                <div className="speed-info">
                  <div className="speed-header">
                    <h4>Standard Delivery</h4>
                    <span className="speed-price">
                      {itemsPrice >= 999 ? <span className="free-tag">FREE</span> : "₹60"}
                    </span>
                  </div>
                  <p className="speed-desc">Estimated delivery in 3 to 5 business days</p>
                </div>
              </label>

              <label className={`speed-option-card ${deliveryMethod === "express" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="express"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                />
                <div className="speed-icon-box express">
                  <Zap size={22} color="#f59e0b" />
                </div>
                <div className="speed-info">
                  <div className="speed-header">
                    <h4 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      Express Priority Delivery
                      <span className="fast-tag">FAST</span>
                    </h4>
                    <span className="speed-price">₹150</span>
                  </div>
                  <p className="speed-desc">Next-day dispatch, delivered in 1 to 2 business days</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="checkout-section-box mt-4">
            <div className="section-title-wrap">
              <span className="section-number-pill">3</span>
              <div>
                <h2>Payment Method</h2>
                <p className="section-subtext">All transactions are 256-bit SSL encrypted</p>
              </div>
            </div>

            <div className="payment-options-grid">
              <label className={`payment-method-card ${paymentMethod === "razorpay" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                <div className="payment-card-body">
                  <div className="payment-title-row">
                    <span className="payment-name">
                      <ShieldCheck size={20} color="#01579b" />
                      Razorpay Secure Payment Gateway
                    </span>
                    <span className="badge-recommended">RECOMMENDED</span>
                  </div>
                  <p className="payment-subdesc">
                    Instant UPI (GooglePay, PhonePe, Paytm, QR), Credit & Debit Cards, Net Banking, and Wallets
                  </p>
                  <div className="payment-supported-icons">
                    <span className="support-pill">UPI</span>
                    <span className="support-pill">Visa / Mastercard</span>
                    <span className="support-pill">RuPay</span>
                    <span className="support-pill">Net Banking</span>
                  </div>
                </div>
              </label>

              <label className={`payment-method-card ${paymentMethod === "cod" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-card-body">
                  <div className="payment-title-row">
                    <span className="payment-name">
                      <Truck size={20} color="#475569" />
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="payment-subdesc">
                    Pay via cash or UPI directly to our delivery courier at your doorstep upon receiving your package
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Section: Order Summary & Review */}
        <div className="checkout-right">
          <div className="order-summary-box">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <span className="summary-item-badge">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Product items mini list */}
            <div className="order-items-preview">
              {cart.map((item) => (
                <div key={item.itemKey || item.id || item._id} className="checkout-product-row">
                  <div className="thumb-wrapper">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    <span className="qty-tag">{item.quantity}</span>
                  </div>
                  <div className="product-info-col">
                    <h5 title={item.name}>{item.name}</h5>
                    <div className="item-meta">
                      <span>Size: {item.size || "M"}</span>
                      {item.selectedColor && (
                        <span> • Color: {item.selectedColor}</span>
                      )}
                    </div>
                  </div>
                  <div className="product-price-col">
                    <span>₹{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Box */}
            <div className="checkout-coupon-wrap">
              {couponCode ? (
                <div className="applied-coupon-pill">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Tag size={16} color="#16a34a" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} className="btn-remove-coupon">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. SUPER20)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                  />
                  <button type="submit" disabled={applyingCoupon || !inputCoupon.trim()}>
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="pricing-breakdown">
              <div className="pricing-row">
                <span>Items Subtotal</span>
                <span>₹{itemsPrice.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="pricing-row discount-row">
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <BadgePercent size={16} /> Discount ({couponCode})
                  </span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="pricing-row">
                <span>Shipping ({deliveryMethod === "express" ? "Express Priority" : "Standard"})</span>
                <span>
                  {shippingPrice === 0 ? (
                    <strong className="free-text">FREE</strong>
                  ) : (
                    `₹${shippingPrice}`
                  )}
                </span>
              </div>

              <div className="pricing-row">
                <span>Estimated Tax (5% GST)</span>
                <span>₹{taxPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="pricing-total-row">
                <span>Total Amount</span>
                <span className="total-amount-glow">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-action-wrap">
              <button
                type="submit"
                form="checkout-form"
                className="btn-place-order"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <>
                    <Lock size={18} />
                    <span>Pay with Razorpay • ₹{totalPrice.toLocaleString("en-IN")}</span>
                  </>
                ) : (
                  <>
                    <PackageCheck size={18} />
                    <span>Place Order (COD) • ₹{totalPrice.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>

              <div className="security-notice">
                <ShieldCheck size={16} color="#10b981" />
                <span>256-bit Encrypted Checkout • Verified Server Signature</span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="checkout-trust-grid">
              <div className="trust-item">
                <ShieldCheck size={18} color="#01579b" />
                <span>100% Genuine Apparel</span>
              </div>
              <div className="trust-item">
                <RotateCcw size={18} color="#01579b" />
                <span>7-Day Easy Returns</span>
              </div>
              <div className="trust-item">
                <Truck size={18} color="#01579b" />
                <span>Contactless Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
