import React, { useContext, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Heart, ChevronRight, ChevronLeft, SlidersHorizontal, Star, Eye } from "lucide-react";
import "../../Main/Products.css";
import { WishlistContext } from "../../../Context/WishlistContext";
import { AuthContext } from "../../../Context/AuthContext";
import { productsAPI } from "../../../services/api";
import staticProducts from "../../../assets/data/products";
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

const CategoryDetail = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const genderParam = searchParams.get("gender");
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Normalize category name for display
  const isAllCategory = !categoryName || ["all", "collection", "all-products", "all-collections"].includes(categoryName.toLowerCase());
  const displayCategory = !isAllCategory
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace("-", " ")
    : "All";

  const filterFallback = (items) => {
    const catLower = (categoryName || "").toLowerCase();
    const targetGender = genderParam ? genderParam.toLowerCase() : null;

    return items.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      const pGender = (p.gender || "men").toLowerCase();

      if (targetGender && pGender !== targetGender) {
        return false;
      }

      if (["all", "collection", "all-products", "all-collections"].includes(catLower) || !categoryName) {
        return true;
      }

      if (catLower === "men" || catLower === "mens") {
        return pGender === "men" || ["shirts", "pants", "hoodies", "t-shirts"].includes(pCat);
      }
      if (catLower === "women" || catLower === "womens") {
        return pGender === "women" || ["dresses", "tops", "ethnic", "skirts"].includes(pCat);
      }
      if (catLower === "kids" || catLower === "kid") {
        return pGender === "kids" || ["boys", "girls"].includes(pCat);
      }
      if (catLower === "pants" && targetGender === "kids") {
        return pGender === "kids" && (["boys", "girls", "kids"].includes(pCat) || (Array.isArray(p.tags) && (p.tags.includes("pants") || p.tags.includes("dungaree"))));
      }
      return pCat === catLower;
    });
  };

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
          category: categoryName,
          gender: genderParam || undefined,
          inStock: inStockOnly ? "true" : undefined,
          sort: sortParam,
        };

        const res = await productsAPI.getAll(params);
        const dataList = res.data?.products || (Array.isArray(res.data) ? res.data : []);

        if (isMounted) {
          if (dataList && dataList.length > 0) {
            setProducts(deduplicateProducts(dataList));
          } else {
            // Fallback filter
            let filtered = filterFallback(staticProducts);

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

            setProducts(deduplicateProducts(filtered));
          }
        }
      } catch {
        if (isMounted) {
          let filtered = filterFallback(staticProducts);
          setProducts(deduplicateProducts(filtered));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [categoryName, genderParam, sortBy, inStockOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryName, genderParam, sortBy, inStockOnly]);

  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

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
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", padding: "110px 0 60px" }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "16px" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Home</Link>
          <ChevronRight size={13} color="#94a3b8" />
          <Link to="/Category" style={{ color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Categories</Link>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ color: "#1e293b", fontWeight: "600" }}>{displayCategory}</span>
        </div>

        {/* Category Header (Clean, Background-free with Enhanced UI) */}
        <div style={{
          paddingBottom: "24px",
          marginBottom: "28px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.25rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{
                fontSize: "2.25rem",
                fontWeight: "800",
                color: "#1e293b",
                margin: 0,
                letterSpacing: "-0.5px",
                lineHeight: 1.2
              }}>
                {displayCategory} Collection
              </h1>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                background: "#f1f5f9",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#64748b"
              }}>
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </span>
            </div>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
              Explore our handpicked {displayCategory.toLowerCase()} wardrobe crafted with premium fabrics & modern tailoring
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Custom Pill Toggle for In Stock Only */}
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                borderRadius: "20px",
                border: inStockOnly ? "1px solid #1e293b" : "1px solid #e2e8f0",
                background: inStockOnly ? "#1e293b" : "#ffffff",
                color: inStockOnly ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: inStockOnly ? "#10b981" : "#94a3b8",
                display: "inline-block"
              }}></span>
              <span>In Stock Only</span>
            </button>

            {/* Enhanced Sort Select */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <SlidersHorizontal size={15} color="#64748b" style={{ position: "absolute", left: "12px", pointerEvents: "none" }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "7px 14px 7px 34px",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#334155",
                  background: "#ffffff",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease"
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div className="product-image-wrapper skeleton-box" style={{ height: "280px" }}></div>
                <div style={{ padding: "14px 10px" }}>
                  <div className="skeleton-line" style={{ width: "30%", height: "12px", marginBottom: "8px" }}></div>
                  <div className="skeleton-line" style={{ width: "85%", height: "16px", marginBottom: "10px" }}></div>
                  <div className="skeleton-line" style={{ width: "45%", height: "18px" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-container">
              {paginatedProducts.map((product) => {
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
                    <span className="product-brand-tag">{product.brand || "CLOTHINGS STORE"}</span>
                    <h3 className="product-title" title={product.name}>{product.name}</h3>

                    {/* Price row */}
                    <div className="product-price-row">
                      <span className="product-price">₹{price.toLocaleString("en-IN")}</span>
                      {originalPrice > price && (
                        <>
                          <span className="product-original-price">₹{originalPrice.toLocaleString("en-IN")}</span>
                          <span className="product-discount-percent">({discountPct}% off)</span>
                        </>
                      )}
                    </div>

                    {/* Under-price Offer Line */}
                    <div className="product-offer-row">
                      <span className="offer-tag-label">Offer Price:</span>
                      <span className="offer-tag-price">₹{Math.round(price * 0.8).toLocaleString("en-IN")}</span>
                      <span className="offer-tag-code">| With SUPER20</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", padding: "1.25rem 0", borderTop: "1px solid #eef2f6", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.88rem", color: "#666" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); window.scrollTo({ top: 120, behavior: "smooth" }); }}
                  style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #dcdfe4", background: "#fff", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.4 : 1 }}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setCurrentPage(p); window.scrollTo({ top: 120, behavior: "smooth" }); }}
                    style={{ minWidth: "34px", height: "34px", padding: "0 0.5rem", borderRadius: "6px", border: "1px solid", borderColor: currentPage === p ? "#01579b" : "#dcdfe4", background: currentPage === p ? "#01579b" : "#fff", color: currentPage === p ? "#fff" : "#333", fontWeight: currentPage === p ? 600 : 400, cursor: "pointer" }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); window.scrollTo({ top: 120, behavior: "smooth" }); }}
                  style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #dcdfe4", background: "#fff", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1 }}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
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
