import React from "react";
import { ArrowRight, Sparkles, Compass, ShieldCheck, Truck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";
import heroImg from "../../assets/hero_model_clean.png";

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-overlay"></div>
            <img src={heroImg} alt="Clothings Store Fashion Model" className="hero-bg-img" />

            <div className="hero-content container">
                <div className="hero-text-wrapper">
                    {/* Eyebrow Badge */}
                    <div className="hero-badge">
                        <Sparkles size={14} className="hero-badge-icon" />
                        <span>NEW SEASON ARRIVALS • MEN • WOMEN • KIDS</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="hero-title">
                        Elevated Fashion For The <br />
                        <span className="hero-title-gradient">Entire Family</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle">
                        Discover handcrafted men's wear, elegant women's couture, and vibrant kids'
                        essentials crafted with premium fabrics and unmatched comfort.
                    </p>

                    {/* CTAs */}
                    <div className="hero-buttons">
                        <Link to="/Category" className="hero-btn-primary">
                            Explore Collection <ArrowRight size={18} />
                        </Link>
                        <Link to="/search" className="hero-btn-glass">
                            Browse All <Compass size={18} />
                        </Link>
                    </div>

                    {/* Floating Trust Pills */}
                    <div className="hero-trust-bar">
                        <div className="trust-pill">
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span><strong>4.9/5</strong> Rating</span>
                        </div>
                        <div className="trust-pill">
                            <Truck size={14} color="#0284c7" />
                            <span>Free Express Shipping</span>
                        </div>
                        <div className="trust-pill">
                            <ShieldCheck size={14} color="#10b981" />
                            <span>100% Cotton Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
