import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchHeroBanners } from "../../services/sanity";
import "./Hero.css";

import heroModelImg from "../../assets/hero_model_clean.png";
import saleImg from "../../assets/sale.jpg";
import manImg from "../../assets/man.jpg";

const DEFAULT_BANNER_SLIDES = [
  {
    id: 1,
    image: heroModelImg,
    alt: "Clothings Store Signature Collection",
    link: "/Category",
  },
  {
    id: 2,
    image: saleImg,
    alt: "Season Sale - Up to 60% Off",
    link: "/Category",
  },
  {
    id: 3,
    image: manImg,
    alt: "Men's Luxury Essentials",
    link: "/category/men",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    alt: "Women's Designer Fashion",
    link: "/category/women",
  },
];

const Hero = () => {
  const [slides, setSlides] = useState(DEFAULT_BANNER_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const dynamicBanners = await fetchHeroBanners();
        if (isMounted && dynamicBanners && dynamicBanners.length > 0) {
          setSlides(dynamicBanners);
        }
      } catch (err) {
        console.warn("Could not load dynamic hero banners:", err);
      }
    };
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handlePrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id || index} className="hero-slide-item">
            <Link to={slide.link || "/Category"} className="hero-slide-link" title={slide.alt || slide.title}>
              <img
                src={slide.image}
                alt={slide.alt || slide.title}
                className="hero-bg-img"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            className="hero-nav-arrow prev"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            type="button"
            className="hero-nav-arrow next"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={28} />
          </button>

          {/* Pagination Indicators */}
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
        </>
      )}
    </section>
  );
};

export default Hero;
