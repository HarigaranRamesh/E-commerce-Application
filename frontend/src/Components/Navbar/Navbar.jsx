import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import { CartContext } from "../../Context/CartContext";
import { AuthContext } from "../../Context/AuthContext";
import { WishlistContext } from "../../Context/WishlistContext";
import { ShoppingCart, Heart, User } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    toast.success("Logged out successfully", {
      style: {
        background: "#01579b",
        color: "#fff",
      },
    });
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text">Brand Originals</span>
        </Link>

        {/* Hamburger Toggler */}
        <button
          className={`menu-toggler ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
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
            Categories
          </Link>
          <Link
            to="/Wishlist"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            <Heart className="icon" />
            {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            Wishlist
          </Link>
          <Link
            to="/Cart"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingCart className="icon" />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            Cart
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="nav-item"
                onClick={() => setMenuOpen(false)}
              >
                <User className="icon" />
                Profile
              </Link>
              <button onClick={handleLogout} className="auth-button logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Login"
                className="auth-button login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/Signup"
                className="auth-button signup"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
