import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCuratedCategories } from "../../../services/sanity";
import "./Category.css";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Men's Wear", slug: "men", image: "/images/shirt1.jpeg", count: "40+ Styles" },
  { id: 2, name: "Women's Fashion", slug: "women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", count: "Dresses, Tops & Sets" },
  { id: 3, name: "Kids' Collection", slug: "kids", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80", count: "Boys & Girls Styles" },
  { id: 4, name: "Shirts & Tops", slug: "shirts", image: "/images/shirt13.jpeg", count: "Casual & Formal" },
  { id: 5, name: "Dresses & Gowns", slug: "dresses", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80", count: "Graceful Silhouettes" },
  { id: 6, name: "Hoodies & Winterwear", slug: "hoodies", image: "/images/Hoodies.jpeg", count: "Thermal Comfort" },
];

const CategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const dynamicCats = await fetchCuratedCategories();
        if (isMounted) {
          if (dynamicCats && dynamicCats.length > 0) {
            setCategories(dynamicCats);
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        }
      } catch (err) {
        if (isMounted) setCategories(DEFAULT_CATEGORIES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug.toLowerCase()}`);
  };

  return (
    <div className="category-page">
      <div className="category-page-header">
        <span className="section-eyebrow">CURATED WARDROBE</span>
        <h2>Shop by Category</h2>
        <p className="section-subtitle">Explore our handpicked collection for every occasion</p>
      </div>
      <div className="category-container">
        {loading && categories.length === 0 ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="category-card skeleton-card">
              <div className="category-image-wrapper skeleton-box" style={{ height: "80%" }}></div>
              <div className="category-info" style={{ padding: "16px" }}>
                <div className="skeleton-line" style={{ width: "60%", height: "18px", margin: "0 auto 8px" }}></div>
                <div className="skeleton-line" style={{ width: "40%", height: "12px", margin: "0 auto" }}></div>
              </div>
            </div>
          ))
        ) : (
          categories.map((category, idx) => (
            <div
              key={category.id || category.slug || idx}
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
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
