import React from "react";
import { useNavigate } from "react-router-dom";
import "./Category.css";

const categories = [
  { id: 1, name: "Shirts", slug: "shirts", image: "/images/shirt13.jpeg", count: "12+ Styles" },
  { id: 2, name: "Hoodies", slug: "hoodies", image: "/images/Hoodies.jpeg", count: "8+ Styles" },
  { id: 3, name: "Pants", slug: "pants", image: "/images/pant16.jpeg", count: "10+ Styles" },
  { id: 4, name: "T-Shirts", slug: "t-shirts", image: "/images/Tshirt6.jpeg", count: "15+ Styles" },
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
