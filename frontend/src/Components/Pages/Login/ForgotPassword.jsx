import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { authAPI } from "../../../services/api";
import "../Login/Login.css";

export default function ForgotPassword() {
    const [searchParams] = useSearchParams();
    const queryToken = searchParams.get("token");
    const queryEmail = searchParams.get("email");

    const [step, setStep] = useState(queryToken && queryEmail ? 2 : 1);
    const [email, setEmail] = useState(queryEmail || "");
    const [resetToken, setResetToken] = useState(queryToken || "");
    const [userName, setUserName] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (queryToken && queryEmail) {
            setStep(2);
            setResetToken(queryToken);
            setEmail(queryEmail);
            toast.success("Reset link verified! Please set your new password.");
        }
    }, [queryToken, queryEmail]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            toast.error("Please enter your registered email address");
            return;
        }

        try {
            setLoading(true);
            const res = await authAPI.forgotPassword(trimmedEmail);
            const data = res.data;
            if (data.resetToken) {
                setResetToken(data.resetToken);
                setUserName(data.name || "");
                if (data.previewUrl) {
                    setPreviewUrl(data.previewUrl);
                }
                setStep(2);
                toast.success(data.message || "Password reset email dispatched!");
            } else {
                toast.error("Could not verify account. Please try again.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "No account found with this email address";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await authAPI.resetPassword({
                email: email.trim(),
                resetToken,
                newPassword,
            });
            toast.success(res.data?.message || "Password reset successful! Please log in.");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to reset password. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {step === 1 ? (
                    <>
                        <div className="auth-header">
                            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', marginBottom: '12px' }}>
                                <KeyRound size={28} />
                            </div>
                            <h2>Forgot Password?</h2>
                            <p>Enter your registered email address to receive your secure password reset link.</p>
                        </div>

                        <form className="auth-form" onSubmit={handleVerifyEmail}>
                            <div className="form-group">
                                <label>Registered Email Address</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        placeholder="e.g. name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-button" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Sending Reset Email..." : "Send Reset Email"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="auth-header">
                            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', marginBottom: '12px' }}>
                                <CheckCircle2 size={28} />
                            </div>
                            <h2>Set New Password</h2>
                            <p>{userName ? `Welcome back, ${userName}. ` : ""}Create your new secure password.</p>
                            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
                                <span>{email}</span>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setPreviewUrl(null); }}
                                    style={{ background: 'none', border: 'none', color: '#0284c7', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}
                                >
                                    Change
                                </button>
                            </div>

                            {previewUrl && (
                                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.83rem', color: '#92400e', textAlign: 'left' }}>
                                    <strong>Dev Preview:</strong> An email was generated!{" "}
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                                        View Email in Browser <ExternalLink size={13} />
                                    </a>
                                </div>
                            )}
                        </div>

                        <form className="auth-form" onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-button" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Updating Password..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}

                <p className="auth-switch">
                    <Link to="/login" className="back-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
