import React, { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthContext";
import { authAPI } from "../../../services/api";
import { User, Mail, Phone, Calendar, MapPin, Package, Edit2, Check, X, ShieldCheck } from "lucide-react";
import MyOrders from "./MyOrders";
import toast from "react-hot-toast";
import "./Profile.css";

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: "orders" | "personal" | "address"
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "orders");

  useEffect(() => {
    if (urlTab && ["orders", "personal", "address"].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Personal Info Form State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
  });

  // Address Form State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: user?.address?.country || "India",
  });

  const [saving, setSaving] = useState(false);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
      });
      setAddressForm({
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "India",
      });
    }
  }, [user]);

  // Handle Personal Info Update
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: personalForm.name,
        phone: personalForm.phone,
        gender: personalForm.gender,
        dob: personalForm.dob,
      });

      // Update auth context & localStorage
      const updatedUser = { ...user, ...data };
      login(updatedUser);
      setIsEditingPersonal(false);
      toast.success("Personal information updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.response?.data?.message || "Failed to update personal information");
    } finally {
      setSaving(false);
    }
  };

  // Handle Address Book Update
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedAddress = {
        street: addressForm.street.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
        country: addressForm.country.trim(),
      };

      const { data } = await authAPI.updateProfile({
        address: updatedAddress,
      });

      const updatedUser = { ...user, ...data, address: updatedAddress };
      login(updatedUser);
      setIsEditingAddress(false);
      toast.success("Delivery address updated successfully");
    } catch (err) {
      console.error("Address update error:", err);
      toast.error(err.response?.data?.message || "Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <User size={54} color="#d5a249" />
          <h2>Please sign in to view your profile</h2>
          <p>Access your orders, personal information, and address book.</p>
        </div>
      </div>
    );
  }

  const hasAddress =
    user.address &&
    (user.address.street || user.address.city || user.address.state || user.address.zipCode);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User Account Header Banner */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={30} color="#d5a249" />
          </div>
          <div className="profile-title-group">
            <h1>{user.name || "Harigaran"}</h1>
            <p className="profile-subtitle">{user.email || "Registered Customer"}</p>
          </div>
        </div>

        {/* 3 Core Account Tabs: My Orders, Personal Information, Address Book */}
        <div className="account-tabs-bar">
          <button
            type="button"
            className={`account-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => handleTabChange("orders")}
          >
            <Package size={17} />
            <span>My Orders</span>
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => handleTabChange("personal")}
          >
            <User size={17} />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === "address" ? "active" : ""}`}
            onClick={() => handleTabChange("address")}
          >
            <MapPin size={17} />
            <span>Address Book</span>
          </button>
        </div>

        {/* TAB 1: MY ORDERS */}
        {activeTab === "orders" && (
          <div className="tab-content-panel orders-panel">
            <MyOrders />
          </div>
        )}

        {/* TAB 2: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <div className="tab-content-panel personal-panel">
            <div className="profile-info-card">
              <div className="card-section-header">
                <h2>Personal Information</h2>
                {!isEditingPersonal && (
                  <button
                    type="button"
                    className="card-edit-action-btn"
                    onClick={() => setIsEditingPersonal(true)}
                  >
                    <Edit2 size={14} /> Edit Details
                  </button>
                )}
              </div>

              {isEditingPersonal ? (
                <form onSubmit={handleSavePersonal} className="profile-edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                        required
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address (Read-only)</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="input-disabled"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={personalForm.gender}
                        onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={personalForm.dob}
                        onChange={(e) => setPersonalForm({ ...personalForm, dob: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" disabled={saving} className="btn-save-luxury">
                      <Check size={16} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      className="btn-cancel-luxury"
                      onClick={() => setIsEditingPersonal(false)}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADDRESS BOOK */}
        {activeTab === "address" && (
          <div className="tab-content-panel address-panel">
            <div className="profile-info-card">
              <div className="card-section-header">
                <h2>Address Book</h2>
                {!isEditingAddress && (
                  <button
                    type="button"
                    className="card-edit-action-btn"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    <Edit2 size={14} /> {hasAddress ? "Edit Address" : "Add Address"}
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="profile-edit-form">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Street Address / Flat / Building</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                        placeholder="e.g. 123 Luxury Ave, Apt 4B"
                      />
                    </div>

                    <div className="form-group">
                      <label>City / Town</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                        placeholder="e.g. Mumbai"
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                        placeholder="e.g. Maharashtra"
                      />
                    </div>

                    <div className="form-group">
                      <label>Postal / PIN Code</label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        required
                        placeholder="e.g. 400001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                        placeholder="India"
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" disabled={saving} className="btn-save-luxury">
                      <Check size={16} /> {saving ? "Saving..." : "Save Address"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      className="btn-cancel-luxury"
                      onClick={() => setIsEditingAddress(false)}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              ) : hasAddress ? (
                <div className="saved-address-card">
                  <div className="address-badge-row">
                    <span className="default-address-pill">Default Delivery Address</span>
                  </div>

                  <div className="saved-address-content">
                    <div className="address-icon-box">
                      <MapPin size={22} />
                    </div>
                    <div className="address-text-details">
                      <h4>{user.name || "Customer Name"}</h4>
                      <p className="address-line">{user.address?.street}</p>
                      <p className="address-line">
                        {user.address?.city}, {user.address?.state} - {user.address?.zipCode}
                      </p>
                      <p className="address-line">{user.address?.country || "India"}</p>
                      {user.phone && <p className="address-phone">Phone: {user.phone}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-address-box">
                  <MapPin size={42} className="empty-address-icon" />
                  <h3>No saved address found</h3>
                  <p>Add your primary shipping address for fast and effortless one-click checkout.</p>
                  <button
                    type="button"
                    className="btn-save-luxury"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    <MapPin size={16} /> Add Delivery Address
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
