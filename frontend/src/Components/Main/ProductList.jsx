import React, { useContext, useState, useEffect } from "react";
import "./Products.css";
import { Heart, Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../../Context/WishlistContext";
import { AuthContext } from "../../Context/AuthContext";
import { productsAPI } from "../../services/api";
import staticProducts from "../../assets/data/products";
import { toast } from "react-hot-toast";

const deduplicateProducts = (items) => {
  const seen = new Set();
  return (items || []).filter((p) => {
    const id = String(p.id || p._id);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

// Global in-memory cache to prevent layout shift and shimmer flicker on repeat views
const productCache = new Map();

const ProductList = ({ category, featured, sort, limit, minRating, excludeIds = [] }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Stabilize excludeIds to avoid new reference on every render
  const excludeIdsKey = Array.isArray(excludeIds) ? excludeIds.join(",") : "";
  const cacheKey = `${category || ""}|${featured ? "1" : "0"}|${sort || ""}|${limit || ""}|${minRating || ""}|${excludeIdsKey}`;

  const cachedProducts = productCache.get(cacheKey);
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      // Only show skeleton loading state if we do not already have cached items
      if (!productCache.has(cacheKey)) {
        setLoading(true);
      }
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
          let list = deduplicateProducts(dataList);

          // If backend had no matching items, use static fallback
          if (!list || list.length === 0) {
            let fallbackList = [...staticProducts];
            if (category && category !== "All" && category !== "Mens") {
              fallbackList = fallbackList.filter(
                (p) => p.category?.toLowerCase() === category.toLowerCase()
              );
            }
            if (featured) {
              const featuredItems = fallbackList.filter((p) => p.featured === true);
              if (featuredItems.length > 0) fallbackList = featuredItems;
            }
            if (minRating) {
              fallbackList = fallbackList.filter((p) => (p.rating || 4.5) >= minRating);
            }
            if (sort === "newest") {
              fallbackList = [...fallbackList].sort((a, b) => (b.id || 0) - (a.id || 0));
            } else if (sort === "views") {
              fallbackList = [...fallbackList].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
            } else if (sort === "rating") {
              fallbackList = [...fallbackList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }
            list = deduplicateProducts(fallbackList);
          }

          // Filter out excluded IDs to prevent duplicate products across sections
          if (excludeIds && excludeIds.length > 0) {
            const excludeSet = new Set(excludeIds.map(String));
            list = list.filter((p) => !excludeSet.has(String(p.id || p._id)));
          }

          if (limit) {
            list = list.slice(0, limit);
          }

          productCache.set(cacheKey, list);
          setProducts(list);
        }
      } catch {
        if (isMounted) {
          let fallbackList = [...staticProducts];
          if (category && category !== "All" && category !== "Mens") {
            fallbackList = fallbackList.filter(
              (p) => p.category?.toLowerCase() === category.toLowerCase()
            );
          }
          if (featured) {
            const featuredItems = fallbackList.filter((p) => p.featured === true);
            if (featuredItems.length > 0) fallbackList = featuredItems;
          }
          if (minRating) {
            fallbackList = fallbackList.filter((p) => (p.rating || 4.5) >= minRating);
          }
          if (sort === "newest") {
            fallbackList = [...fallbackList].sort((a, b) => (b.id || 0) - (a.id || 0));
          } else if (sort === "views") {
            fallbackList = [...fallbackList].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          }

          let list = deduplicateProducts(fallbackList);

          if (excludeIds && excludeIds.length > 0) {
            const excludeSet = new Set(excludeIds.map(String));
            list = list.filter((p) => !excludeSet.has(String(p.id || p._id)));
          }

          if (limit) {
            list = list.slice(0, limit);
          }
          productCache.set(cacheKey, list);
          setProducts(list);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, featured, sort, limit, minRating, excludeIdsKey, cacheKey]);

  const isWishlisted = (productId) => {
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const toggleWishlist = (product, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to manage your wishlist");
      navigate("/Login");
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

  if (loading) {
    const skeletonCount = limit ? Math.min(limit, 8) : 4;
    return (
      <div className="product-container">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={idx} className="product-card skeleton-card">
            <div className="product-image-wrapper skeleton-box" style={{ height: "280px" }}></div>
            <div style={{ padding: "14px 10px" }}>
              <div className="skeleton-line" style={{ width: "30%", height: "12px", marginBottom: "8px" }}></div>
              <div className="skeleton-line" style={{ width: "85%", height: "16px", marginBottom: "10px" }}></div>
              <div className="skeleton-line" style={{ width: "45%", height: "18px" }}></div>
            </div>
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

export default React.memo(ProductList);
