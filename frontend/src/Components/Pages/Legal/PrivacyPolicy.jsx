import React from "react";
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck } from "lucide-react";
import { useSite } from "../../../Context/SiteContext";
import "./LegalStyles.css";

export default function PrivacyPolicy() {
  const { siteName, settings } = useSite();
  const brandName = siteName || "Clothings Store";

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <span className="legal-eyebrow">LEGAL & COMPLIANCE</span>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            How we protect, process, and safeguard your personal data at {brandName}.
          </p>
          <div className="legal-last-updated">Effective Date: January 1, 2026</div>
        </div>

        {/* Content Card */}
        <div className="legal-card">
          <section className="legal-section">
            <h2>
              <ShieldCheck size={20} color="var(--luxury-gold, #d5a249)" />
              1. Overview & Commitment
            </h2>
            <p>
              At <strong>{brandName}</strong>, we are committed to respecting and protecting the
              privacy of our patrons. This Privacy Policy details how we collect, handle, store,
              and safeguard your personal information when you visit our storefront, register an account,
              or complete purchases through our platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <Database size={20} color="var(--luxury-gold, #d5a249)" />
              2. Information We Collect
            </h2>
            <p>We only collect data necessary to provide seamless shopping and fulfillment services:</p>
            <ul>
              <li>
                <strong>Identity Information:</strong> Full name, email address, contact phone number, and account credentials.
              </li>
              <li>
                <strong>Delivery Information:</strong> Physical shipping address, pin code, state, city, and delivery instructions.
              </li>
              <li>
                <strong>Transaction Data:</strong> Order reference IDs, items ordered, payment status, and invoices.
              </li>
              <li>
                <strong>Technical & Device Data:</strong> IP address, browser type, operating system, and navigation patterns via essential session cookies.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>
              <Lock size={20} color="var(--luxury-gold, #d5a249)" />
              3. Payment Security & Encryption
            </h2>
            <div className="legal-highlight-box">
              <p>
                <strong>Zero Card Storage Guarantee:</strong> All payment transactions on {brandName} are
                executed via <strong>Razorpay Payment Gateway</strong>, a certified PCI-DSS Level 1 compliant provider.
                We never store, log, or have access to your full credit card numbers, debit card PINs, or CVV codes.
              </p>
            </div>
            <p>
              All communications between your device and our servers are encrypted using industry-standard
              <strong> Transport Layer Security (TLS 1.3 / SSL)</strong> with 256-bit encryption keys.
            </p>
          </section>

          <section className="legal-section">
            <h2>
              <FileText size={20} color="var(--luxury-gold, #d5a249)" />
              4. How We Use Your Information
            </h2>
            <p>Your data is used strictly for the following purposes:</p>
            <ul>
              <li>Processing, packaging, and dispatching your merchandise orders.</li>
              <li>Sending live delivery tracking updates via SMS, WhatsApp, and email.</li>
              <li>Providing customer support and processing authorized returns or exchanges.</li>
              <li>Preventing fraudulent transactions and unauthorized account access.</li>
              <li>Delivering personalized offers and seasonal announcements (only when explicitly opted in).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>
              <UserCheck size={20} color="var(--luxury-gold, #d5a249)" />
              5. Your Rights & Data Choices
            </h2>
            <p>Under applicable Indian data protection regulations and international standards, you have the right to:</p>
            <ul>
              <li>Access and review your stored profile details through your 'My Account' dashboard.</li>
              <li>Request correction or updates to any inaccurate personal information.</li>
              <li>Request the complete deletion of your customer account and associated records.</li>
              <li>Opt out of marketing communications at any time with a single click.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>
              <Eye size={20} color="var(--luxury-gold, #d5a249)" />
              6. Contact Our Grievance Officer
            </h2>
            <p>
              If you have any questions or concerns regarding this policy, please reach out to our
              designated Privacy & Grievance Officer:
            </p>
            <div className="legal-highlight-box">
              <p>
                <strong>{brandName} Legal & Privacy Desk</strong><br />
                Address: {settings?.address || "Kotagiri, Nilgiris, Tamil Nadu, India."}<br />
                Email: <strong>{settings?.email || "harigaran925@gmail.com"}</strong><br />
                Helpline: <strong>{settings?.phone || "+91 97826260723"}</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
