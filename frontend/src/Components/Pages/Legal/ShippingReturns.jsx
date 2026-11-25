import React from "react";
import { Truck, RotateCcw, Clock, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSite } from "../../../Context/SiteContext";
import "./LegalStyles.css";

export default function ShippingReturns() {
  const { siteName, settings } = useSite();
  const brandName = siteName || "Clothings Store";
  const threshold = settings?.free_shipping_threshold || 999;

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <span className="legal-eyebrow">FAST & TRANSPARENT LOGISTICS</span>
          <h1 className="legal-title">Shipping & Returns</h1>
          <p className="legal-subtitle">
            Reliable doorstep delivery and effortless 15-day exchanges at {brandName}.
          </p>
        </div>

        {/* Content Card */}
        <div className="legal-card">
          <section className="legal-section">
            <h2>
              <Truck size={20} color="var(--luxury-gold, #d5a249)" />
              1. Domestic Shipping Tiers & Timelines
            </h2>
            <p>
              We partner with India's premier air express carriers (Bluedart, Delhivery, Xpressbees)
              to ensure your sartorial selections arrive securely and on schedule.
            </p>

            <div className="shipping-tiers-grid">
              <div className="shipping-tier-card">
                <span className="shipping-tier-badge">COMPLIMENTARY</span>
                <h3>Standard Express</h3>
                <div className="shipping-tier-price">
                  FREE <span style={{ fontSize: "0.85rem", color: "#64748b" }}>on orders ₹{threshold}+</span>
                </div>
                <p>
                  <strong>Timeline:</strong> 2–4 business days for Metros, 4–6 business days pan-India. Flat ₹60 on orders under ₹{threshold}.
                </p>
              </div>

              <div className="shipping-tier-card">
                <span className="shipping-tier-badge">PRIORITY EXPEDITED</span>
                <h3>Next-Day Priority</h3>
                <div className="shipping-tier-price">
                  ₹150 <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Flat</span>
                </div>
                <p>
                  <strong>Timeline:</strong> 24–48 hours delivery for Tier-1 cities. Guaranteed same-day fulfillment dispatch before 2:00 PM.
                </p>
              </div>
            </div>

            <div className="legal-highlight-box">
              <p>
                <strong>Live Order Tracking:</strong> As soon as your package leaves our fulfillment center,
                a tracking link and SMS update with your dedicated AWB number will be sent to your mobile.
                You can also track it in real time via your <Link to="/my-orders" style={{ color: "var(--luxury-navy, #2c4152)", fontWeight: 700 }}>My Orders</Link> dashboard.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>
              <RotateCcw size={20} color="var(--luxury-gold, #d5a249)" />
              2. 15-Day Doorstep Returns & Exchanges
            </h2>
            <p>
              We want you to be completely satisfied with every piece. If the size is not ideal
              or if you wish to exchange for another silhouette, we offer an effortless <strong>15-day return and exchange policy</strong> from the date of delivery.
            </p>

            <h3>How to Initiate a Return or Exchange:</h3>
            <ul>
              <li>Navigate to your <strong>My Orders</strong> tab in your profile.</li>
              <li>Locate the order and click <strong>"Request Return / Exchange"</strong>.</li>
              <li>Select your preferred resolution: Size Replacement or Full Refund.</li>
              <li>Our carrier partner will collect the parcel from your doorstep at zero pickup fee.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>
              <CheckCircle2 size={20} color="var(--luxury-gold, #d5a249)" />
              3. Condition Guidelines for Returns
            </h2>
            <p>To ensure a swift refund or exchange approval, returned items must comply with the following standards:</p>
            <ul>
              <li>Garments must be unworn, unwashed, and odor-free.</li>
              <li>All brand price tags, care labels, and security tags must remain securely attached.</li>
              <li>Items must be returned in their original packaging sleeve or box.</li>
              <li>Accessories, innerwear, and final sale items are exempt from returns for hygienic standards.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>
              <Clock size={20} color="var(--luxury-gold, #d5a249)" />
              4. Refund Processing Timelines
            </h2>
            <p>
              Once your returned item arrives at our inspection atelier, our quality team verifies the garment condition within 24 hours.
            </p>
            <ul>
              <li>
                <strong>UPI & Net Banking:</strong> 24–48 hours to reflect in your source account.
              </li>
              <li>
                <strong>Credit & Debit Cards:</strong> 5–7 business days depending on your issuing bank.
              </li>
              <li>
                <strong>Store Credit / Gift Vouchers:</strong> Instant credit to your account wallet.
              </li>
            </ul>

            <div className="legal-highlight-box">
              <p>
                Have questions regarding your delivery or exchange? Our concierge is on standby:
                <br />
                Email: <strong>{settings?.email || "harigaran925@gmail.com"}</strong> | Phone: <strong>{settings?.phone || "+91 97826260723"}</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
