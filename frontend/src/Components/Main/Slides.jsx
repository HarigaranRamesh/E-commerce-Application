import React, { useEffect, useRef } from "react";
import "./Slider.css";

import saleImg from "../../assets/sale.jpg";
import manImg from "../../assets/man.jpg";

export default function Slides() {
  const carouselRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const slides = document.querySelectorAll(".carousel-item");
    const totalSlides = slides.length;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        index = (index + 1) % totalSlides;
        carouselRef.current.style.transform = `translateX(-${index * 100}%)`;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      <div className="slider-title">
        <h1>Welcome to our Store</h1>
        <p>Up to 50% off!</p>
      </div>

      <div className="carousel-wrapper">
        <div ref={carouselRef} className="carousel">
          <div className="carousel-item">
            <img
              src={saleImg} // ✅ use imported variable
              alt="Slide 1"
              className="carousel-img"
            />
            <h2>Sale Up To 50%!</h2>
            <p>Hurry up! Sale will end soon.</p>
          </div>

          <div className="carousel-item">
            <img
              src={manImg} // ✅ use imported variable
              alt="Slide 2"
              className="carousel-img"
            />
            <h2>New Season</h2>
            <p>Time for change</p>
          </div>
        </div>
      </div>
    </div>
  );
}
