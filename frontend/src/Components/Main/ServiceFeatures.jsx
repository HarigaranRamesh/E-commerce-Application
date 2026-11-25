import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headset, Award, Sparkles } from "lucide-react";
import { useSite } from "../../Context/SiteContext";
import "./ServiceFeatures.css";

const ICON_MAP = {
  truck: <Truck size={32} />,
  refresh: <RefreshCw size={32} />,
  shield: <ShieldCheck size={32} />,
  headset: <Headset size={32} />,
  award: <Award size={32} />,
  sparkles: <Sparkles size={32} />,
};

const ServiceFeatures = () => {
  const { settings } = useSite();
  const freeShipThreshold = settings?.free_shipping_threshold || 999;

  const defaultFeatures = [
    {
      icon: <Truck size={32} />,
      title: "Free Shipping",
      desc: `On all orders over ₹${freeShipThreshold}`,
    },
    {
      icon: <RefreshCw size={32} />,
      title: "Easy Returns",
      desc: "15-day hassle-free doorstep exchange",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Secure Payment",
      desc: "100% verified Razorpay & UPI encryption",
    },
    {
      icon: <Headset size={32} />,
      title: "24/7 Support",
      desc: "Dedicated support team",
    },
  ];

  let displayFeatures = defaultFeatures;
  if (Array.isArray(settings?.features) && settings.features.length > 0) {
    displayFeatures = settings.features.map((feat) => ({
      icon: ICON_MAP[feat.icon?.toLowerCase()] || <Award size={32} />,
      title: feat.title,
      desc: feat.desc,
    }));
  }

  return (
    <div className="section-padding custom-bg">
      <div className="container">
        <div className="features-grid">
          {displayFeatures.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-text">
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceFeatures;
