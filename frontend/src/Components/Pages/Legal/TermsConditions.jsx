import React from "react";
import { Scale, CheckCircle2, AlertTriangle, FileCheck, HelpCircle } from "lucide-react";
import { useSite } from "../../../Context/SiteContext";
import "./LegalStyles.css";

export default function TermsConditions() {
  const { siteName, settings } = useSite();
  const brandName = siteName || "Clothings Store";

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <span className="legal-eyebrow">TERMS OF SERVICE</span>
          <h1 className="legal-title">Terms & Conditions</h1>
          <p className="legal-subtitle">
            Please read these terms carefully before accessing or shopping at {brandName}.
          </p>
          <div className="legal-last-updated">Last Revised: January 1, 2026</div>
        </div>

        {/* Content Card */}
        <div className="legal-card">
          <section className="legal-section">
            <h2>
              <Scale size={20} color="var(--luxury-gold, #d5a249)" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or placing an order on <strong>{brandName}</strong>, you agree to
              be bound by these Terms and Conditions, all applicable laws and regulations, and agree that
              you are responsible for compliance with any applicable local laws. If you do not agree with
              any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <FileCheck size={20} color="var(--luxury-gold, #d5a249)" />
              2. Account Registration & Security
            </h2>
            <p>
              To access certain features such as order tracking, saving favorite items to your wishlist,
              and faster one-click checkout, you may be required to create an account. You are solely
              responsible for maintaining the confidentiality of your login credentials and password,
              and for restricting access to your computer or mobile device.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <CheckCircle2 size={20} color="var(--luxury-gold, #d5a249)" />
              3. Product Pricing, Accuracy & Availability
            </h2>
            <p>
              All product prices are quoted in Indian Rupees (INR - ₹) and are inclusive of applicable
              Goods and Services Tax (GST). While we take every precaution to display garment colors,
              fabrics, and dimensions as accurately as possible, actual colors may vary slightly
              depending on your display screen calibration.
            </p>
            <p>
              We reserve the right to modify prices, discontinue products, or limit order quantities
              without prior notice. In the event of an inadvertent technical pricing error, we reserve the
              right to cancel the affected order and issue an immediate full refund.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <AlertTriangle size={20} color="var(--luxury-gold, #d5a249)" />
              4. Orders, Payments & Cancellations
            </h2>
            <p>
              All online payments must be successfully authorized through our Razorpay payment processor
              before order fulfillment begins. If an authorization fails, the order will not be processed.
            </p>
            <div className="legal-highlight-box">
              <p>
                <strong>Order Cancellation Window:</strong> You may cancel any order free of charge within
                <strong> 1 hour</strong> of placement directly via the 'My Orders' portal. After an order has been
                manifested and dispatched to our logistics carrier, it cannot be canceled in transit, but you
                can request a doorstep return once received.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>
              <Scale size={20} color="var(--luxury-gold, #d5a249)" />
              5. Intellectual Property
            </h2>
            <p>
              All content on this website—including brand logos, product descriptions, imagery, styling,
              UI icons, and website code—is the exclusive intellectual property of {brandName} and is protected
              by Indian and international copyright and trademark laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <HelpCircle size={20} color="var(--luxury-gold, #d5a249)" />
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws
              of the Republic of India. Any disputes arising out of or in connection with these terms
              shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
            </p>
            <div className="legal-highlight-box">
              <p>
                For legal inquiries: <strong>{settings?.email || "harigaran925@gmail.com"}</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
