import React from "react";
import { useNavigate } from "react-router-dom";
import "./Category.css";

const categories = [
  { id: 1, name: "Men's Wear", slug: "men", image: "/images/shirt1.jpeg", count: "40+ Styles" },
  { id: 2, name: "Women's Fashion", slug: "women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", count: "Dresses, Tops & Sets" },
  { id: 3, name: "Kids' Collection", slug: "kids", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80", count: "Boys & Girls Styles" },
  { id: 4, name: "Shirts & Tops", slug: "shirts", image: "/images/shirt13.jpeg", count: "Casual & Formal" },
  { id: 5, name: "Dresses & Gowns", slug: "dresses", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80", count: "Graceful Silhouettes" },
  { id: 6, name: "Hoodies & Winterwear", slug: "hoodies", image: "/images/Hoodies.jpeg", count: "Thermal Comfort" },
];

const CategoryPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug.toLowerCase()}`);
  };

  return (
    <div className="category-page">
      <h2>Shop by Category</h2>
      <div className="category-container">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <div className="category-image-wrapper">
              <img
                src={category.image}
                alt={category.name}
                className="category-image"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>

            <div className="category-info">
              <h3>{category.name}</h3>
              <span className="shop-link">Explore Collection</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
