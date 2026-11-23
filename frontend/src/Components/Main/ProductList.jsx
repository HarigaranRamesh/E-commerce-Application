import React, { useContext, useState, useEffect } from "react";
import "./Products.css";
import { Heart, Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../../Context/WishlistContext";
import { productsAPI } from "../../services/api";
import staticProducts from "../../assets/data/products";
import { toast } from "react-hot-toast";

const ProductList = ({ category, featured, sort, limit, minRating }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category && category !== "All" && category !== "Mens") params.category = category;
        if (featured) params.featured = true;
        if (sort) params.sort = sort;
        if (limit) params.limit = limit;
        if (minRating) params.minRating = minRating;

        const res = await productsAPI.getAll(params);
        const dataList = res.data?.products || (Array.isArray(res.data) ? res.data : []);

        if (isMounted) {
          if (dataList && dataList.length > 0) {
            setProducts(limit ? dataList.slice(0, limit) : dataList);
          } else {
            // Apply fallback filtering from static data
            let fallbackList = [...staticProducts];
            if (category && category !== "All" && category !== "Mens") {
              fallbackList = fallbackList.filter(
                (p) => p.category?.toLowerCase() === category.toLowerCase()
              );
            }
            if (minRating) {
              fallbackList = fallbackList.filter((p) => (p.rating || 4.5) >= minRating);
            }
            if (limit) {
              fallbackList = fallbackList.slice(0, limit);
            }
            setProducts(fallbackList);
          }
        }
      } catch (err) {
        if (isMounted) {
          let fallbackList = [...staticProducts];
          if (category && category !== "All" && category !== "Mens") {
            fallbackList = fallbackList.filter(
              (p) => p.category?.toLowerCase() === category.toLowerCase()
            );
          }
          if (limit) {
            fallbackList = fallbackList.slice(0, limit);
          }
          setProducts(fallbackList);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, featured, sort, limit, minRating]);

  const isWishlisted = (productId) => {
    return wishlist.some((item) => String(item.id) === String(productId));
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

  if (loading) {
    return (
      <div className="product-container">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="product-card skeleton-card">
            <div className="product-image-wrapper skeleton-box" style={{ height: "300px" }}></div>
            <div className="skeleton-line" style={{ width: "80%", height: "18px", marginTop: "10px" }}></div>
            <div className="skeleton-line" style={{ width: "40%", height: "16px", marginTop: "8px" }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="product-container">
      {products.map((product) => {
        const prodId = product.id || product._id;
        const price = Number(product.price) || 0;
        const originalPrice = product.original_price ? Number(product.original_price) : Math.round(price * 1.25);
        const stockCount = Number(product.stock ?? product.countInStock ?? 25);
        const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);

        return (
          <div
            key={prodId}
            className="product-card"
            onClick={() => navigate(`/product/${prodId}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="product-image-wrapper">
              {/* Discount Tag */}
              {discountPct > 0 && (
                <span className="badge-discount">-{discountPct}%</span>
              )}

              {/* Stock Warning */}
              {stockCount <= 0 ? (
                <span className="badge-stock out">Out of Stock</span>
              ) : stockCount <= 5 ? (
                <span className="badge-stock low">Only {stockCount} left</span>
              ) : null}

              {/* Wishlist Button */}
              <button
                type="button"
                className="wishlist-btn-icon"
                onClick={(e) => toggleWishlist({ ...product, id: prodId }, e)}
                title={isWishlisted(prodId) ? "Remove from wishlist" : "Add to wishlist"}
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  fill={isWishlisted(prodId) ? "#e53935" : "none"}
                  color={isWishlisted(prodId) ? "#e53935" : "#555"}
                />
              </button>

              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />

              <div className="product-hover-overlay">
                <span className="quick-view-text">
                  <Eye size={16} /> Quick View
                </span>
              </div>
            </div>

            <div className="product-details">
              <span className="product-category-tag">{product.category || "Apparel"}</span>
              <h3 className="product-title" title={product.name}>{product.name}</h3>

              {/* Rating */}
              <div className="product-rating-row">
                <div className="star-rating">
                  <Star size={13} fill="#ffb400" color="#ffb400" />
                  <span className="rating-score">{Number(product.rating || 4.5).toFixed(1)}</span>
                </div>
                <span className="reviews-count">({product.num_reviews || product.reviews_count || 18})</span>
              </div>

              {/* Price row */}
              <div className="product-price-row">
                <span className="product-price">₹{price.toLocaleString("en-IN")}</span>
                {originalPrice > price && (
                  <span className="product-original-price">₹{originalPrice.toLocaleString("en-IN")}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
