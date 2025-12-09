import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";
import heroImg from "../../assets/sale.jpg"; // Re-using existing asset for now

const Hero = () => {
    return (
        <div className="hero-section">
            <div className="hero-overlay"></div>
            <img src={heroImg} alt="Summer Sale" className="hero-bg-img" />

            <div className="hero-content container">
                <span className="hero-subtitle">New Arrival</span>
                <h1 className="hero-title">Discover Our <br /> New Collection</h1>
                <p className="hero-description">
                    Explore the latest trends in fashion and style.
                    Get up to 50% off on your first purchase.
                </p>
                <div className="hero-buttons">
                    <Link to="/Category" className="btn-primary">
                        Shop Now <ArrowRight size={20} />
                    </Link>
                    <Link to="/Category/Mens" className="btn-secondary">
                        View Men's
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
