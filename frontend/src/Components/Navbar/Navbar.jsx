import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../../Context/CartContext";
import { AuthContext } from "../../Context/AuthContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { useSite } from "../../Context/SiteContext";
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight, ChevronDown, Package, User, MapPin } from "lucide-react";
import { productsAPI } from "../../services/api";
import { throttle } from "../../utils/performance";
import toast from "react-hot-toast";
import logo from "../../assets/mens_hub_logo.png";
import "./Navbar.css";

const CATEGORY_MENUS = [
  {
    name: "MEN",
    slug: "men",
    items: [
      { label: "All Men's Wear", link: "/Category" },
      { label: "Shirts", link: "/category/shirts" },
      { label: "T-Shirts", link: "/category/t-shirts" },
      { label: "Pants & Trousers", link: "/category/pants" },
      { label: "Hoodies & Sweatshirts", link: "/category/hoodies" },
    ],
  },
  {
    name: "SHIRTS",
    slug: "shirts",
    items: [
      { label: "All Shirts", link: "/category/shirts" },
      { label: "Casual Shirts", link: "/category/shirts" },
      { label: "Formal Shirts", link: "/category/shirts" },
      { label: "Printed Shirts", link: "/category/shirts" },
    ],
  },
  {
    name: "T-SHIRTS",
    slug: "t-shirts",
    items: [
      { label: "All T-Shirts", link: "/category/t-shirts" },
      { label: "Crew Neck Tees", link: "/category/t-shirts" },
      { label: "Oversized Tees", link: "/category/t-shirts" },
      { label: "Polo T-Shirts", link: "/category/t-shirts" },
    ],
  },
  {
    name: "PANTS",
    slug: "pants",
    items: [
      { label: "All Pants", link: "/category/pants" },
      { label: "Chinos", link: "/category/pants" },
      { label: "Cargo Pants", link: "/category/pants" },
      { label: "Slim Fit Trousers", link: "/category/pants" },
    ],
  },
  {
    name: "HOODIES",
    slug: "hoodies",
    items: [
      { label: "All Hoodies", link: "/category/hoodies" },
      { label: "Pullover Hoodies", link: "/category/hoodies" },
      { label: "Zip Hoodies", link: "/category/hoodies" },
      { label: "Winter Sweatshirts", link: "/category/hoodies" },
    ],
  },
];

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const { siteName, siteLogo, announcement } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategoryMenu, setActiveCategoryMenu] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

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
      executeSearch();
    }
  };

  const executeSearch = () => {
    if (!searchTerm.trim()) return;
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    setMenuOpen(false);
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
    setAccountMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className={`header-wrapper ${scrolled ? "scrolled" : ""}`}>
      {/* Announcement Banner if configured */}
      {announcement && (
        <div className="top-announcement-bar">
          <span>{announcement}</span>
        </div>
      )}

      {/* 1. Top Utility Row (Right Aligned User & My Account Links) */}
      <div className="top-utility-bar">
        <div className="top-utility-container">
          <div className="top-utility-right">
            {user ? (
              <div className="account-nav-group">
                <Link to="/profile" className="utility-link user-name-link">
                  {user.name || "Harigaran"}
                </Link>

                {/* My Account with Hover Dropdown */}
                <div
                  className="my-account-dropdown-wrapper"
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <Link to="/profile" className="utility-link my-account-link">
                    <span>My Account</span>
                    <ChevronDown size={12} className={`account-chevron ${accountMenuOpen ? "open" : ""}`} />
                  </Link>

                  {accountMenuOpen && (
                    <div className="my-account-submenu">
                      <Link
                        to="/profile?tab=orders"
                        className="account-submenu-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Package size={14} /> <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile?tab=personal"
                        className="account-submenu-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <User size={14} /> <span>Personal Information</span>
                      </Link>
                      <Link
                        to="/profile?tab=address"
                        className="account-submenu-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <MapPin size={14} /> <span>Address Book</span>
                      </Link>
                    </div>
                  )}
                </div>

                <button type="button" onClick={handleLogout} className="utility-btn signout-btn">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/Login" className="utility-link">
                Sign In / Join
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="main-navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName || "Logo"} className="brand-logo-img" />
            ) : (
              <img src={logo} alt={siteName || "Logo"} className="brand-logo-img" />
            )}
            <span className="brand-logo-text">{siteName || "MENS HUB"}</span>
          </Link>

          {/* Category Dropdowns Navigation */}
          <div className="nav-categories">
            {CATEGORY_MENUS.map((cat) => (
              <div
                key={cat.name}
                className="category-dropdown-wrapper"
                onMouseEnter={() => setActiveCategoryMenu(cat.name)}
                onMouseLeave={() => setActiveCategoryMenu(null)}
              >
                <button
                  type="button"
                  className={`category-nav-link ${activeCategoryMenu === cat.name ? "active" : ""}`}
                  onClick={() => navigate(cat.items[0]?.link || `/category/${cat.slug}`)}
                >
                  <span>{cat.name}</span>
                  <ChevronDown size={13} className="category-chevron" />
                </button>

                {/* Dropdown Menu */}
                {activeCategoryMenu === cat.name && (
                  <div className="category-submenu">
                    {cat.items.map((sub, idx) => (
                      <Link
                        key={idx}
                        to={sub.link}
                        className="submenu-link"
                        onClick={() => setActiveCategoryMenu(null)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Action Group: Pill Search + Dark Circular Icons */}
          <div className="nav-right-group">
            {/* Pill Search Input */}
            <div className="pill-search-container" ref={searchContainerRef}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                onKeyDown={handleSearchSubmit}
                className="pill-search-input"
              />
              <button
                type="button"
                className="pill-search-btn"
                onClick={executeSearch}
                aria-label="Search"
              >
                <Search size={16} />
              </button>

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

            {/* Dark Circular Wishlist Button */}
            <Link to="/Wishlist" className="dark-circle-btn" title="Wishlist" aria-label="Wishlist">
              <Heart size={18} strokeWidth={2.2} />
              {wishlistCount > 0 && <span className="circle-badge">{wishlistCount}</span>}
            </Link>

            {/* Dark Circular Bag Button */}
            <Link to="/bag" className="dark-circle-btn" title="Shopping Bag" aria-label="Bag">
              <ShoppingBag size={18} strokeWidth={2.2} />
              {totalItems > 0 && <span className="circle-badge">{totalItems}</span>}
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-user-row">
              {user ? (
                <div>
                  <span className="mobile-greeting">Welcome, {user.name || "Harigaran"}</span>
                  <div className="mobile-user-links">
                    <Link to="/profile?tab=orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    <Link to="/profile?tab=personal" onClick={() => setMenuOpen(false)}>Personal Info</Link>
                    <Link to="/profile?tab=address" onClick={() => setMenuOpen(false)}>Address Book</Link>
                    <button type="button" onClick={handleLogout}>Sign Out</button>
                  </div>
                </div>
              ) : (
                <Link to="/Login" className="mobile-login-link" onClick={() => setMenuOpen(false)}>
                  Sign In / Join
                </Link>
              )}
            </div>

            <div className="mobile-categories-list">
              {CATEGORY_MENUS.map((cat) => (
                <div key={cat.name} className="mobile-category-block">
                  <div className="mobile-cat-header">{cat.name}</div>
                  <div className="mobile-subcat-links">
                    {cat.items.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.link}
                        onClick={() => setMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
