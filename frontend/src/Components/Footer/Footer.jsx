import React from "react";
import "./Footer.css";
import { Twitter, Instagram, Facebook, Phone, Mail, MapPin, RefreshCw, ShieldCheck, Award } from "lucide-react";
import logo from "../../assets/mens_hub_logo.png";
import { useSite } from "../../Context/SiteContext";

export default function Footer() {
  const { siteName, siteLogo, settings } = useSite();

  return (
    <footer className="footer">
      {/* Luxury Trust Bar */}
      <div className="footer-trust-bar">
        <div className="footer-trust-container">
          <div className="trust-item">
            <div className="trust-icon-box">
              <RefreshCw size={22} className="trust-icon" />
            </div>
            <div className="trust-text">
              <h4>EASY EXCHANGE</h4>
              <p>15 Days Easy Return & Exchange</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <ShieldCheck size={24} className="trust-icon" />
            </div>
            <div className="trust-text">
              <h4>100% HANDPICKED</h4>
              <p>Curated & Authentic Products</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Award size={24} className="trust-icon" />
            </div>
            <div className="trust-text">
              <h4>ASSURED QUALITY</h4>
              <p>Quality Checked By Experts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Luxury Navy Footer Body */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-section brand">
            <div className="footer-logo-container">
              <img src={siteLogo || logo} alt={siteName || "Brand Logo"} className="footer-logo-img" />
              <h2 className="footer-logo-text">{siteName || settings?.site_name || "CLOTHINGS STORE"}</h2>
            </div>
            <p className="footer-tagline">“{settings?.tagline || "Quality Products, Fresh Choices"}”</p>
            {settings?.about_text && <p className="footer-about">{settings.about_text}</p>}
          </div>

          <div className="footer-section contacts">
            <h3>Customer Care</h3>
            <div className="footer-contacts-list">
              {settings?.phone && (
                <p>
                  <Phone size={16} className="contact-icon" /> <span>{settings.phone}</span>
                </p>
              )}
              {settings?.email && (
                <p>
                  <Mail size={16} className="contact-icon" /> <span>{settings.email}</span>
                </p>
              )}
              {settings?.address && (
                <p>
                  <MapPin size={16} className="contact-icon" /> <span>{settings.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="footer-section social">
            <h3>Connect With Us</h3>
            <p className="social-text">
              Stay updated with our latest collections, exclusive drops and seasonal offers.
            </p>
            <div className="social-icons">
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" title="Twitter" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Deep Subfooter Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright-text">{settings?.copyright_text || "© Copyright 2025 Clothings Store. All rights reserved."}</p>
          <div className="footer-links">
            {settings?.footer_links && Array.isArray(settings.footer_links) ? (
              settings.footer_links.map((link, idx) => (
                <a key={idx} href={link.url || "#"}>
                  {link.label || link.name}
                </a>
              ))
            ) : (
              <>
                <a href="#">F.A.Q</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms & Conditions</a>
                <a href="#">Shipping & Returns</a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
