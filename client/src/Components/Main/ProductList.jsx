import React, { useContext } from "react";
import "./Products.css";
import { ShoppingCart, Heart } from "lucide-react";
import { CartContext } from "../../Context/CartContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { AuthContext } from "../../Context/AuthContext";
import { toast } from "react-hot-toast";

const products = [
  { id: 1, name: "Shirt 1", price: 950, image: "/images/shirt1.jpeg" },
  { id: 2, name: "Pant 1", price: 1100, image: "/images/pant1.jpeg" },
  { id: 3, name: "Hoodie 1", price: 1500, image: "/images/Hoodie1.jpeg" },
  { id: 4, name: "T-Shirt 1", price: 700, image: "/images/Tshirt1.jpeg" },
  { id: 5, name: "Shirt 2", price: 950, image: "/images/shirt2.jpeg" },
  { id: 6, name: "Pant 2", price: 1300, image: "/images/pant2.jpeg" },
  { id: 7, name: "Hoodie 2", price: 1600, image: "/images/Hoodie2.jpeg" },
  { id: 8, name: "T-Shirt 2", price: 800, image: "/images/Tshirt2.jpeg" },
  { id: 9, name: "Shirt 3", price: 1200, image: "/images/shirt3.jpeg" },
  { id: 10, name: "Pant 3", price: 1250, image: "/images/pant3.jpeg" },
  { id: 11, name: "Hoodie 3", price: 1550, image: "/images/Hoodie3.jpeg" },
  { id: 12, name: "T-Shirt 3", price: 750, image: "/images/Tshirt3.jpeg" },
  { id: 13, name: "Shirt 4", price: 899, image: "/images/shirt4.jpeg" },
  { id: 14, name: "Pant 4", price: 1350, image: "/images/pant4.jpeg" },
  { id: 15, name: "Hoodie 4", price: 1650, image: "/images/Hoodie4.jpeg" },
  { id: 16, name: "T-Shirt 4", price: 850, image: "/images/Tshirt4.jpeg" },
  { id: 17, name: "Shirt 5", price: 999, image: "/images/shirt5.jpeg" },
  { id: 18, name: "Pant 5", price: 1400, image: "/images/pant5.jpeg" },
  { id: 19, name: "Hoodie 5", price: 1700, image: "/images/Hoodie5.jpeg" },
  { id: 20, name: "T-Shirt 5", price: 900, image: "/images/Tshirt5.jpeg" },
  { id: 21, name: "Shirt 6", price: 950, image: "/images/shirt6.jpeg" },
  { id: 22, name: "Pant 6", price: 1450, image: "/images/pant6.jpeg" },
  { id: 23, name: "Hoodie 6", price: 1750, image: "/images/Hoodie6.jpeg" },
  { id: 24, name: "T-Shirt 6", price: 950, image: "/images/Tshirt6.jpeg" },
];

const ProductList = () => {
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);
  const { user } = useContext(AuthContext); // ✅ check login

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      toast.error("⚠️ Please login first to use wishlist");
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

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("⚠️ Please login first to add items to cart");
      return;
    }

    addToCart(product);
    toast.success(`${product.name} added to Cart 🛒`);
  };

  return (
    <div className="product-container">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <Heart
            className="wishlist-icon"
            onClick={() => toggleWishlist(product)}
            fill={isWishlisted(product.id) ? "red" : "none"}
            color={isWishlisted(product.id) ? "red" : "gray"}
            strokeWidth={1.5}
          />

          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />

          <h3 className="product-title">{product.name}</h3>

          <p className="product-price">
            ₹{product.price.toLocaleString("en-IN")}.00
          </p>

          <button
            className="cart-button"
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingCart size={18} /> Add to cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
