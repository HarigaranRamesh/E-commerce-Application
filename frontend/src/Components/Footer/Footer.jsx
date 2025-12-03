import React from "react";
import "./Footer.css";
import { Twitter, Instagram, Facebook, Phone, Mail, MapPin, } from "lucide-react";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand">
          <div className="footer-logo-container">
            <img src={logo} alt="Brand Logo" className="footer-logo-img" />
            <h2 className="footer-logo-text">Brand Originals</h2>
          </div>
          <p>“Quality products, Fresh Choices”</p>
          <p>
            “At Brand Originals , we believe in delivering premium quality products
            with an effortless shopping experience. We bring you an exclusive selection curated
            with care.”
          </p>
        </div>

        <div className="footer-contacts">
          <p>
            <Phone className="icon" /> 97826260723
          </p>
          <p>
            <Mail className="icon" /> harigaran925@gmail.com
          </p>
          <p>
            <MapPin className="icon" /> Kotagiri, Nilgiris, Tamil Nadu, India.
          </p>
        </div>

        <div className="footer-section social">
          <div className="social-icons">
            <a href=" "target="_blank" rel="noopener noreferrer">
              <Twitter className="icon" />
            </a>
            <a href=" " target="_blank" rel="noopener noreferrer">
              <Instagram className="icon" />
            </a>
            <a href="  " target="_blank"rel="noopener noreferrer">
              <Facebook className="icon" />
            </a>
          </div>
          <p>
            Stay updated with our latest offers and follow us for exclusive
            product insights. Connect with our community.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© Copyright 2025 Brand Originals. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">F.A.Q</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}
