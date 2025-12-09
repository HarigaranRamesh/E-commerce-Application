import React, { useContext } from "react";
import { toast } from "react-hot-toast";
import { WishlistContext } from "../../../Context/WishlistContext";

import { ShoppingCart, Trash2 } from "lucide-react";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);


  return (
    <div className="wishlist-container">
      {wishlist.length === 0 ? (
        <div className="empty-wishlist-state" style={{ textAlign: "center", padding: "60px 20px", gridColumn: "1/-1" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>💔</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Your wishlist is empty</h3>
          <p style={{ marginBottom: "30px", color: "var(--text-secondary)" }}>Save items you love to buy later.</p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "12px 30px",
              background: "var(--accent-primary)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(1, 87, 155, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        wishlist.map((item) => (
          <div key={item.id} className="wishlist-card">
            <img src={item.image} alt={item.name} className="wishlist-image" />
            <h3>{item.name}</h3>
            <p>₹{item.price.toLocaleString("en-IN")}</p>
            <button
              className="wishlist-btn"
              onClick={() => {
                // Redirect to product detail because Size selection is required now
                window.location.href = `/product/${item.id}`;
              }}
            >
              <ShoppingCart size={16} /> View Details
            </button>
            <button
              className="wishlist-btn remove"
              onClick={() => {
                removeFromWishlist(item.id);
                toast.error(`${item.name} removed from Wishlist ❌`);
              }}
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Wishlist;
