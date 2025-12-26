import React, { useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";

import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import MyOrders from "./MyOrders";
import "./Profile.css";

const Profile = () => {
    const { user } = useContext(AuthContext);



    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-error">
                    <h2>Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* User Information Section */}
                <div className="profile-header">
                    <h1>My Profile</h1>
                </div>

                <div className="profile-info-card">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <User className="info-icon" />
                            <div className="info-content">
                                <label>Full Name</label>
                                <p>{user.name || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Mail className="info-icon" />
                            <div className="info-content">
                                <label>Email</label>
                                <p>{user.email || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="info-icon" />
                            <div className="info-content">
                                <label>Mobile</label>
                                <p>{user.phone || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar className="info-icon" />
                            <div className="info-content">
                                <label>Gender</label>
                                <p>{user.gender || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar className="info-icon" />
                            <div className="info-content">
                                <label>Date of Birth</label>
                                <p>{user.dob || "Not provided"}</p>
                            </div>
                        </div>

                        <div className="info-item full-width">
                            <MapPin className="info-icon" />
                            <div className="info-content">
                                <label>Address</label>
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
