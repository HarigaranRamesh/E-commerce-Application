import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import "./ServiceFeatures.css";

const features = [
    {
        icon: <Truck size={32} />,
        title: "Free Shipping",
        desc: "On all orders over ₹999",
    },
    {
        icon: <RefreshCw size={32} />,
        title: "Easy Returns",
        desc: "30-day money back guarantee",
    },
    {
        icon: <ShieldCheck size={32} />,
        title: "Secure Payment",
        desc: "100% secure payment",
    },
    {
        icon: <Headset size={32} />,
        title: "24/7 Support",
        desc: "Dedicated support",
    },
];

const ServiceFeatures = () => {
    return (
        <div className="section-padding custom-bg">
            <div className="container">
                <div className="features-grid">
                    {features.map((feature, index) => (
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
