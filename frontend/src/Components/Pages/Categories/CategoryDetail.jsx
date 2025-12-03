import React, { useContext } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import "../../Main/Products.css";
import { CartContext } from "../../../Context/CartContext";
import { WishlistContext } from "../../../Context/WishlistContext";
import { toast } from "react-hot-toast";

const products = {
  shirts: [
    { id: 1, name: "Shirt ", price: 950, image: "/images/shirt1.jpeg" },
    { id: 2, name: "Shirt ", price: 950, image: "/images/shirt2.jpeg" },
    { id: 3, name: "Shirt ", price: 1200, image: "/images/shirt3.jpeg" },
    { id: 4, name: "Shirt ", price: 899, image: "/images/shirt4.jpeg" },
    { id: 5, name: "Shirt ", price: 999, image: "/images/shirt5.jpeg" },
    { id: 6, name: "Shirt ", price: 950, image: "/images/shirt6.jpeg" },
    { id: 7, name: "Shirt ", price: 800, image: "/images/shirt7.jpeg" },
    { id: 8, name: "Shirt ", price: 850, image: "/images/shirt8.jpeg" },
    { id: 9, name: "Shirt ", price: 950, image: "/images/shirt9.jpeg" },
    { id: 10, name: "Shirt ", price: 950, image: "/images/shirt10.jpeg" },
    { id: 11, name: "Shirt ", price: 1200, image: "/images/shirt11.jpeg" },
    { id: 12, name: "Shirt ", price: 899, image: "/images/shirt12.jpeg" },
    { id: 13, name: "Shirt ", price: 999, image: "/images/shirt13.jpeg" },
    { id: 14, name: "Shirt ", price: 899, image: "/images/shirt14.jpeg" },
    { id: 15, name: "Shirt ", price: 999, image: "/images/shirt15.jpeg" },
    { id: 16, name: "Shirt ", price: 1300, image: "/images/shirt17.jpeg" },
  ],
  hoodies: [
    { id: 17, name: "Hoodie ", price: 1500, image: "/images/Hoodie1.jpeg" },
    { id: 18, name: "Hoodie ", price: 1600, image: "/images/Hoodie2.jpeg" },
    { id: 17, name: "Hoodie ", price: 1500, image: "/images/Hoodie3.jpeg" },
    { id: 18, name: "Hoodie ", price: 1600, image: "/images/Hoodie4.jpeg" },
    { id: 17, name: "Hoodie ", price: 1500, image: "/images/Hoodie5.jpeg" },
    { id: 18, name: "Hoodie ", price: 1600, image: "/images/Hoodie6.jpeg" },
    { id: 17, name: "Hoodie ", price: 1500, image: "/images/Hoodie7.jpeg" },
    { id: 18, name: "Hoodie ", price: 1600, image: "/images/Hoodie8.jpeg" },
  ],
  pants: [
    { id: 19, name: "Pant ", price: 1100, image: "/images/pant1.jpeg" },
    { id: 20, name: "Pant ", price: 1300, image: "/images/pant2.jpeg" },
    { id: 21, name: "Pant ", price: 1150, image: "/images/pant3.jpeg" },
    { id: 22, name: "Pant ", price: 1200, image: "/images/pant4.jpeg" },
    { id: 23, name: "Pant ", price: 1250, image: "/images/pant5.jpeg" },
    { id: 24, name: "Pant ", price: 1350, image: "/images/pant6.jpeg" },
    { id: 25, name: "Pant ", price: 1400, image: "/images/pant7.jpeg" },
    { id: 26, name: "Pant ", price: 1450, image: "/images/pant8.jpeg" },
    { id: 27, name: "Pant ", price: 1500, image: "/images/pant9.jpeg" },
    { id: 28, name: "Pant ", price: 1550, image: "/images/pant10.jpeg" },
    { id: 29, name: "Pant ", price: 1600, image: "/images/pant11.jpeg" },
    { id: 30, name: "Pant ", price: 1650, image: "/images/pant12.jpeg" },
    { id: 31, name: "Pant ", price: 1700, image: "/images/pant13.jpeg" },
    { id: 32, name: "Pant ", price: 1750, image: "/images/pant14.jpeg" },
    { id: 33, name: "Pant ", price: 1800, image: "/images/pant15.jpeg" },
    { id: 34, name: "Pant ", price: 1850, image: "/images/pant16.jpeg" },
    { id: 35, name: "Pant ", price: 1900, image: "/images/pant17.jpeg" },
    { id: 36, name: "Pant ", price: 1950, image: "/images/pant18.jpeg" },
    { id: 37, name: "Pant ", price: 2000, image: "/images/pant19.jpeg" },
    { id: 38, name: "Pant ", price: 2050, image: "/images/pant20.jpeg" },
    { id: 39, name: "Pant ", price: 2100, image: "/images/pant21.jpeg" },
    { id: 40, name: "Pant ", price: 2150, image: "/images/pant22.jpeg" },
    { id: 41, name: "Pant ", price: 2200, image: "/images/pant23.jpeg" },
    { id: 42, name: "Pant ", price: 2250, image: "/images/pant24.jpeg" },
    { id: 43, name: "Pant ", price: 2300, image: "/images/pant25.jpeg" },
    { id: 44, name: "Pant ", price: 2350, image: "/images/pant26.jpeg" },
    { id: 45, name: "Pant ", price: 2400, image: "/images/pant27.jpeg" },
    { id: 46, name: "Pant ", price: 2450, image: "/images/pant28.jpeg" },
    { id: 47, name: "Pant ", price: 2500, image: "/images/pant29.jpeg" },
    { id: 48, name: "Pant ", price: 2550, image: "/images/pant30.jpeg" },
    { id: 49, name: "Pant ", price: 2600, image: "/images/pant31.jpeg" },
    { id: 50, name: "Pant ", price: 2650, image: "/images/pant32.jpeg" },
    { id: 51, name: "Pant ", price: 2700, image: "/images/pant33.jpeg" },
    { id: 52, name: "Pant ", price: 2750, image: "/images/pant34.jpeg" },
    { id: 53, name: "Pant ", price: 2800, image: "/images/pant30.jpeg" },
    { id: 54, name: "Pant ", price: 2850, image: "/images/pant36.jpeg" },
  ],
  "t-shirts": [
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt1.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt2.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt3.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt4.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt5.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt6.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt8.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt9.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt10.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt11.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt12.jpeg" },
    { id: 22, name: "T-Shirt ", price: 800, image: "/images/Tshirt13.jpeg" },
    { id: 21, name: "T-Shirt ", price: 700, image: "/images/Tshirt14.jpeg" },
  ],
};

const CategoryDetail = () => {
  const { categoryName } = useParams();
  const categoryProducts = products[categoryName] || [];

  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      toast("Removed from Wishlist", { icon: "❌" });
    } else {
      addToWishlist(product);
      toast.success("Added to Wishlist ❤️");
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to Cart 🛒`);
  };

  return (
    <div className="category-detail-page">
      <div className="product-container">
        {categoryProducts.map((product) => (
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
    </div>
  );
};

export default CategoryDetail;
