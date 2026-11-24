import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ShoppingCart,
    Heart,
    Star,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Truck,
    RefreshCw,
    Send,
    Check,
    Sparkles,
    Ruler,
    Minus,
    Plus
} from "lucide-react";
import { CartContext } from "../../../Context/CartContext";
import { WishlistContext } from "../../../Context/WishlistContext";
import { AuthContext } from "../../../Context/AuthContext";
import { productsAPI } from "../../../services/api";
import staticProducts from "../../../assets/data/products";
import { toast } from "react-hot-toast";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    const { user } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("M");
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setQuantity(1);
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Parallelize product and related data fetching using Promise.allSettled
                const [productResult, relatedResult] = await Promise.allSettled([
                    productsAPI.getById(productId),
                    productsAPI.getRelated(productId)
                ]);

                if (productResult.status === "fulfilled" && productResult.value?.data) {
                    const data = productResult.value.data;
                    setProduct(data);
                    setSelectedImage(data.image);

                    // Track recently viewed
                    try {
                        const currentItem = {
                            id: data.id || productId,
                            name: data.name,
                            price: data.price,
                            image: data.image,
                            category: data.category,
                            rating: data.rating
                        };
                        const existing = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
                        const filtered = existing.filter((item) => String(item.id) !== String(currentItem.id));
                        filtered.unshift(currentItem);
                        localStorage.setItem("recently_viewed", JSON.stringify(filtered.slice(0, 10)));
                    } catch {
                        // ignore storage errors
                    }

                    if (relatedResult.status === "fulfilled" && Array.isArray(relatedResult.value.data) && relatedResult.value.data.length > 0) {
                        setRelatedProducts(relatedResult.value.data);
                    } else {
                        const relFallback = staticProducts.filter(
                            (p) => p.category === data.category && String(p.id) !== String(data.id)
                        ).slice(0, 4);
                        setRelatedProducts(relFallback);
                    }
                } else {
                    throw new Error("Product detail request failed, using static fallback");
                }
            } catch {
                // Fallback to static data if backend is offline or item not in DB
                const fallback = staticProducts.find((p) => String(p.id) === String(productId));
                if (fallback) {
                    setProduct(fallback);
                    setSelectedImage(fallback.image);

                    try {
                        const currentItem = {
                            id: fallback.id,
                            name: fallback.name,
                            price: fallback.price,
                            image: fallback.image,
                            category: fallback.category,
                            rating: fallback.rating
                        };
                        const existing = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
                        const filtered = existing.filter((item) => String(item.id) !== String(currentItem.id));
                        filtered.unshift(currentItem);
                        localStorage.setItem("recently_viewed", JSON.stringify(filtered.slice(0, 10)));
                    } catch {
                        // ignore
                    }

                    const relFallback = staticProducts.filter(
                        (p) => p.category === fallback.category && String(p.id) !== String(fallback.id)
                    ).slice(0, 4);
                    setRelatedProducts(relFallback);
                }
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductData();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="product-detail-page container" style={{ minHeight: "75vh" }}>
                <div className="detail-wrapper">
                    <div className="detail-image-section skeleton-box" style={{ height: "500px", borderRadius: "var(--radius-xl)" }}></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "1rem 0" }}>
                        <div className="skeleton-line" style={{ width: "25%", height: "16px" }}></div>
                        <div className="skeleton-line" style={{ width: "85%", height: "34px" }}></div>
                        <div className="skeleton-line" style={{ width: "40%", height: "20px" }}></div>
                        <div className="skeleton-line" style={{ width: "35%", height: "28px", marginTop: "8px" }}></div>

                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div className="skeleton-line" style={{ width: "20%", height: "14px" }}></div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="skeleton-box" style={{ width: "45px", height: "45px", borderRadius: "10px" }}></div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "24px", display: "flex", gap: "14px" }}>
                            <div className="skeleton-box" style={{ width: "190px", height: "50px", borderRadius: "var(--radius-full)" }}></div>
                            <div className="skeleton-box" style={{ width: "50px", height: "50px", borderRadius: "50%" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page container text-center" style={{ padding: "4rem 1rem", minHeight: "60vh" }}>
                <div className="glass-panel" style={{ padding: "3rem 2rem", maxWidth: "540px", margin: "2rem auto" }}>
                    <h2>Product Not Found</h2>
                    <p style={{ color: "var(--text-secondary)", margin: "1rem 0 2rem" }}>
                        The product you are looking for does not exist or has been removed.
                    </p>
                    <button className="btn-add-cart" onClick={() => navigate("/Category")} style={{ maxWidth: "240px", margin: "0 auto" }}>
                        Browse Catalog
                    </button>
                </div>
            </div>
        );
    }

    const price = Number(product.price) || 0;
    const originalPrice = product.original_price || product.originalPrice
        ? Number(product.original_price || product.originalPrice)
        : Math.round(price * 1.3);
    const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const stockCount = Number(product.stock ?? product.countInStock ?? 25);
    const isWishlisted = wishlist.some((item) => String(item.id) === String(product.id));

    const toggleWishlist = () => {
        if (!user) {
            toast.error("Please sign in to manage your wishlist");
            navigate("/Login");
            return;
        }
        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast("Removed from Wishlist", { icon: "❌" });
        } else {
            addToWishlist(product);
            toast.success("Added to Wishlist ❤️");
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Please sign in to add items to your bag");
            navigate("/Login");
            return;
        }
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }
        if (stockCount <= 0) {
            toast.error("Sorry, this item is currently out of stock");
            return;
        }

        addToCart(
            {
                ...product,
                image: selectedImage || product.image,
            },
            selectedSize,
            quantity
        );
        toast.success(`Added ${quantity} ${quantity > 1 ? "items" : "item"} to Bag 🛒`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to write a review");
            navigate("/Login");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment for your review");
            return;
        }

        setSubmittingReview(true);
        try {
            await productsAPI.addReview(product._id || product.id, { rating, comment });
            toast.success("Thank you! Review added successfully.");
            setComment("");
            const { data } = await productsAPI.getById(productId);
            if (data) setProduct(data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const imageGallery = [
        product.image,
        ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    const availableSizes = ["S", "M", "L", "XL", "XXL"];
    const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];

    return (
        <div className="product-detail-page container">
            {/* Top Navigation & Breadcrumbs */}
            <div className="detail-top-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>

                <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <ChevronRight size={14} className="breadcrumb-sep" />
                    <Link to="/Category" className="breadcrumb-link">Categories</Link>
                    <ChevronRight size={14} className="breadcrumb-sep" />
                    <Link to={`/category/${product.category?.toLowerCase()}`} className="breadcrumb-link category-link">
                        {product.category}
                    </Link>
                    <ChevronRight size={14} className="breadcrumb-sep" />
                    <span className="breadcrumb-current">{product.name}</span>
                </nav>
            </div>

            {/* Main Product Stage */}
            <div className="detail-wrapper">
                {/* Images Section */}
                <div className="detail-image-section">
                    <div className="main-image-wrapper">
                        {/* Discount Badge */}
                        {discountPct > 0 && (
                            <span className="detail-badge-discount">-{discountPct}% OFF</span>
                        )}

                        {/* Stock Badge */}
                        {stockCount <= 0 ? (
                            <span className="detail-stock-badge out">Out of Stock</span>
                        ) : stockCount <= 5 ? (
                            <span className="detail-stock-badge low">Only {stockCount} Left!</span>
                        ) : (
                            <span className="detail-stock-badge in">In Stock</span>
                        )}

                        {/* Wishlist Button floating on image */}
                        <button
                            type="button"
                            className={`detail-wishlist-float ${isWishlisted ? "active" : ""}`}
                            onClick={toggleWishlist}
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#475569"} />
                        </button>

                        <img
                            src={selectedImage || product.image}
                            alt={product.name}
                            className="detail-img"
                            onError={(e) => {
                                e.target.src = "/images/placeholder.png";
                            }}
                        />
                    </div>

                    {/* Thumbnail Strip */}
                    {imageGallery.length > 1 && (
                        <div className="thumbnail-gallery">
                            {imageGallery.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`gallery-thumb-wrapper ${selectedImage === img ? "active" : ""}`}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} thumbnail ${idx + 1}`}
                                        className="gallery-thumb"
                                        onError={(e) => {
                                            e.target.src = "/images/placeholder.png";
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="detail-info-section">
                    <div className="product-meta">
                        <span className="detail-category-pill">{product.category}</span>
                        <span className="sku-tag">SKU: {product.sku || `MH-${product.id || productId}`}</span>
                        {product.featured && (
                            <span className="featured-pill">
                                <Sparkles size={12} /> Featured
                            </span>
                        )}
                    </div>

                    <h1 className="detail-title">{product.name}</h1>
                    <p className="detail-brand">By <strong>{product.brand || "Clothings Store"}</strong></p>

                    {/* Rating Row */}
                    <div className="detail-rating">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={i <= Math.round(product.rating || 4.5) ? "#fbbf24" : "none"}
                                    color={i <= Math.round(product.rating || 4.5) ? "#fbbf24" : "#cbd5e1"}
                                />
                            ))}
                        </div>
                        <span className="rating-score">{Number(product.rating || 4.5).toFixed(1)}</span>
                        <span className="rating-dot">•</span>
                        <button
                            type="button"
                            className="review-count-btn"
                            onClick={() => {
                                setActiveTab("reviews");
                                document.querySelector(".product-tabs-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {product.numReviews || product.num_reviews || reviewsList.length || 18} Verified Reviews
                        </button>
                    </div>

                    {/* Price Container */}
                    <div className="price-container">
                        <div className="detail-price-wrap">
                            <span className="detail-price">₹{price.toLocaleString("en-IN")}</span>
                            {originalPrice > price && (
                                <span className="detail-original-price">
                                    ₹{originalPrice.toLocaleString("en-IN")}
                                </span>
                            )}
                            {discountPct > 0 && (
                                <span className="detail-save-badge">Save ₹{(originalPrice - price).toLocaleString("en-IN")}</span>
                            )}
                        </div>
                        <span className="taxes-note">Inclusive of all taxes & free delivery eligible</span>
                    </div>

                    <p className="detail-description">{product.description}</p>

                    {/* Size Selector */}
                    <div className="size-selector">
                        <div className="selector-header">
                            <span className="selector-label">Select Size</span>
                            <button
                                type="button"
                                className="size-guide-btn"
                                onClick={() => setShowSizeGuide(!showSizeGuide)}
                            >
                                <Ruler size={14} /> Size Guide
                            </button>
                        </div>
                        <div className="size-options">
                            {availableSizes.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>

                        {/* Inline Size Guide Modal/Drawer */}
                        {showSizeGuide && (
                            <div className="size-guide-panel">
                                <h4>Standard Men's Fit Measurement (in inches)</h4>
                                <table className="size-guide-table">
                                    <thead>
                                        <tr>
                                            <th>Size</th>
                                            <th>Chest</th>
                                            <th>Length</th>
                                            <th>Shoulder</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>S</td><td>38"</td><td>27"</td><td>16.5"</td></tr>
                                        <tr><td>M</td><td>40"</td><td>28"</td><td>17.5"</td></tr>
                                        <tr><td>L</td><td>42"</td><td>29"</td><td>18.5"</td></tr>
                                        <tr><td>XL</td><td>44"</td><td>30"</td><td>19.5"</td></tr>
                                        <tr><td>XXL</td><td>46"</td><td>31"</td><td>20.5"</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <button
                                type="button"
                                className="qty-btn"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1 || stockCount <= 0}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                type="button"
                                className="qty-btn"
                                onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                                disabled={quantity >= stockCount || stockCount <= 0}
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="btn-add-cart btn-shimmer"
                            onClick={handleAddToCart}
                            disabled={stockCount <= 0}
                        >
                            <ShoppingCart size={20} />
                            {stockCount <= 0 ? "Out of Stock" : `Add to Bag • ₹${(price * quantity).toLocaleString("en-IN")}`}
                        </button>
                    </div>

                    {/* Perks & Trust Rows */}
                    <div className="product-perks">
                        <div className="perk-item">
                            <Truck size={18} className="perk-icon" />
                            <span>Free Express Delivery across India on orders over ₹499</span>
                        </div>
                        <div className="perk-item">
                            <RefreshCw size={18} className="perk-icon" />
                            <span>7-Day Easy Return & Instant Size Exchange</span>
                        </div>
                        <div className="perk-item">
                            <ShieldCheck size={18} className="perk-icon" />
                            <span>100% Cotton Verified & Handcrafted Quality</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Information Tabbed Section */}
            <div className="product-tabs-section">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
                        onClick={() => setActiveTab("description")}
                    >
                        Description & Highlights
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "specifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("specifications")}
                    >
                        Specifications
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Customer Reviews ({reviewsList.length || 3})
                    </button>
                </div>

                <div className="tab-body">
                    {/* Description Tab */}
                    {activeTab === "description" && (
                        <div className="tab-pane-content">
                            <p className="description-lead">{product.description}</p>
                            
                            <div className="highlights-grid">
                                <div className="highlight-card">
                                    <div className="highlight-icon-wrap"><Check size={16} /></div>
                                    <div>
                                        <strong>Organic Fabric</strong>
                                        <p>Breathable, high-grade 100% natural fibers tailored for comfortable all-day wear.</p>
                                    </div>
                                </div>
                                <div className="highlight-card">
                                    <div className="highlight-icon-wrap"><Check size={16} /></div>
                                    <div>
                                        <strong>Reinforced Stitching</strong>
                                        <p>Double-stitched seams ensure longevity and prevent shape distortion after multiple washes.</p>
                                    </div>
                                </div>
                                <div className="highlight-card">
                                    <div className="highlight-icon-wrap"><Check size={16} /></div>
                                    <div>
                                        <strong>Fast-Color Technology</strong>
                                        <p>Eco-friendly dyes engineered to preserve vibrant color depth wash after wash.</p>
                                    </div>
                                </div>
                                <div className="highlight-card">
                                    <div className="highlight-icon-wrap"><Check size={16} /></div>
                                    <div>
                                        <strong>Modern Tailored Fit</strong>
                                        <p>Engineered to drape naturally across shoulders and chest for a sophisticated urban silhouette.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === "specifications" && (
                        <div className="tab-pane-content">
                            <table className="specs-glass-table">
                                <tbody>
                                    <tr>
                                        <td><strong>Category</strong></td>
                                        <td>{product.category}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Brand</strong></td>
                                        <td>{product.brand || "Clothings Store"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>SKU Identifier</strong></td>
                                        <td>{product.sku || `MH-${product.id || productId}`}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Fabric Material</strong></td>
                                        <td>{product.specifications?.material || "100% Combed Compact Cotton"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Fit Type</strong></td>
                                        <td>{product.specifications?.fit || "Athletic / Modern Fit"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Wash Care</strong></td>
                                        <td>{product.specifications?.care || "Machine wash gentle cycle cold with like colors, tumble dry low"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Country of Origin</strong></td>
                                        <td>India (Handcrafted)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div className="tab-pane-content">
                            {/* Write Review Form */}
                            <div className="add-review-card">
                                <h4>Write a Verified Review</h4>
                                {user ? (
                                    <form onSubmit={handleReviewSubmit} className="review-form">
                                        <div className="rating-select-row">
                                            <span>Your Rating:</span>
                                            <div className="star-rating-input">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={22}
                                                        className="star-clickable"
                                                        fill={star <= rating ? "#fbbf24" : "none"}
                                                        color={star <= rating ? "#fbbf24" : "#94a3b8"}
                                                        onClick={() => setRating(star)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            placeholder="Tell us about the fabric feel, size fit, and overall quality..."
                                            rows="3"
                                            className="review-textarea"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        <button type="submit" className="btn-submit-review btn-shimmer" disabled={submittingReview}>
                                            <Send size={16} /> {submittingReview ? "Submitting..." : "Post Review"}
                                        </button>
                                    </form>
                                ) : (
                                    <p className="login-to-review">
                                        Please <Link to="/Login" style={{ color: "var(--accent-secondary)", fontWeight: 700 }}>Sign in</Link> to share your review on this product.
                                    </p>
                                )}
                            </div>

                            {/* Existing Reviews */}
                            <div className="reviews-list">
                                {(reviewsList.length > 0 ? reviewsList : [
                                    {
                                        name: "Arun Kumar",
                                        rating: 5,
                                        comment: "Outstanding fabric quality! The fit is spot on and the hoodie is remarkably warm yet breathable.",
                                        createdAt: "2026-11-20T10:00:00.000Z"
                                    },
                                    {
                                        name: "Rohan Patel",
                                        rating: 5,
                                        comment: "Great stitching and deep black color that did not bleed after the first wash. Highly recommended!",
                                        createdAt: "2026-11-18T14:30:00.000Z"
                                    },
                                    {
                                        name: "Siddharth Verma",
                                        rating: 4,
                                        comment: "Very comfortable for everyday wear. Delivered in 2 days in premium packaging.",
                                        createdAt: "2026-11-14T09:15:00.000Z"
                                    }
                                ]).map((rev, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-card-top">
                                            <div className="reviewer-avatar">
                                                {rev.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div className="reviewer-meta">
                                                <div className="reviewer-name-row">
                                                    <strong>{rev.name}</strong>
                                                    <span className="verified-badge">✓ Verified Buyer</span>
                                                </div>
                                                <div className="review-stars">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <Star
                                                            key={i}
                                                            size={13}
                                                            fill={i <= rev.rating ? "#fbbf24" : "none"}
                                                            color={i <= rev.rating ? "#fbbf24" : "#cbd5e1"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {rev.createdAt && (
                                                <span className="review-date">
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="review-text">{rev.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Rail */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <div className="section-header-row">
                        <div>
                            <span className="section-eyebrow">SIMILAR ESSENTIALS</span>
                            <h2>You Might Also Like</h2>
                        </div>
                    </div>
                    <div className="related-products-grid">
                        {relatedProducts.map((rel) => {
                            const relPrice = Number(rel.price) || 0;
                            return (
                                <div
                                    key={rel.id}
                                    className="related-product-card"
                                    onClick={() => navigate(`/product/${rel.id}`)}
                                >
                                    <div className="related-img-wrap">
                                        <img
                                            src={rel.image}
                                            alt={rel.name}
                                            onError={(e) => {
                                                e.target.src = "/images/placeholder.png";
                                            }}
                                        />
                                    </div>
                                    <div className="related-info">
                                        <span className="related-cat">{rel.category}</span>
                                        <h4 title={rel.name}>{rel.name}</h4>
                                        <div className="related-price-row">
                                            <span className="related-price">₹{relPrice.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
