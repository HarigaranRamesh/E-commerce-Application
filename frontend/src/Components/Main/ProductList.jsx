import React, { useContext } from "react";
import "./Products.css";
import { ShoppingCart, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { CartContext } from "../../Context/CartContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { AuthContext } from "../../Context/AuthContext";
import { toast } from "react-hot-toast";
import products from "../../assets/data/products"; // Import centralized data

const ProductList = () => {

  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product, e) => {
    e.stopPropagation(); // Prevent clicking card
    if (!user) {
      toast.error("⚠️ Please login first to use wishlist");
      return;
    }

    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      toast("Removed from Wishlist", { icon: "❌" });
    } else {
      addToWishlist(product);
      toast.success("Added to Wishlist ❤️");
    }
  };



  return (
    <div className="product-container">
      {products.map((product) => (
        <div
          key={product.id}
          className="product-card"
          onClick={() => navigate(`/product/${product.id}`)} // Navigate on click
          style={{ cursor: "pointer" }}
        >
          <div className="product-image-wrapper">
            <Heart
              className="wishlist-icon"
              onClick={(e) => toggleWishlist(product, e)}
              fill={isWishlisted(product.id) ? "red" : "none"}
              color={isWishlisted(product.id) ? "red" : "gray"}
              strokeWidth={1.5}
            />
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
              loading="lazy"
            />
          </div>

          <div className="product-details">
            <h3 className="product-title">{product.name}</h3>
            <p className="product-price">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {/* Removed Add to Cart button as requested */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
