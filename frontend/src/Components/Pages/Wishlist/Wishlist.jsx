import React, { useContext } from "react";
import { toast } from "react-hot-toast";
import { WishlistContext } from "../../../Context/WishlistContext";
import { CartContext } from "../../../Context/CartContext";
import { ShoppingCart, Trash2 } from "lucide-react";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  return (
    <div className="wishlist-container">
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        wishlist.map((item) => (
          <div key={item.id} className="wishlist-card">
            <img src={item.image} alt={item.name} className="wishlist-image" />
            <h3>{item.name}</h3>
            <p>₹{item.price.toLocaleString("en-IN")}</p>
            <button
              className="wishlist-btn"
              onClick={() => {
                addToCart(item);
                toast.success(`${item.name} added to Cart 🛒`);
              }}
            >
              <ShoppingCart size={16} /> Add to Cart
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
