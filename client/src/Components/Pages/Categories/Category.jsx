import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Category.css";

const categories = [
  { id: 1, name: "Shirts", image: "/images/shirt13.jpeg" },
  { id: 2, name: "Hoodies", image: "/images/Hoodies.jpeg" },
  { id: 3, name: "Pants", image: "/images/pant6.jpeg" },
  { id: 4, name: "T-Shirts", image: "/images/tshirt.jpeg" },
];

const CategoryPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    toast.loading(`Opening ${categoryName}...`, { duration: 1500 });

    setTimeout(() => {
      navigate(`/category/${categoryName.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="category-page">
      <h2>Shop by Category</h2>
      <div className="category-container">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)}
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
            <h3>{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
