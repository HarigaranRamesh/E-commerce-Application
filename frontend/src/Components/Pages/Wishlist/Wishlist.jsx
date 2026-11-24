import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { WishlistContext } from "../../../Context/WishlistContext";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { ShoppingBag, X, ArrowRight, Heart, User } from "lucide-react";
import "./Wishlist.css";

const SIZES = ["S", "M", "L", "XL"];

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Selected sizes for each item in wishlist (defaults to 'M')
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeChange = (itemId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleMoveToCart = (item) => {
    const size = selectedSizes[item.id] || "M";
    const stock = Number(item.stock ?? item.countInStock ?? 20);

    if (stock <= 0) {
      toast.error(`${item.name} is currently out of stock`);
      return;
    }

    addToCart(item, size);
    removeFromWishlist(item.id);
    toast.success(`Moved ${item.name} (${size}) to Bag! 🛍️`);
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;

    let movedCount = 0;
    wishlist.forEach((item) => {
      const stock = Number(item.stock ?? item.countInStock ?? 20);
      if (stock > 0) {
        const size = selectedSizes[item.id] || "M";
        addToCart(item, size);
        movedCount++;
      }
    });

    clearWishlist();
    toast.success(`Moved ${movedCount} items to your Bag! 🛍️`);
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
        {/* Header Section */}
        <div className="wishlist-header">
          <div className="wishlist-header-title">
            <h1>
              My Wishlist <span className="wishlist-count-badge">({wishlist.length} {wishlist.length === 1 ? "Item" : "Items"})</span>
            </h1>
          </div>

          {wishlist.length > 0 && (
            <div className="wishlist-header-actions">
              <button
                onClick={handleMoveAllToCart}
                className="wishlist-header-btn move-all"
              >
                <ShoppingBag size={16} /> Move All to Bag
              </button>
              <button
                onClick={() => {
                  clearWishlist();
                  toast("Wishlist cleared", { icon: "🗑️" });
                }}
                className="wishlist-header-btn clear-all"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-card">
            <div className="empty-icon-box">
              <Heart size={34} />
            </div>
            <h2>YOUR WISHLIST IS EMPTY</h2>
            <p>
              Explore our curated collections and save your favourite items to shop anytime.
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
              const currentSize = selectedSizes[item.id] || "M";
              const price = Number(item.price || 0);
              const originalPrice = item.originalPrice
                ? Number(item.originalPrice)
                : Math.round(price * 1.5);
              const discountPercent = originalPrice > price
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;

              return (
                <div key={item.id} className="wishlist-item-card">
                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeFromWishlist(item.id);
                      toast.error(`${item.name} removed from Wishlist`);
                    }}
                    className="wishlist-close-btn"
                    title="Remove from wishlist"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>

                  {/* Product Image Box */}
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="wishlist-image-box"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="wishlist-image"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    {isOutOfStock && (
                      <div className="wishlist-oos-overlay">
                        OUT OF STOCK
                      </div>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="wishlist-info-box">
                    <span className="wishlist-brand-label">
                      {item.brand || item.category || "MENS HUB"}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="wishlist-product-title"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Price Block */}
                    <div className="wishlist-price-block">
                      <span className="wishlist-price-current">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      {originalPrice > price && (
                        <>
                          <span className="wishlist-price-mrp">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="wishlist-discount-tag">
                            ({discountPercent}% OFF)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Size Selector */}
                    <div className="wishlist-size-section">
                      <span className="wishlist-size-label">Select Size:</span>
                      <div className="wishlist-size-pills">
                        {SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSizeChange(item.id, sz)}
                            className={`size-pill ${currentSize === sz ? "active" : ""}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Move to Bag Action */}
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={isOutOfStock}
                      className={`wishlist-move-bag-btn ${isOutOfStock ? "disabled" : ""}`}
                    >
                      <ShoppingBag size={16} />
                      {isOutOfStock ? "Out of Stock" : "MOVE TO BAG"}
                    </button>
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
