import React, { useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import products from "../../../assets/data/products";
import { WishlistContext } from "../../../Context/WishlistContext";
import { toast } from "react-hot-toast";
import "../../../Components/Main/Products.css";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();
    const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

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
        <div className="container" style={{ paddingTop: "100px", minHeight: "60vh" }}>
            <h2 style={{ marginBottom: "2rem" }}>Search Results for "{query}"</h2>

            {filteredProducts.length === 0 ? (
                <p>No products found matching your search.</p>
            ) : (
                <div className="product-container" style={{ padding: 0 }}>
                    {filteredProducts.map((product) => (
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
