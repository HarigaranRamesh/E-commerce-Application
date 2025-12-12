import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, ChevronLeft } from "lucide-react";
import { CartContext } from "../../../Context/CartContext";
import { WishlistContext } from "../../../Context/WishlistContext";
import { AuthContext } from "../../../Context/AuthContext";
import products from "../../../assets/data/products"; // Import the centralized data
import { toast } from "react-hot-toast";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
    const { user } = useContext(AuthContext);
    const [selectedSize, setSelectedSize] = useState(null); // Size state
    const [activeTab, setActiveTab] = useState('description');

    // Find product by ID (string/number conversion handled)
    const product = products.find((p) => p.id == productId);

    // Scroll to top on mount or product change
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    if (!product) {
        return <div className="product-not-found">Product not found.</div>;
    }

    const isWishlisted = wishlist.some((item) => item.id === product.id);

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
            toast.error("Please login to add items");
            return;
        }
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }
        addToCart(product, selectedSize); // Pass size
        toast.success("Added to Cart 🛒");
    };



    return (
        <div className="product-detail-page container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} /> Back
            </button>

            <div className="detail-wrapper">
                <div className="detail-image-section">
                    <img src={product.image} alt={product.name} className="detail-img" />
                </div>

                <div className="detail-info-section">
                    <div className="product-meta">
                        <span className="detail-category">{product.category}</span>
                        {isWishlisted && <span className="wishlist-badge">❤️ In Wishlist</span>}
                    </div>

                    <h1 className="detail-title">{product.name}</h1>

                    <div className="detail-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    fill={i < Math.floor(product.rating) ? "#fbbf24" : "none"}
                                    color={i < Math.floor(product.rating) ? "#fbbf24" : "#cbd5e1"}
                                />
                            ))}
                        </div>
                        <span className="review-count">({product.reviews} reviews)</span>
                    </div>

                    <p className="detail-price">₹{product.price.toLocaleString("en-IN")}</p>

                    <div className="size-selector">
                        <span className="label">Select Size</span>
                        <div className="size-options">
                            {["S", "M", "L", "XL"].map((size) => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {!selectedSize && <p className="size-error-text">Please select a size *</p>}
                    </div>

                    <div className="action-buttons">
                        <button className="btn-cart" onClick={handleAddToCart}>
                            <ShoppingCart size={20} />
                            {selectedSize ? "Add to Cart" : "Select Size to Add"}
                        </button>
                        <button
                            className={`btn-wishlist ${isWishlisted ? "active" : ""}`}
                            onClick={toggleWishlist}
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="reviews-section">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({product.reviews})
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'description' ? (
                        <div className="description-content">
                            <p className="main-desc">{product.description}</p>
                            <p>
                                Enhance your wardrobe with the {product.name}.
                                Meticulously crafted for superior comfort and durability.
                                Whether you're dressing up for an event or keeping it casual,
                                this piece offers the perfect blend of style and functionality.
                            </p>
                            <ul className="features-list">
                                <li>Premium quality fabric</li>
                                <li>Modern fit</li>
                                <li>Machine washable</li>
                                <li>Sustainably sourced materials</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="reviews-content">
                            <div className="review-item">
                                <div className="review-header">
                                    <span className="reviewer-name">John Doe</span>
                                    <div className="review-stars">★★★★★</div>
                                </div>
                                <p className="review-text">Great product! Fits perfectly and feels very high quality.</p>
                            </div>
                            <div className="review-item">
                                <div className="review-header">
                                    <span className="reviewer-name">Jane Smith</span>
                                    <div className="review-stars">★★★★☆</div>
                                </div>
                                <p className="review-text">Really nice, but shipping took a few days longer than expected.</p>
                            </div>
                            <p className="no-more-reviews">No more reviews to load.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
