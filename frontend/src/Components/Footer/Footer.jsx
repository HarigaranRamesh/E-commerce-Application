import React from "react";
import "./Footer.css";
import { Twitter, Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import logo from "../../assets/mens_hub_logo.png";
import { useSite } from "../../Context/SiteContext";

export default function Footer() {
  const { siteName, siteLogo, settings } = useSite();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand">
          <div className="footer-logo-container">
            <img src={siteLogo || logo} alt={siteName || "Brand Logo"} className="footer-logo-img" />
            <h2 className="footer-logo-text">{siteName || settings?.site_name || "Mens Hub"}</h2>
          </div>
          <p className="footer-tagline">“{settings.tagline || "Quality products, Fresh Choices"}”</p>
          <p className="footer-about">{settings.about_text}</p>
        </div>

        <div className="footer-contacts">
          {settings.phone && (
            <p>
              <Phone className="icon" /> {settings.phone}
            </p>
          )}
          {settings.email && (
            <p>
              <Mail className="icon" /> {settings.email}
            </p>
          )}
          {settings.address && (
            <p>
              <MapPin className="icon" /> {settings.address}
            </p>
          )}
        </div>

        <div className="footer-section social">
          <div className="social-icons">
            {settings.twitter_url && (
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" title="Twitter">
                <Twitter className="icon" />
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                <Instagram className="icon" />
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                <Facebook className="icon" />
              </a>
            )}
          </div>
          <p>
            Stay updated with our latest offers and follow us for exclusive
            product insights. Connect with our community.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{settings.copyright_text || "© Copyright 2025 Mens Hub. All rights reserved."}</p>
        <div className="footer-links">
          {settings.footer_links && Array.isArray(settings.footer_links) ? (
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
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
