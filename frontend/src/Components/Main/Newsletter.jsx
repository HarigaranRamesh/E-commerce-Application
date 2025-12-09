import React, { useState } from "react";
import { Mail } from "lucide-react";
import "./Newsletter.css";

const Newsletter = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic for newsletter subscription would go here
        setEmail("");
        alert("Thanks for subscribing!");
    };

    return (
        <div className="newsletter-section">
            <div className="container">
                <div className="newsletter-content">
                    <div className="newsletter-text">
                        <h2>Subscribe to our Newsletter</h2>
                        <p>
                            Get the latest updates on new products and upcoming sales.
                        </p>
                    </div>
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-subscribe">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
