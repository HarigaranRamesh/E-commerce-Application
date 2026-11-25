import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { WishlistContext } from "../../../Context/WishlistContext";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { ShoppingBag, Trash2, ArrowRight, Heart, User } from "lucide-react";
import "./Wishlist.css";

const SIZES = ["S", "M", "L", "XL"];

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Selected sizes for each item in wishlist (defaults to 'M')
  const [selectedSizes, setSelectedSizes] = useState({});
  // Size picker popup active item ID
  const [activeSizePopup, setActiveSizePopup] = useState(null);

  const handleSizeChange = (itemId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleMoveToCart = (item, chosenSize = null) => {
    const size = chosenSize || selectedSizes[item.id] || "M";
    const stock = Number(item.stock ?? item.countInStock ?? 20);

    if (stock <= 0) {
      toast.error(`${item.name} is currently out of stock`);
      return;
    }

    addToCart(item, size);
    removeFromWishlist(item.id);
    setActiveSizePopup(null);
    toast.success(`Moved to Bag (${size})! 🛍️`);
  };

  if (!user) {
    return (
      <div className="wishlist-page-wrapper">
        <div className="wishlist-container">
          <div className="wishlist-auth-card">
            <div className="auth-icon-box">
              <User size={32} />
            </div>
            <h2>PLEASE SIGN IN</h2>
            <p>
              Sign in to view and synchronize your saved wishlist items across all your devices.
            </p>
            <button
              onClick={() => navigate("/Login")}
              className="wishlist-auth-btn"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-wrapper">
      <div className="wishlist-container">
        {/* Centered Serif Title as shown in screenshot */}
        <h1 className="wishlist-main-title">My Wishlist</h1>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-card">
            <div className="empty-icon-box">
              <Heart size={34} />
            </div>
            <h2>YOUR WISHLIST IS EMPTY</h2>
            <p>
              Explore our fresh menswear collections and save your favourite items to shop anytime.
            </p>
            <Link to="/Category" className="start-shopping-btn">
              Explore Collections <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const stock = Number(item.stock ?? item.countInStock ?? 20);
              const isOutOfStock = stock <= 0;
              const price = Number(item.price || 0);
              const originalPrice = item.originalPrice
                ? Number(item.originalPrice)
                : Math.round(price * 1.5);
              const discountPercent = originalPrice > price
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;

              return (
                <div key={item.id} className="wishlist-product-card">
                  {/* Image Box */}
                  <div className="wishlist-image-container">
                    {/* Top Right: Minimalist Trash Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        removeFromWishlist(item.id);
                      }}
                      className="wishlist-trash-btn"
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>

                    {/* Product Image */}
                    <div
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="image-click-area"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`wishlist-product-img ${isOutOfStock ? "out-of-stock-img" : ""}`}
                        onError={(e) => {
                          e.target.src = "/images/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Out of Stock Centered Text */}
                    {isOutOfStock && (
                      <div className="out-of-stock-banner">
                        PRODUCT IS OUT OF STOCK
                      </div>
                    )}

                    {/* Bottom Left: Circular Ochre/Gold Shopping Bag Icon Button */}
                    {!isOutOfStock && (
                      <div className="bag-btn-relative-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeSizePopup === item.id) {
                              setActiveSizePopup(null);
                            } else {
                              setActiveSizePopup(item.id);
                            }
                          }}
                          className="wishlist-bag-circle-btn"
                          title="Add to bag"
                          aria-label="Add to bag"
                        >
                          <ShoppingBag size={15} color="#ffffff" strokeWidth={2} />
                        </button>

                        {/* Quick Size Popup when Bag Icon Clicked */}
                        {activeSizePopup === item.id && (
                          <div className="quick-size-popup">
                            <span className="quick-size-title">Select Size:</span>
                            <div className="quick-size-options">
                              {SIZES.map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleMoveToCart(item, sz)}
                                  className="quick-size-btn"
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Centered Product Information */}
                  <div className="wishlist-product-info">
                    {/* Brand Name in Gold/Ochre */}
                    <span className="wishlist-brand-text">
                      {item.brand || item.category || "Teamspirit"}
                    </span>

                    {/* Product Title in Serif Font */}
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="wishlist-serif-title"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Price & Discount Row */}
                    <div className="wishlist-price-line">
                      <span className="price-bold">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      {originalPrice > price && (
                        <>
                          <span className="price-struck">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="discount-ochre">
                            ({discountPercent}% off)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Under-price Offer Line */}
                    <div className="wishlist-offer-line">
                      <span className="offer-tag-label">Offer Price:</span>
                      <span className="offer-tag-price">₹{Math.round(price * 0.8).toLocaleString("en-IN")}</span>
                      <span className="offer-tag-code">| With SUPER20</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
