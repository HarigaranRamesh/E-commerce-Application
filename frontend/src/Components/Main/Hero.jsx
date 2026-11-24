import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Hero.css";

import saleImg from "../../assets/sale.jpg";
import manImg from "../../assets/man.jpg";

const slides = [
  {
    id: 1,
    image: saleImg,
    alt: "Exclusive Fashion Sale - Curated Wardrobe",
    link: "/Category",
  },
  {
    id: 2,
    image: manImg,
    alt: "Men's Signature Styles",
    link: "/category/men",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    alt: "Women's Haute Couture & Trending Fashion",
    link: "/category/women",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    alt: "Kids Everyday Comfort & Classics",
    link: "/category/kids",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = slides.length;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div
      className="hero-banner-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="hero-slide-item">
            <Link to={slide.link} className="hero-slide-link">
              <img
                src={slide.image}
                alt={slide.alt}
                className="hero-slide-img"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Nav Arrows */}
      <button
        type="button"
        className="hero-nav-arrow prev"
        onClick={handlePrev}
        aria-label="Previous Banner"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        className="hero-nav-arrow next"
        onClick={handleNext}
        aria-label="Next Banner"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="hero-slider-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`hero-dot ${idx === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
