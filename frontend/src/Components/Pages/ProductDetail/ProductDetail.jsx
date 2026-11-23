import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, ChevronLeft, ShieldCheck, Truck, RefreshCw, Send } from "lucide-react";
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
    const [selectedColor, setSelectedColor] = useState("");
    const [activeTab, setActiveTab] = useState("description");

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const { data } = await productsAPI.getById(productId);
                if (data) {
                    setProduct(data);
                    setSelectedImage(data.image);
                    if (data.variants && data.variants.length > 0 && data.variants[0].color) {
                        setSelectedColor(data.variants[0].color);
                    }

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
                    } catch (e) {
                        // ignore storage errors
                    }

                    // Fetch related products
                    try {
                        const relRes = await productsAPI.getRelated(data.id || productId);
                        setRelatedProducts(relRes.data || []);
                    } catch {
                        // ignore
                    }
                }
            } catch {
                // Fallback to static data if backend is offline
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
            <div className="product-detail-page container" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page container text-center" style={{ padding: "4rem 1rem" }}>
                <h2>Product Not Found</h2>
                <p>The product you are looking for does not exist or has been removed.</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/Category")}>
                    Browse Products
                </button>
            </div>
        );
    }

    const isWishlisted = wishlist.some((item) => String(item.id) === String(product.id));

    const toggleWishlist = () => {
        if (!user) {
            toast.error("Please login first");
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
            toast.error("Please login to add items to cart");
            navigate("/Login");
            return;
        }
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }
        if (product.stock <= 0) {
            toast.error("Sorry, this item is currently out of stock");
            return;
        }

        addToCart(
            {
                ...product,
                image: selectedImage || product.image,
                selectedColor: selectedColor || undefined,
            },
            selectedSize
        );
        toast.success("Added to Cart 🛒");
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to write a review");
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
            // Refresh product to show updated review
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
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} /> Back
            </button>

            <div className="detail-wrapper">
                {/* Images Section */}
                <div className="detail-image-section">
                    <div className="main-image-wrapper">
                        <img src={selectedImage || product.image} alt={product.name} className="detail-img" />
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="low-stock-badge">Only {product.stock} left in stock!</span>
                        )}
                        {product.stock === 0 && (
                            <span className="out-of-stock-badge">Out of Stock</span>
                        )}
                    </div>

                    {imageGallery.length > 1 && (
                        <div className="thumbnail-gallery">
                            {imageGallery.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${product.name} thumbnail ${idx}`}
                                    className={`gallery-thumb ${selectedImage === img ? "active" : ""}`}
                                    onClick={() => setSelectedImage(img)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="detail-info-section">
                    <div className="product-meta">
                        <span className="detail-category">{product.category}</span>
                        {product.sku && <span className="sku-tag">SKU: {product.sku}</span>}
                        {isWishlisted && <span className="wishlist-badge">❤️ In Wishlist</span>}
                    </div>

                    <h1 className="detail-title">{product.name}</h1>
                    {product.brand && <p className="detail-brand">By <strong>{product.brand}</strong></p>}

                    <div className="detail-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    fill={i < Math.floor(product.rating || 0) ? "#fbbf24" : "none"}
                                    color={i < Math.floor(product.rating || 0) ? "#fbbf24" : "#cbd5e1"}
                                />
                            ))}
                        </div>
                        <span className="rating-score">{(product.rating || 0).toFixed(1)}</span>
                        <span className="review-count">({product.numReviews || reviewsList.length} verified reviews)</span>
                    </div>

                    <div className="price-container">
                        <p className="detail-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="detail-original-price">
                                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>

                    {/* Size Selector */}
                    <div className="size-selector">
                        <div className="selector-header">
                            <span className="label">Select Size</span>
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
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            className="btn-cart"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart size={20} />
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                        <button
                            className={`btn-wishlist ${isWishlisted ? "active" : ""}`}
                            onClick={toggleWishlist}
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Guarantees Box */}
                    <div className="product-perks">
                        <div className="perk-item">
                            <Truck size={18} className="perk-icon" />
                            <span>Free express delivery on orders over ₹499</span>
                        </div>
                        <div className="perk-item">
                            <RefreshCw size={18} className="perk-icon" />
                            <span>7-day easy return & exchange guarantee</span>
                        </div>
                        <div className="perk-item">
                            <ShieldCheck size={18} className="perk-icon" />
                            <span>100% genuine guaranteed product</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section: Description, Specifications, Reviews */}
            <div className="reviews-section mt-5">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "description" ? "active" : ""}`}
                        onClick={() => setActiveTab("description")}
                    >
                        Description
                    </button>
                    <button
                        className={`tab ${activeTab === "specifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("specifications")}
                    >
                        Specifications
                    </button>
                    <button
                        className={`tab ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Reviews ({reviewsList.length})
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === "description" && (
                        <div className="description-content">
                            <p className="main-desc">{product.description}</p>
                            <div className="highlights-box mt-3">
                                <h4>Product Highlights</h4>
                                <ul>
                                    <li>Breathable, high-grade organic fabric tailored for modern everyday fit.</li>
                                    <li>Double-stitched reinforced seams for durability and shape retention.</li>
                                    <li>Color-fast dyes that withstand standard machine washes without fading.</li>
                                    <li>Designed and engineered for maximum flexibility, movement, and comfort.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === "specifications" && (
                        <div className="specifications-content">
                            <table className="specs-table">
                                <tbody>
                                    <tr>
                                        <td><strong>Category</strong></td>
                                        <td>{product.category}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Brand</strong></td>
                                        <td>{product.brand || "Mens Hub Premium"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>SKU Identifier</strong></td>
                                        <td>{product.sku || `MH-${product.id}`}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Fabric / Material</strong></td>
                                        <td>{product.specifications?.material || "100% Combed Compact Cotton"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Fit Type</strong></td>
                                        <td>{product.specifications?.fit || "Slim / Modern Fit"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Care Instructions</strong></td>
                                        <td>{product.specifications?.care || "Machine wash cold with like colors, tumble dry low"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="reviews-content">
                            {/* Write Review Form */}
                            <div className="add-review-card">
                                <h4>Write a Customer Review</h4>
                                {user ? (
                                    <form onSubmit={handleReviewSubmit} className="review-form">
                                        <div className="rating-select">
                                            <span>Your Rating:</span>
                                            <div className="star-rating-input">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={22}
                                                        className="star-clickable"
                                                        fill={star <= rating ? "#fbbf24" : "none"}
                                                        color={star <= rating ? "#fbbf24" : "#cbd5e1"}
                                                        onClick={() => setRating(star)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            placeholder="Share your experience with this item (fit, quality, comfort)..."
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                                            <Send size={16} /> {submittingReview ? "Submitting..." : "Post Review"}
                                        </button>
                                    </form>
                                ) : (
                                    <p className="login-to-review">
                                        Please <Link to="/Login">Log in</Link> to share your review on this product.
                                    </p>
                                )}
                            </div>

                            {/* Reviews Listing */}
                            <div className="reviews-list mt-4">
                                {reviewsList.length > 0 ? (
                                    reviewsList.map((rev, index) => (
                                        <div key={index} className="review-item">
                                            <div className="review-header">
                                                <span className="reviewer-name">{rev.name}</span>
                                                <div className="review-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < rev.rating ? "#fbbf24" : "none"}
                                                            color={i < rev.rating ? "#fbbf24" : "#cbd5e1"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-text">{rev.comment}</p>
                                            {rev.createdAt && (
                                                <span className="review-date">
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section mt-5">
                    <h3 className="section-title">You Might Also Like</h3>
                    <div className="related-products-grid">
                        {relatedProducts.map((rel) => (
                            <div
                                key={rel.id}
                                className="related-product-card"
                                onClick={() => navigate(`/product/${rel.id}`)}
                            >
                                <img src={rel.image} alt={rel.name} />
                                <h4>{rel.name}</h4>
                                <p className="price">₹{Number(rel.price).toLocaleString("en-IN")}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
