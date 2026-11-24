import React, { useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import { User, Mail, Phone, Calendar, MapPin, Package } from "lucide-react";
import MyOrders from "./MyOrders";
import "./Profile.css";

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    <User size={54} color="#d5a249" />
                    <h2>Please sign in to view your profile</h2>
                    <p>Access your orders, saved addresses, and personal account information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* User Header Profile Banner */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <User size={32} color="#d5a249" />
                    </div>
                    <div className="profile-title-group">
                        <h1>{user.name || "My Account"}</h1>
                        <p className="profile-subtitle">{user.email || "Registered Customer"}</p>
                    </div>
                </div>

                {/* Personal Information Card */}
                <div className="profile-info-card">
                    <div className="card-section-header">
                        <h2>Personal Information</h2>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon-box">
                                <User size={18} />
                            </div>
                            <div className="info-content">
                                <label>Full Name</label>
                                <p>{user.name || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-box">
                                <Mail size={18} />
                            </div>
                            <div className="info-content">
                                <label>Email Address</label>
                                <p>{user.email || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-box">
                                <Phone size={18} />
                            </div>
                            <div className="info-content">
                                <label>Phone Number</label>
                                <p>{user.phone || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-box">
                                <Calendar size={18} />
                            </div>
                            <div className="info-content">
                                <label>Gender</label>
                                <p>{user.gender || "Not specified"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon-box">
                                <Calendar size={18} />
                            </div>
                            <div className="info-content">
                                <label>Date of Birth</label>
                                <p>{user.dob || "Not specified"}</p>
                            </div>
                        </div>

                        <div className="info-item full-width">
                            <div className="info-icon-box">
                                <MapPin size={18} />
                            </div>
                            <div className="info-content">
                                <label>Delivery Address</label>
                                <p>
                                    {user.address
                                        ? `${user.address.street || ""} ${user.address.city || ""} ${user.address.state || ""} ${user.address.zipCode || ""} ${user.address.country || ""}`.trim() || "Not provided"
                                        : "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="profile-orders-section">
                    <MyOrders />
                </div>
            </div>
        </div>
    );
};

export default Profile;
