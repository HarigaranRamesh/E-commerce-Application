import React, { useContext } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Main/Products.css";
import { CartContext } from "../../../Context/CartContext";
import { WishlistContext } from "../../../Context/WishlistContext";
import { toast } from "react-hot-toast";
import products from "../../../assets/data/products"; // Import centralized data

const CategoryDetail = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // Filter products from centralized array
  const categoryProducts = products.filter(p => {
    if (categoryName === "Mens") return true; // Show all for Mens
    return p.category.toLowerCase() === categoryName.toLowerCase();
  });


  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product, e) => {
    e.stopPropagation();
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      toast("Removed from Wishlist", { icon: "❌" });
    } else {
      addToWishlist(product);
      toast.success("Added to Wishlist ❤️");
    }
  };



  return (
    <div className="category-detail-page">
      <div className="product-container">
        {categoryProducts.length > 0 ? (
          categoryProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
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
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%", padding: "2em" }}>No products found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
