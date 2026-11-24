import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { WishlistContext } from "../../../Context/WishlistContext";
import { CartContext } from "../../../Context/CartContext";
import { AuthContext } from "../../../Context/AuthContext";
import { ShoppingBag, Trash2, ArrowRight, Eye } from "lucide-react";
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
    toast.success(`Moved ${item.name} (Size: ${size}) to Bag! 🛍️`);
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
        <div className="container text-center" style={{ maxWidth: "540px", margin: "0 auto", padding: "120px 20px 80px" }}>
          <div className="glass-panel" style={{ padding: "3rem 2rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1rem" }}>PLEASE SIGN IN</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Sign in to view and manage your saved wishlist items across all your devices.
            </p>
            <button
              onClick={() => navigate("/Login")}
              className="btn-glass-primary btn-shimmer"
              style={{ padding: "14px 32px", fontSize: "1rem" }}
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
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 20px 60px" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "20px"
        }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#111", margin: "0 0 4px 0" }}>
              My Wishlist
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>

          {wishlist.length > 0 && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleMoveAllToCart}
                style={{
                  background: "#01579b",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.2s"
                }}
              >
                <ShoppingBag size={16} /> Move All to Bag
              </button>
              <button
                onClick={() => {
                  clearWishlist();
                  toast("Wishlist cleared", { icon: "🗑️" });
                }}
                style={{
                  background: "#f0f0f0",
                  color: "#555",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "80px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f0f0f0"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>❤️</div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", color: "#222", marginBottom: "8px" }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: "#666", maxWidth: "400px", margin: "0 auto 28px", fontSize: "0.95rem" }}>
              Explore our fresh menswear collection and save items you love to shop anytime.
            </p>
            <Link
              to="/Category"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                background: "#01579b",
                color: "#fff",
                borderRadius: "30px",
                fontWeight: "700",
                textDecoration: "none",
                fontSize: "1rem",
                boxShadow: "0 6px 20px rgba(1, 87, 155, 0.25)"
              }}
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {wishlist.map((item) => {
              const stock = Number(item.stock ?? item.countInStock ?? 20);
              const isOutOfStock = stock <= 0;
              const currentSize = selectedSizes[item.id] || "M";
              const price = Number(item.price || 0);

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative"
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeFromWishlist(item.id);
                      toast.error(`${item.name} removed from Wishlist`);
                    }}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      zIndex: 3,
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} color="#e53935" />
                  </button>

                  {/* Image */}
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      background: "#f8f9fa",
                      cursor: "pointer",
                      overflow: "hidden"
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    {isOutOfStock && (
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "0.95rem"
                      }}>
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "#01579b", fontWeight: "600", textTransform: "uppercase" }}>
                      {item.category || "Apparel"}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        color: "#222",
                        margin: "4px 0 8px 0",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {item.name}
                    </h3>

                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111", marginBottom: "14px" }}>
                      ₹{price.toLocaleString("en-IN")}
                    </div>

                    {/* Size Selector */}
                    <div style={{ marginBottom: "14px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#666", display: "block", marginBottom: "6px" }}>
                        Select Size:
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSizeChange(item.id, sz)}
                            style={{
                              flex: 1,
                              padding: "5px 0",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              borderRadius: "6px",
                              border: currentSize === sz ? "1.5px solid #01579b" : "1px solid #dcdfe4",
                              background: currentSize === sz ? "#e1f5fe" : "#fff",
                              color: currentSize === sz ? "#01579b" : "#444",
                              cursor: "pointer"
                            }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={isOutOfStock}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: isOutOfStock ? "#ccc" : "#01579b",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        <ShoppingBag size={15} />
                        {isOutOfStock ? "Unavailable" : "Move to Bag"}
                      </button>

                      <button
                        onClick={() => navigate(`/product/${item.id}`)}
                        style={{
                          padding: "10px",
                          background: "#f0f4f8",
                          color: "#333",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
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
