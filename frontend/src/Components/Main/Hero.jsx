import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchHeroBanners } from "../../services/sanity";
import "./Hero.css";

import heroSaleSweaterImg from "../../assets/hero_sale_sweater.png";
import heroModelImg from "../../assets/hero_model_clean.png";
import saleImg from "../../assets/sale.jpg";
import manImg from "../../assets/man.jpg";

const DEFAULT_BANNER_SLIDES = [
  {
    id: 1,
    image: heroSaleSweaterImg,
    alt: "Winter Knitwear & Luxury Sweaters",
    link: "/Category",
  },
  {
    id: 2,
    image: heroModelImg,
    alt: "Clothings Store Signature Collection",
    link: "/Category",
  },
  {
    id: 3,
    image: saleImg,
    alt: "Season Sale - Up to 60% Off",
    link: "/Category",
  },
  {
    id: 4,
    image: manImg,
    alt: "Men's Luxury Essentials",
    link: "/category/men",
  },
];

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const dynamicBanners = await fetchHeroBanners();
        if (isMounted) {
          if (dynamicBanners && dynamicBanners.length > 0) {
            setSlides(dynamicBanners);
          } else {
            setSlides(DEFAULT_BANNER_SLIDES);
          }
        }
      } catch (err) {
        if (isMounted) setSlides(DEFAULT_BANNER_SLIDES);
      } finally {
        if (isMounted) setLoading(false);
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
    }, 2000);
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

  if (loading && slides.length === 0) {
    return (
      <section className="hero-section hero-skeleton-wrapper" aria-busy="true">
        <div className="hero-skeleton-shimmer">
          <div className="hero-skeleton-content">
            <div className="hero-skeleton-pill"></div>
            <div className="hero-skeleton-title"></div>
            <div className="hero-skeleton-desc"></div>
            <div className="hero-skeleton-btn"></div>
          </div>
        </div>
      </section>
    );
  }

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
