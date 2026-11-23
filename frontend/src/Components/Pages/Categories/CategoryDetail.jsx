import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ChevronRight, SlidersHorizontal, Star, Eye } from "lucide-react";
import "../../Main/Products.css";
import { WishlistContext } from "../../../Context/WishlistContext";
import { productsAPI } from "../../../services/api";
import staticProducts from "../../../assets/data/products";
import { toast } from "react-hot-toast";

const CategoryDetail = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Normalize category name for display
  const displayCategory = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace("-", " ")
    : "Collection";

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        let sortParam;
        if (sortBy === "price-low") sortParam = "price_asc";
        else if (sortBy === "price-high") sortParam = "price_desc";
        else if (sortBy === "rating") sortParam = "rating";
        else if (sortBy === "newest") sortParam = "newest";

        const params = {
          category: categoryName === "mens" ? undefined : categoryName,
          inStock: inStockOnly ? "true" : undefined,
          sort: sortParam,
        };

        const res = await productsAPI.getAll(params);
        const dataList = res.data?.products || (Array.isArray(res.data) ? res.data : []);

        if (isMounted) {
          if (dataList && dataList.length > 0) {
            setProducts(dataList);
          } else {
            // Fallback filter
            let filtered = staticProducts.filter((p) => {
              if (categoryName.toLowerCase() === "mens") return true;
              return p.category?.toLowerCase() === categoryName.toLowerCase();
            });

            if (inStockOnly) {
              filtered = filtered.filter((p) => (p.stock ?? p.countInStock ?? 10) > 0);
            }

            if (sortBy === "price-low") {
              filtered.sort((a, b) => a.price - b.price);
            } else if (sortBy === "price-high") {
              filtered.sort((a, b) => b.price - a.price);
            } else if (sortBy === "rating") {
              filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }

            setProducts(filtered);
          }
        }
      } catch (err) {
        if (isMounted) {
          let filtered = staticProducts.filter((p) => {
            if (categoryName.toLowerCase() === "mens") return true;
            return p.category?.toLowerCase() === categoryName.toLowerCase();
          });
          setProducts(filtered);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [categoryName, sortBy, inStockOnly]);

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", padding: "100px 0 60px" }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
          <Link to="/" style={{ color: "#666", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/Category" style={{ color: "#666", textDecoration: "none" }}>Categories</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#01579b", fontWeight: "600" }}>{displayCategory}</span>
        </div>

        {/* Category Header Banner */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "30px",
          border: "1px solid #eef2f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#111", margin: "0 0 6px 0" }}>
              {displayCategory} Collection
            </h1>
            <p style={{ color: "#666", margin: 0 }}>
              Showing {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#444" }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ accentColor: "#01579b" }}
              />
              In Stock Only
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SlidersHorizontal size={16} color="#666" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #dcdfe4",
                  fontSize: "0.9rem",
                  color: "#333",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="default">Sort by: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="product-container">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div className="product-image-wrapper skeleton-box" style={{ height: "300px" }}></div>
                <div className="skeleton-line" style={{ width: "80%", height: "18px", marginTop: "10px" }}></div>
                <div className="skeleton-line" style={{ width: "40%", height: "16px", marginTop: "8px" }}></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
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
                    {discountPct > 0 && (
                      <span className="badge-discount">-{discountPct}%</span>
                    )}

                    {stockCount <= 0 ? (
                      <span className="badge-stock out">Out of Stock</span>
                    ) : stockCount <= 5 ? (
                      <span className="badge-stock low">Only {stockCount} left</span>
                    ) : null}

                    <button
                      type="button"
                      className="wishlist-btn-icon"
                      onClick={(e) => toggleWishlist({ ...product, id: prodId }, e)}
                      title={isWishlisted(prodId) ? "Remove from wishlist" : "Add to wishlist"}
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
                    <span className="product-category-tag">{product.category || displayCategory}</span>
                    <h3 className="product-title" title={product.name}>{product.name}</h3>

                    <div className="product-rating-row">
                      <div className="star-rating">
                        <Star size={13} fill="#ffb400" color="#ffb400" />
                        <span className="rating-score">{Number(product.rating || 4.5).toFixed(1)}</span>
                      </div>
                      <span className="reviews-count">({product.num_reviews || product.reviews_count || 12})</span>
                    </div>

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
        ) : (
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
            border: "1px solid #eef2f6"
          }}>
            <h3 style={{ fontSize: "1.4rem", color: "#333", marginBottom: "8px" }}>
              No items found matching your filters
            </h3>
            <p style={{ color: "#666", marginBottom: "24px" }}>
              Try adjusting your sort or clearing stock filters to see more results.
            </p>
            <button
              onClick={() => {
                setSortBy("default");
                setInStockOnly(false);
              }}
              style={{
                background: "#01579b",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "30px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
