import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { couponsAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Trash2, Tag, CheckCircle, Truck, X } from "lucide-react";
import "./Bag.css";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 60;

const Bag = () => {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Free shipping calculation
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Discount calculation
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxPrice = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxPrice);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await couponsAPI.validate(couponCode.trim(), subtotal);
      if (data.valid) {
        setAppliedCoupon(data);
        toast.success(data.message || `Coupon ${data.code} applied!`);
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast("Coupon removed", { icon: "ℹ️" });
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed to checkout");
      navigate("/Login", { state: { redirect: "/checkout" } });
      return;
    }
    if (cart.length === 0) return;
    navigate("/checkout", {
      state: {
        cart,
        subtotal,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        shippingFee,
        taxPrice,
        grandTotal,
      },
    });
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    toast.success("Removed from bag");
  };

  return (
    <div className="bag-page">
      <div className="bag-header">
        <h1 className="bag-title">SHOPPING BAG</h1>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="free-shipping-meter">
        <div className="meter-label">
          <Truck size={18} />
          {isFreeShipping ? (
            <span>You've unlocked <strong>FREE Express Delivery</strong>! 🎉</span>
          ) : (
            <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString("en-IN")}</strong> more to get FREE Delivery!</span>
          )}
        </div>
        <div className="meter-bar">
          <div className="meter-fill" style={{ width: `${progressToFreeShipping}%` }}></div>
        </div>
      </div>

      {!user ? (
        <div className="bag-empty-grid">
          <div className="empty-message glass-card" style={{ maxWidth: "520px", margin: "2rem auto", padding: "3rem 2rem" }}>
            <h3>PLEASE SIGN IN TO VIEW YOUR BAG</h3>
            <p>You must be signed in to manage your shopping bag and place orders.</p>
            <button className="btn-explore btn-shimmer" onClick={() => navigate("/Login")}>
              SIGN IN NOW
            </button>
          </div>
        </div>
      ) : cart.length === 0 ? (
        <div className="bag-empty-grid">
          <div className="empty-message">
            <h3>YOUR SHOPPING BAG IS EMPTY.</h3>
            <p>Explore our premium shirts, trousers, and streetwear collection.</p>
            <button className="btn-explore" onClick={() => navigate("/Category")}>
              EXPLORE CATALOG
            </button>
          </div>
        </div>
      ) : (
        <div className="active-cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-section">
            <ul className="cart-items-list">
              {cart.map((item) => (
                <li key={item.itemKey} className="cart-item">
                  <div className="item-image-col">
                    <img src={item.image} alt={item.name} className="cart-image" />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <div className="item-meta">Size: <strong>{item.size || "M"}</strong></div>
                    {item.selectedColor && (
                      <div className="item-meta">Color: <strong>{item.selectedColor}</strong></div>
                    )}
                    <div className="item-meta">Price: ₹{Number(item.price).toLocaleString("en-IN")}</div>

                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-price-col">
                    <button className="remove-link" onClick={() => handleRemove(item.itemKey)}>
                      <Trash2 size={16} style={{ marginRight: "4px" }} />
                      Remove
                    </button>
                    <div className="item-subtotal">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary & Coupon Sidebar */}
          <div className="bag-sidebar">
            {/* Coupon Code Section */}
            <div className="coupon-card">
              <h4><Tag size={16} /> Have a Promo Code?</h4>
              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <div className="coupon-details">
                    <CheckCircle size={16} color="#10b981" />
                    <span><strong>{appliedCoupon.code}</strong> (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button type="button" className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, SUPER20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="submit" disabled={validatingCoupon}>
                    {validatingCoupon ? "..." : "APPLY"}
                  </button>
                </form>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="summary-section">
              <div className="summary-row">
                <span>Order Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-green">FREE</strong> : `₹${shippingFee}`}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Taxes (GST)</span>
                <span>₹{taxPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-row total-row">
                <span>ESTIMATED TOTAL</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button className="checkout-btn-black" onClick={handleCheckout}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bag;
