import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductList from "../../Main/ProductList";
import Hero from "../../Main/Hero";
import ServiceFeatures from "../../Main/ServiceFeatures";
import { Tag, Copy, Check, ArrowRight, Sparkles, Flame, Award, Zap, History } from "lucide-react";
import { toast } from "react-hot-toast";
import "./Home.css";

const categories = [
  { name: "Shirts", slug: "shirts", image: "/images/shirt13.jpeg", count: "12+ Items" },
  { name: "Hoodies", slug: "hoodies", image: "/images/Hoodies.jpeg", count: "8+ Items" },
  { name: "Pants", slug: "pants", image: "/images/pant16.jpeg", count: "10+ Items" },
  { name: "T-Shirts", slug: "t-shirts", image: "/images/Tshirt6.jpeg", count: "15+ Items" },
];

const coupons = [
  { code: "WELCOME10", desc: "10% OFF on 1st Order", min: "₹500" },
  { code: "SUPER20", desc: "20% OFF Orders over ₹1500", min: "₹1,500" },
  { code: "FREESHIP", desc: "Free Express Shipping", min: "₹999" },
];

function Home() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState("featured");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Countdown timer for Flash Sale (counts down to 14h 22m 45s)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 22,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

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

      {/* Interactive Voucher Bar */}
      <div className="promo-bar">
        <div className="container promo-bar-inner">
          <div className="promo-bar-title">
            <Tag size={20} />
            <span>Exclusive Deals & Promo Codes</span>
          </div>
          <div className="promo-coupons-rail">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="promo-coupon-badge"
                onClick={() => handleCopyCoupon(c.code)}
                title="Click to copy coupon code"
              >
                <span className="coupon-code-text">{c.code}</span>
                <span>•</span>
                <span>{c.desc}</span>
                {copiedCode === c.code ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Highlights */}
      <ServiceFeatures />

      {/* Featured Categories */}
      <div className="container home-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h2>Shop by Category</h2>
            <p className="section-subtitle">Explore our handpicked collection for every occasion</p>
          </div>
          <Link to="/Category" className="view-all-link">
            Explore All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="home-categories-grid">
          {categories.map((cat) => (
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
                <h3 className="home-category-name">{cat.name}</h3>
                <span className="home-category-count">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Product Collections with Tabs */}
      <div className="container home-section">
        <div className="text-center">
          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0" }}>
            Curated Collections
          </h2>
          <p className="section-subtitle">
            Premium menswear designed for maximum comfort and unmatched style
          </p>
        </div>

        {/* Collection Selector Tabs */}
        <div className="home-tabs-container">
          <button
            className={`home-tab-btn ${activeTab === "featured" ? "active" : ""}`}
            onClick={() => setActiveTab("featured")}
          >
            <Sparkles size={16} style={{ display: "inline", marginRight: "6px" }} />
            Featured
          </button>
          <button
            className={`home-tab-btn ${activeTab === "trending" ? "active" : ""}`}
            onClick={() => setActiveTab("trending")}
          >
            <Flame size={16} style={{ display: "inline", marginRight: "6px" }} />
            Trending Now
          </button>
          <button
            className={`home-tab-btn ${activeTab === "bestsellers" ? "active" : ""}`}
            onClick={() => setActiveTab("bestsellers")}
          >
            <Award size={16} style={{ display: "inline", marginRight: "6px" }} />
            Best Sellers
          </button>
          <button
            className={`home-tab-btn ${activeTab === "newarrivals" ? "active" : ""}`}
            onClick={() => setActiveTab("newarrivals")}
          >
            <Zap size={16} style={{ display: "inline", marginRight: "6px" }} />
            New Arrivals
          </button>
        </div>

        {/* Dynamic Product Showcase */}
        {activeTab === "featured" && <ProductList featured={true} limit={8} />}
        {activeTab === "trending" && <ProductList sort="views" limit={8} />}
        {activeTab === "bestsellers" && <ProductList minRating={4.5} sort="rating" limit={8} />}
        {activeTab === "newarrivals" && <ProductList sort="newest" limit={8} />}
      </div>

      {/* Flash Sale Banner with Countdown */}
      <div className="container">
        <div className="countdown-banner">
          <div className="countdown-info">
            <span
              style={{
                display: "inline-block",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                fontWeight: "700",
                fontSize: "0.85rem",
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "12px",
              }}
            >
              LIMITED TIME OFFER
            </span>
            <h3>Mid-Season Flash Sale - Up to 60% OFF</h3>
            <p>
              Grab our trending wardrobe essentials at unbeatable prices. Extra 20% off on checkout
              with code <strong>SUPER20</strong>.
            </p>
            <div className="timer-boxes">
              <div className="timer-box">
                <span className="timer-num">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="timer-lbl">Hours</span>
              </div>
              <div className="timer-box">
                <span className="timer-num">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="timer-lbl">Mins</span>
              </div>
              <div className="timer-box">
                <span className="timer-num">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="timer-lbl">Secs</span>
              </div>
            </div>
          </div>
          <button className="countdown-cta" onClick={() => navigate("/search?discount=true")}>
            Shop Flash Deals Now
          </button>
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
            <h3>Join the Mens Hub VIP Club</h3>
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
