import React, { useState } from "react";
import { ChevronDown, Search, HelpCircle, Mail, Phone } from "lucide-react";
import { useSite } from "../../../Context/SiteContext";
import "./LegalStyles.css";

const FAQ_DATA = [
  {
    id: 1,
    category: "orders",
    question: "How do I track my order status?",
    answer:
      "Once your order has been placed, you can visit the 'My Orders' section in your account profile to view live tracking updates. You will also receive SMS and email notifications with your courier AWB tracking number as soon as your parcel departs our fulfillment center.",
  },
  {
    id: 2,
    category: "orders",
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "Orders can be modified or canceled directly through the 'My Orders' page within 1 hour of placing the order, provided our logistics team has not already dispatched it. Once dispatched, you may initiate a doorstep return or exchange after delivery.",
  },
  {
    id: 3,
    category: "shipping",
    question: "What are your delivery timelines and shipping charges?",
    answer:
      "We offer complimentary Standard Delivery across India on all orders over ₹999. For orders below ₹999, a nominal flat shipping fee of ₹60 is applied. Metro cities typically receive deliveries within 2–4 business days, while other regions are delivered within 4–7 business days.",
  },
  {
    id: 4,
    category: "shipping",
    question: "Do you ship internationally?",
    answer:
      "Currently, we provide priority pan-India shipping across 26,000+ pin codes. International shipping to select countries will be launching soon. Stay tuned to our newsletter for international launch announcements.",
  },
  {
    id: 5,
    category: "returns",
    question: "What is your 15-day exchange and return policy?",
    answer:
      "We offer a 15-day hassle-free return and exchange policy from the date of delivery. Items must be unworn, unwashed, and in their original packaging with all security tags intact. You can request a pickup right from your 'My Orders' page.",
  },
  {
    id: 6,
    category: "returns",
    question: "When will I receive my refund?",
    answer:
      "Once our quality verification team receives and inspects the returned garment, your refund is initiated within 24 hours. The amount is credited back to your original payment method (Bank/UPI/Card) within 5–7 business days.",
  },
  {
    id: 7,
    category: "payments",
    question: "Which payment methods are accepted?",
    answer:
      "We accept all major payment methods powered by Razorpay's bank-grade 256-bit encryption: UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, MasterCard, RuPay, Amex), Net Banking across 50+ banks, and popular digital wallets.",
  },
  {
    id: 8,
    category: "payments",
    question: "Are my card and transaction details secure?",
    answer:
      "Yes, 100%. All transactions are processed through RBI-compliant, PCI-DSS Level 1 certified Razorpay payment gateways with end-to-end cryptographic tokenization. We never store your full card numbers or CVV on our servers.",
  },
  {
    id: 9,
    category: "products",
    question: "How do I ensure I select the right size?",
    answer:
      "Each product page features a detailed 'Size Guide' with exact chest, length, shoulder, and waist measurements in inches and centimeters. If you are between sizes, we recommend sizing up for a relaxed fit or choosing your standard size for tailored cuts.",
  },
  {
    id: 10,
    category: "products",
    question: "Are your fabrics and garments 100% authentic?",
    answer:
      "Yes. Every garment in our collections is crafted from certified premium combed cotton, French terry, or authentic linen blends. Each item undergoes strict three-tier quality control checks by master inspectors before packaging.",
  },
];

export default function FAQ() {
  const { siteName, settings } = useSite();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState(new Set([1, 3])); // Default first few open

  const toggleItem = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <span className="legal-eyebrow">CUSTOMER SUPPORT</span>
          <h1 className="legal-title">Frequently Asked Questions</h1>
          <p className="legal-subtitle">
            Find quick answers to common queries regarding ordering, delivery,
            sizing, and our return policies at {siteName || "Clothings Store"}.
          </p>
        </div>

        {/* Search Input */}
        <div className="faq-search-box">
          <Search size={18} className="faq-search-icon" />
          <input
            type="text"
            className="faq-search-input"
            placeholder="Search keywords (e.g. tracking, exchange, UPI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="faq-category-pills">
          {[
            { id: "all", label: "All Questions" },
            { id: "orders", label: "Orders & Tracking" },
            { id: "shipping", label: "Shipping & Delivery" },
            { id: "returns", label: "Returns & Refunds" },
            { id: "payments", label: "Payments" },
            { id: "products", label: "Sizing & Quality" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`faq-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-list">
          {filteredFaqs.length === 0 ? (
            <div className="legal-card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <HelpCircle size={40} style={{ color: "#94a3b8", margin: "0 auto 12px" }} />
              <h3>No matching questions found</h3>
              <p style={{ color: "#64748b" }}>
                Try searching for different keywords or select another category above.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.has(faq.id);
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={18} className="faq-icon-arrow" />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Need more help highlight */}
        <div className="legal-highlight-box" style={{ marginTop: "40px" }}>
          <p>
            <strong>Still need assistance?</strong> Our dedicated customer care desk is
            available Monday – Saturday, 9:00 AM – 8:00 PM IST. Reach out via email at{" "}
            <strong>{settings?.email || "harigaran925@gmail.com"}</strong> or call{" "}
            <strong>{settings?.phone || "+91 97826260723"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
