import React, { useContext, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Heart, SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";
import { productsAPI } from "../../../services/api";
import staticProducts from "../../../assets/data/products";
import { WishlistContext } from "../../../Context/WishlistContext";
import { AuthContext } from "../../../Context/AuthContext";
import { curry } from "../../../utils/performance";
import { toast } from "react-hot-toast";
import "../../../Components/Main/Products.css";

const deduplicateProducts = (items) => {
    const seen = new Set();
    return (items || []).filter((p) => {
        const id = String(p.id || p._id);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    const { user } = useContext(AuthContext);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sort, setSort] = useState("relevance");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [maxPrice, setMaxPrice] = useState(3000);

    const categories = ["all", "shirts", "pants", "hoodies", "t-shirts"];

    // Curried filter state updater
    const updateFilter = curry((field, value) => {
        if (field === "category") setSelectedCategory(value);
        else if (field === "sort") setSort(value);
        else if (field === "inStock") setInStockOnly(value);
        else if (field === "maxPrice") setMaxPrice(Number(value));
    });

    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    search: query,
                    category: selectedCategory !== "all" ? selectedCategory : undefined,
                    sort: sort !== "relevance" ? sort : undefined,
                    maxPrice: maxPrice || undefined,
                    inStock: inStockOnly ? true : undefined,
                };
                const { data } = await productsAPI.getAll(params);
                const results = Array.isArray(data) ? data : data.products || [];
                setProducts(deduplicateProducts(results));
            } catch {
                // Client-side fallback if backend request fails
                let list = [...staticProducts];
                if (query) {
                    list = list.filter(
                        (p) =>
                            p.name.toLowerCase().includes(query.toLowerCase()) ||
                            p.description.toLowerCase().includes(query.toLowerCase()) ||
                            p.category.toLowerCase().includes(query.toLowerCase())
                    );
                }
                if (selectedCategory !== "all") {
                    list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
                }
                if (inStockOnly) {
                    list = list.filter((p) => p.stock > 0);
                }
                list = list.filter((p) => p.price <= maxPrice);

                if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
                if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
                if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

                setProducts(deduplicateProducts(list));
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredProducts();
    }, [query, selectedCategory, sort, inStockOnly, maxPrice]);

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

    return (
        <div className="container" style={{ paddingTop: "140px", minHeight: "75vh", paddingBottom: "60px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
                        {query ? `Search Results for "${query}"` : "Explore Catalog"}
                    </h2>
                    <p style={{ color: "#6b7280", margin: "0.25rem 0 0" }}>
                        Showing {products.length} products
                    </p>
                </div>

                {/* Sorting Select */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ArrowUpDown size={16} color="#6b7280" />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            background: "#ffffff",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                        }}
                    >
                        <option value="relevance">Sort by: Relevance</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>

            {/* Faceted Filter Toolbar */}
            <div
                style={{
                    background: "#f9fafb",
                    padding: "1rem 1.25rem",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    marginBottom: "2rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "1.5rem",
                    justifyContent: "space-between",
                }}
            >
                {/* Category Pills */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Category:</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: "0.35rem 0.85rem",
                                borderRadius: "20px",
                                border: selectedCategory === cat ? "1px solid #111827" : "1px solid #d1d5db",
                                background: selectedCategory === cat ? "#111827" : "#ffffff",
                                color: selectedCategory === cat ? "#ffffff" : "#374151",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                textTransform: "capitalize",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Price and Stock Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.85rem", color: "#374151" }}>Max Price:</span>
                        <input
                            type="range"
                            min="500"
                            max="3000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            style={{ cursor: "pointer", width: "100px" }}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "55px" }}>₹{maxPrice}</span>
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                        />
                        <span>In-Stock Only</span>
                    </label>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="product-container" style={{ padding: 0 }}>
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
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "#f9fafb", borderRadius: "12px" }}>
                    <p style={{ fontSize: "1.1rem", color: "#4b5563" }}>No products found matching your criteria.</p>
                    <button
                        onClick={() => {
                            setSelectedCategory("all");
                            setMaxPrice(3000);
                            setInStockOnly(false);
                            setSort("relevance");
                        }}
                        style={{
                            marginTop: "1rem",
                            padding: "0.5rem 1.25rem",
                            background: "#111827",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="product-container" style={{ padding: 0 }}>
                    {products.map((product) => (
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
                                {product.stock <= 5 && product.stock > 0 && (
                                    <span style={{ position: "absolute", bottom: "8px", left: "8px", background: "#fef2f2", color: "#dc2626", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            <div className="product-details">
                                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#9ca3af", letterSpacing: "0.5px" }}>
                                    {product.category}
                                </span>
                                <h3 className="product-title">{product.name}</h3>
                                <p className="product-price">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
