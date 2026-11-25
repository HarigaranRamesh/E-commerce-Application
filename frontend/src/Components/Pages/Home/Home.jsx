import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductList from "../../Main/ProductList";
import Hero from "../../Main/Hero";
import ServiceFeatures from "../../Main/ServiceFeatures";
import { ArrowRight, Sparkles, Flame, Award, Zap, History } from "lucide-react";
import { fetchCuratedCategories } from "../../../services/sanity";
import { toast } from "react-hot-toast";
import "./Home.css";

const DEFAULT_CATEGORIES = [
  { name: "Men's Wear", slug: "men", image: "/images/shirt1.jpeg", count: "40+ Styles" },
  { name: "Women's Fashion", slug: "women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", count: "Trending Dresses & Tops" },
  { name: "Kids' Collection", slug: "kids", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80", count: "Boys & Girls Styles" },
  { name: "Shirts & Trousers", slug: "shirts", image: "/images/shirt13.jpeg", count: "Timeless Essentials" },
];

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  const [visitedTabs, setVisitedTabs] = useState({ featured: true });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

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
        if (isMounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
  };

  // Load recently viewed products
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const seen = new Set();
      const unique = (items || []).filter((item) => {
        const id = String(item.id);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      setRecentlyViewed(unique.slice(0, 5));
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing! Check your email for a special gift 🎁");
    setNewsletterEmail("");
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero />

      {/* Service Highlights */}
      <ServiceFeatures />

      {/* Featured Categories */}
      <div className="container home-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <span className="section-eyebrow">CURATED WARDROBE</span>
            <h2>Shop by Category</h2>
            <p className="section-subtitle">Explore our handpicked collection for every occasion</p>
          </div>
          <Link to="/Category" className="view-all-link">
            Explore All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="home-categories-grid">
          {loadingCategories && categories.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="home-category-card skeleton-card" style={{ height: "380px" }}>
                <div className="skeleton-box" style={{ width: "100%", height: "100%" }}></div>
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <div
                key={cat.slug}
                className="home-category-card"
                onClick={() => navigate(`/category/${cat.slug}`)}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="home-category-img"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.png";
                  }}
                />
                <div className="home-category-overlay">
                  <div className="home-category-info">
                    <h3 className="home-category-name">{cat.name}</h3>
                    <span className="home-category-count">{cat.count}</span>
                  </div>
                  <div className="home-category-cta">
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Curated Product Collections with Tabs */}
      <div className="container home-section">
        <div className="text-center">
          <span className="section-eyebrow" style={{ display: "inline-block", marginBottom: "8px" }}>
            PREMIUM SELECTION
          </span>
          <h2 style={{ fontSize: "2.1rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
            Curated Collections
          </h2>
          <p className="section-subtitle">
            Premium menswear designed for maximum comfort, versatility, and modern aesthetics
          </p>
        </div>

        {/* Collection Selector Tabs */}
        <div className="home-tabs-container">
          <button
            className={`home-tab-btn ${activeTab === "featured" ? "active" : ""}`}
            onClick={() => handleTabChange("featured")}
          >
            <Sparkles size={16} style={{ display: "inline", marginRight: "6px" }} />
            Featured
          </button>
          <button
            className={`home-tab-btn ${activeTab === "trending" ? "active" : ""}`}
            onClick={() => handleTabChange("trending")}
          >
            <Flame size={16} style={{ display: "inline", marginRight: "6px" }} />
            Trending Now
          </button>
          <button
            className={`home-tab-btn ${activeTab === "bestsellers" ? "active" : ""}`}
            onClick={() => handleTabChange("bestsellers")}
          >
            <Award size={16} style={{ display: "inline", marginRight: "6px" }} />
            Best Sellers
          </button>
          <button
            className={`home-tab-btn ${activeTab === "newarrivals" ? "active" : ""}`}
            onClick={() => handleTabChange("newarrivals")}
          >
            <Zap size={16} style={{ display: "inline", marginRight: "6px" }} />
            New Arrivals
          </button>
        </div>

        {/* Dynamic Product Showcase */}
        <div className="home-collection-showcase">
          <div className="tab-pane" style={{ display: activeTab === "featured" ? "block" : "none" }}>
            <ProductList featured={true} limit={8} />
          </div>
          {visitedTabs.trending && (
            <div className="tab-pane" style={{ display: activeTab === "trending" ? "block" : "none" }}>
              <ProductList sort="views" limit={8} />
            </div>
          )}
          {visitedTabs.bestsellers && (
            <div className="tab-pane" style={{ display: activeTab === "bestsellers" ? "block" : "none" }}>
              <ProductList minRating={4.5} sort="rating" limit={8} />
            </div>
          )}
          {visitedTabs.newarrivals && (
            <div className="tab-pane" style={{ display: activeTab === "newarrivals" ? "block" : "none" }}>
              <ProductList sort="newest" limit={8} />
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="container home-section">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={24} color="#01579b" /> Recently Viewed
              </h2>
              <p className="section-subtitle">Pick up right where you left off</p>
            </div>
          </div>

          <div className="recently-viewed-grid">
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                className="recent-item-card"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="recent-item-img"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.png";
                  }}
                />
                <div className="recent-item-info">
                  <h4 className="recent-item-title">{item.name}</h4>
                  <p className="recent-item-price">
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="container">
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h3>Join the Clothings Store VIP Club</h3>
            <p>
              Subscribe to get exclusive early access to drops, member-only discounts, and style tips.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
