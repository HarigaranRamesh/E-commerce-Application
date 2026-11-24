import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../../Context/CartContext";
import { AuthContext } from "../../Context/AuthContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { useSite } from "../../Context/SiteContext";
import { ShoppingBag, Heart, User, Search, Menu, X, ArrowRight } from "lucide-react";
import { productsAPI } from "../../services/api";
import { fetchGlobalSettings } from "../../services/strapi";
import { throttle } from "../../utils/performance";
import toast from "react-hot-toast";
import logo from "../../assets/mens_hub_logo.png";
import "./Navbar.css";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const { siteName, siteLogo, announcement: siteAnnouncement } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const announcement = siteAnnouncement;

  const totalItems = cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrolled(window.scrollY > 20);
    }, 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await productsAPI.getSuggestions(searchTerm.trim());
        setSuggestions(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleSelectSuggestion = (id) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/product/${id}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {announcement && (
        <div className="top-announcement-bar">
          <span>{announcement}</span>
        </div>
      )}
      <div className="navbar-container container">
        {/* Dynamic Logo & Title from CMS */}
        <Link to="/" className="logo">
          <img src={siteLogo || logo} alt={siteName || "Logo"} className="logo-img" />
          <span className="logo-text">{siteName || "Mens Hub"}</span>
        </Link>

        {/* Live Search Bar */}
        <div className="search-bar" ref={searchContainerRef}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search shirts, hoodies, cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleSearchSubmit}
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="search-suggestions-dropdown">
              {suggestions.length > 0 ? (
                <>
                  <div className="suggestions-header">Products & Suggestions</div>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="suggestion-item"
                      onClick={() => handleSelectSuggestion(item.id)}
                    >
                      <img src={item.image} alt={item.name} className="suggestion-thumb" />
                      <div className="suggestion-info">
                        <span className="suggestion-name">{item.name}</span>
                        <div className="suggestion-meta">
                          <span className="suggestion-category">{item.category}</span>
                          <span className="suggestion-price">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="suggestion-view-all"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                    }}
                  >
                    <span>View all results for "{searchTerm}"</span>
                    <ArrowRight size={14} />
                  </div>
                </>
              ) : (
                <div className="no-suggestions">No products matching "{searchTerm}"</div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="menu-toggler"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/Category" className="nav-item" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>

          <div className="nav-icons">
            <Link to="/Wishlist" className="nav-icon-link" onClick={() => setMenuOpen(false)}>
              <div className="icon-wrapper">
                <Heart size={22} />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </div>
              <span className="mobile-label">Wishlist</span>
            </Link>

            <Link to="/bag" className="nav-icon-link" onClick={() => setMenuOpen(false)}>
              <div className="icon-wrapper">
                <ShoppingBag size={22} />
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </div>
              <span className="mobile-label">Bag</span>
            </Link>

            {user ? (
              <div className="user-menu">
                <Link to="/profile" className="nav-icon-link" onClick={() => setMenuOpen(false)}>
                  <User size={22} />
                  <span className="mobile-label">Profile</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="admin-pill-link" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/Login" className="nav-icon-link" onClick={() => setMenuOpen(false)}>
                <div className="icon-wrapper">
                  <User size={22} />
                </div>
                <span className="mobile-label">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
