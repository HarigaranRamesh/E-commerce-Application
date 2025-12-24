import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../Context/CartContext";
import { AuthContext } from "../../Context/AuthContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/mens_hub_logo.png";
import "./Navbar.css";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const totalItems =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text">Mens Hub</span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search?q=${e.target.value}`);
                setMenuOpen(false);
              }
            }}
          />
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
          <Link
            to="/Category"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>

          <div className="nav-icons">
            <Link
              to="/Wishlist"
              className="nav-icon-link"
              onClick={() => setMenuOpen(false)}
            >
              <div className="icon-wrapper">
                <Heart size={22} />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </div>
              <span className="mobile-label">Wishlist</span>
            </Link>

            <Link
              to="/bag"
              className="nav-icon-link"
              onClick={() => setMenuOpen(false)}
            >
              <div className="icon-wrapper">
                <ShoppingBag size={22} />
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </div>
              <span className="mobile-label">Bag</span>
            </Link>

            {user ? (
              <div className="user-menu">
                <Link
                  to="/profile"
                  className="nav-icon-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={22} />
                  <span className="mobile-label">Profile</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/Login"
                className="nav-icon-link"
                onClick={() => setMenuOpen(false)}
              >
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
