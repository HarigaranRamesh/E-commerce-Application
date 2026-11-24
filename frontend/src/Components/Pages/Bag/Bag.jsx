import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { WishlistContext } from "../../../Context/WishlistContext";
import { couponsAPI } from "../../../services/api";
import { toast } from "react-hot-toast";
import {
  Trash2,
  Tag,
  CheckCircle,
  Truck,
  X,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Heart,
  Plus,
  Minus,
  Check,
  Lock,
} from "lucide-react";
import "./Bag.css";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 60;

const Bag = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addToWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  // Free shipping calculation
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Discount calculation
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxPrice = Math.round(taxableAmount * 0.05); // 5% GST
  const grandTotal = Math.max(0, taxableAmount + shippingFee + taxPrice);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await couponsAPI.validate(code, subtotal);
      if (data.valid) {
        setAppliedCoupon(data);
        toast.success(`Coupon ${data.coupon?.code || code} applied! Saved ₹${data.discount} 🎉`);
        setCouponCode("");
      } else {
        toast.error(data.message || "Invalid coupon code");
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

  const handleMoveToWishlist = async (item) => {
    const success = await addToWishlist(item);
    if (success) {
      removeFromCart(item.itemKey);
      toast.success(`Moved ${item.name} to Wishlist ❤️`);
    }
  };

  const handleRemove = (itemKey) => {
    removeFromCart(itemKey);
    toast.success("Item removed from bag");
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
        couponCode: appliedCoupon?.coupon?.code || appliedCoupon?.code || null,
        shippingFee,
        taxPrice,
        grandTotal,
      },
    });
  };

  // State: Not Logged In
  if (!user) {
    return (
      <div className="bag-page">
        <div className="bag-auth-prompt-card">
          <div className="bag-empty-icon-circle">
            <Lock size={44} color="#01579b" />
          </div>
          <span className="bag-empty-eyebrow">AUTHENTICATION REQUIRED</span>
          <h2>Sign In to View Your Bag</h2>
          <p>
            Your personal shopping bag is securely saved to your account. Sign in now to view
            saved items, apply special discount coupons, and complete your order.
          </p>
          <div className="bag-empty-actions">
            <button
              className="btn-bag-primary"
              onClick={() => navigate("/Login", { state: { redirect: "/bag" } })}
            >
              Sign In to Your Account <ArrowRight size={18} />
            </button>
            <button className="btn-bag-secondary" onClick={() => navigate("/Category")}>
              Explore Menswear Collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State: Empty Bag
  if (cart.length === 0) {
    return (
      <div className="bag-page">
        <div className="bag-stepper-wrap">
          <div className="bag-step active">
            <div className="bag-step-badge">1</div>
            <span className="bag-step-text">Shopping Bag</span>
          </div>
          <div className="bag-stepper-line"></div>
          <div className="bag-step">
            <div className="bag-step-badge">2</div>
            <span className="bag-step-text">Shipping & Delivery</span>
          </div>
          <div className="bag-stepper-line"></div>
          <div className="bag-step">
            <div className="bag-step-badge">3</div>
            <span className="bag-step-text">Payment</span>
          </div>
        </div>

        <div className="bag-empty-card">
          <div className="bag-empty-icon-circle">
            <ShoppingBag size={48} color="#01579b" />
          </div>
          <span className="bag-empty-eyebrow">YOUR SHOPPING BAG</span>
          <h2>Your Bag is Currently Empty</h2>
          <p>
            Explore our curated selection of luxury menswear, shirts, chinos, and streetwear to
            elevate your wardrobe today.
          </p>
          <div className="bag-empty-actions">
            <button className="btn-bag-primary" onClick={() => navigate("/Category")}>
              Explore Collections <ArrowRight size={18} />
            </button>
            <button className="btn-bag-secondary" onClick={() => navigate("/Wishlist")}>
              View Saved Wishlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="bag-page">
      {/* Stepper Progress Bar */}
      <div className="bag-stepper-wrap">
        <div className="bag-step active">
          <div className="bag-step-badge">1</div>
          <span className="bag-step-text">Shopping Bag ({totalItemsCount})</span>
        </div>
        <div className="bag-stepper-line"></div>
        <div className="bag-step">
          <div className="bag-step-badge">2</div>
          <span className="bag-step-text">Shipping & Delivery</span>
        </div>
        <div className="bag-stepper-line"></div>
        <div className="bag-step">
          <div className="bag-step-badge">3</div>
          <span className="bag-step-text">Payment</span>
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="free-shipping-card">
        <div className="meter-label">
          <div className="meter-icon-box">
            <Truck size={20} color="#01579b" />
          </div>
          <div className="meter-text-wrap">
            {isFreeShipping ? (
              <span>
                🎉 Congratulations! You have unlocked <strong>FREE Express Delivery</strong>!
              </span>
            ) : (
              <span>
                Add <strong>₹{amountNeededForFreeShipping.toLocaleString("en-IN")}</strong> more to unlock{" "}
                <strong>FREE Express Delivery</strong> (Threshold: ₹999)
              </span>
            )}
          </div>
        </div>
        <div className="meter-bar">
          <div
            className="meter-fill"
            style={{ width: `${progressToFreeShipping}%` }}
          ></div>
        </div>
      </div>

      {/* Main Bag Grid */}
      <div className="bag-grid">
        {/* Left Column: Cart Items List */}
        <div className="bag-items-column">
          <div className="bag-items-header">
            <div>
              <h2>Shopping Bag</h2>
              <p className="bag-subtitle">Review your items, adjust quantities, or save to wishlist</p>
            </div>
            <button
              type="button"
              className="btn-clear-bag"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your shopping bag?")) {
                  clearCart();
                  toast("Shopping bag cleared", { icon: "🧹" });
                }
              }}
            >
              Clear Bag
            </button>
          </div>

          <div className="bag-items-list">
            {cart.map((item) => {
              const itemTotal = (Number(item.price) || 0) * (item.quantity || 1);
              const productId = item.id || item.product || item._id;

              return (
                <div key={item.itemKey} className="bag-item-card">
                  {/* Thumbnail */}
                  <Link to={`/product/${productId}`} className="bag-item-image-wrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="bag-item-details">
                    <div className="item-title-row">
                      <Link to={`/product/${productId}`} className="item-name-link">
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        className="btn-remove-item"
                        title="Remove from bag"
                        onClick={() => handleRemove(item.itemKey)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="item-tags-row">
                      <span className="item-badge">Size: {item.size || "M"}</span>
                      {item.selectedColor && (
                        <span className="item-badge">Color: {item.selectedColor}</span>
                      )}
                      <span className="item-stock-tag">In Stock</span>
                    </div>

                    {/* Bottom row: Quantity + Actions + Price */}
                    <div className="item-footer-row">
                      <div className="qty-and-actions">
                        {/* Stepper */}
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                            title="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Move to Wishlist */}
                        <button
                          type="button"
                          className="btn-move-wishlist"
                          onClick={() => handleMoveToWishlist(item)}
                        >
                          <Heart size={14} />
                          <span>Save to Wishlist</span>
                        </button>
                      </div>

                      <div className="item-price-block">
                        <span className="item-unit-price">
                          ₹{Number(item.price).toLocaleString("en-IN")} each
                        </span>
                        <span className="item-total-price">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping Link */}
          <div className="continue-shopping-wrap">
            <Link to="/Category" className="link-continue-shopping">
              ← Continue Shopping Menswear
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="bag-sidebar">
          <div className="bag-summary-card">
            <div className="summary-card-header">
              <h3>Order Summary</h3>
              <span className="summary-item-pill">{totalItemsCount} Items</span>
            </div>

            {/* Promo Code Box */}
            <div className="bag-coupon-section">
              <span className="coupon-label">
                <Tag size={15} /> Have a Promotional Voucher?
              </span>

              {appliedCoupon ? (
                <div className="applied-coupon-box">
                  <div className="applied-coupon-info">
                    <CheckCircle size={18} color="#10b981" />
                    <div>
                      <strong>{appliedCoupon.coupon?.code || appliedCoupon.code}</strong>
                      <span>Saved ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-applied-coupon"
                    onClick={handleRemoveCoupon}
                    title="Remove coupon"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApplyCoupon();
                    }}
                    className="bag-coupon-form"
                  >
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button type="submit" disabled={validatingCoupon || !couponCode.trim()}>
                      {validatingCoupon ? "..." : "APPLY"}
                    </button>
                  </form>

                  {/* Promo Suggestions */}
                  <div className="coupon-suggestions">
                    <span className="suggestion-text">Available Deals:</span>
                    <button
                      type="button"
                      className="suggested-coupon-chip"
                      onClick={() => handleApplyCoupon("SUPER20")}
                    >
                      SUPER20 (20% OFF)
                    </button>
                    <button
                      type="button"
                      className="suggested-coupon-chip"
                      onClick={() => handleApplyCoupon("WELCOME10")}
                    >
                      WELCOME10 (10% OFF)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bag-price-breakdown">
              <div className="price-row">
                <span>Bag Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="price-row discount">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="price-row">
                <span>Estimated Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="shipping-free-badge">FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="price-row">
                <span>Estimated GST (5%)</span>
                <span>₹{taxPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="price-total-row">
                <span>Estimated Total</span>
                <span className="grand-total-glow">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="checkout-action-wrap">
              <button className="btn-proceed-checkout" onClick={handleCheckout}>
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={18} />
              </button>

              <div className="bag-ssl-assurance">
                <ShieldCheck size={16} color="#10b981" />
                <span>256-Bit SSL Encrypted • Razorpay Certified</span>
              </div>
            </div>

            {/* Trust Grid */}
            <div className="bag-trust-grid">
              <div className="trust-pill">
                <Truck size={16} color="#01579b" />
                <span>Express Delivery</span>
              </div>
              <div className="trust-pill">
                <RotateCcw size={16} color="#01579b" />
                <span>7-Day Return Policy</span>
              </div>
              <div className="trust-pill">
                <Sparkles size={16} color="#01579b" />
                <span>100% Genuine Apparel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bag;
