import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";
import heroImg from "../../assets/hero_model_clean.png";

const Hero = () => {
    return (
        <div className="hero-section">
            <div className="hero-overlay"></div>
            <img src={heroImg} alt="Summer Sale" className="hero-bg-img" />

            <div className="hero-content container">
                <div className="hero-text-wrapper">
                    <h1 className="hero-sale-title">
                        <span className="d-block text-sale">SALE</span>
                        <span className="d-block text-upto">UP TO</span>
                        <span className="d-block text-percentage">60%</span>
                    </h1>
                </div>

                <div className="hero-buttons">
                    <Link to="/Category" className="btn-primary">
                        Shop Now <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
