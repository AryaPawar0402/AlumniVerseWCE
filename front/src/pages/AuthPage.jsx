import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, verifyUser, resetPasswordDirect } from "../services/authService";
import "../pages/AuthPage.css";
import walchandLogo from "../assets/walchand-logo.png";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = "6LdJxtsrAAAAAJqsqocP9g5vYiEVlV_m_SU7d7Le";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "STUDENT",
    newPassword: "",
    confirmPassword: "",
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCaptchaLoaded, setIsCaptchaLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captchaRef = useRef(null);

  // Load reCAPTCHA script with error handling
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setIsCaptchaLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('reCAPTCHA loaded successfully');
        setIsCaptchaLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load reCAPTCHA');
        setError("Security check failed to load. Please check your internet connection and try again.");
        setIsCaptchaLoaded(false);
      };

      document.head.appendChild(script);
    };

    loadRecaptcha();

    return () => {
      setIsCaptchaLoaded(false);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setError("");
  };

  const handleCaptchaErrored = () => {
    console.error('reCAPTCHA encountered an error');
    setError("Security check failed. Please refresh the page and try again.");
    setIsCaptchaLoaded(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (showForgotPassword) {
      // Direct password reset flow
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match. Please try again.");
        setIsSubmitting(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsSubmitting(false);
        return;
      }

      try {
        // First verify user exists
        await verifyUser(formData.email);

        // Then reset password
        const res = await resetPasswordDirect(formData.email, formData.newPassword);
        setSuccess(res.message || "Password has been reset successfully. You can now login with your new password.");
        setShowForgotPassword(false);
        setIsLogin(true);
        // Clear form
        setFormData({
          ...formData,
          email: "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (err) {
        console.error('Reset password error:', err);
        setError(err.response?.data?.message || "Failed to reset password. Please check your email and try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Regular login/register flow - CAPTCHA required
    if (!isCaptchaLoaded) {
      setError("Security check is still loading. Please wait a moment and try again.");
      setIsSubmitting(false);
      return;
    }

    if (!captchaValue) {
      setError("Please verify that you are not a robot.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await login({
          email: formData.email,
          password: formData.password,
          captcha: captchaValue,
        });

        if (res.token) {
          localStorage.setItem("token", res.token);
        }

        const userRole = res.role || "STUDENT";
        localStorage.setItem("role", userRole);

        console.log("Login successful - Role:", userRole);

        if (captchaRef.current) {
          captchaRef.current.reset();
          setCaptchaValue(null);
        }

        setIsSubmitting(false);

        if (userRole === "STUDENT" || userRole === "ROLE_STUDENT") {
          navigate("/student/dashboard");
        } else if (userRole === "ALUMNI" || userRole === "ROLE_ALUMNI") {
          navigate("/alumni/dashboard");
        } else if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        const res = await register({
          ...formData,
          captcha: captchaValue,
        });

        setSuccess(res.message || "Registration successful, please login");
        setIsLogin(true);

        if (captchaRef.current) {
          captchaRef.current.reset();
          setCaptchaValue(null);
        }

        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || "Something went wrong");

      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaValue(null);
      }

      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setError("");
    setSuccess("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      role: "STUDENT",
      newPassword: "",
      confirmPassword: "",
    });

    if (captchaRef.current) {
      captchaRef.current.reset();
      setCaptchaValue(null);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setError("");
    setSuccess("");
    // Keep the email if user was trying to login
    setFormData({
      ...formData,
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError("");
    setSuccess("");
    setFormData({
      ...formData,
      newPassword: "",
      confirmPassword: ""
    });
  };

  const renderForgotPasswordForm = () => (
    <div className="forgot-password-form">
      <div className="auth-card-header">
        <h2 className="auth-card-title">Reset Your Password</h2>
        <p className="auth-card-subtitle">
          Enter your email and new password to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password (min. 6 characters)"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="form-input"
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="form-input"
            minLength="6"
          />
        </div>

        {error && (
          <div className="message-box error-box">
            <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="error-text">{error}</p>
          </div>
        )}

        {success && (
          <div className="message-box success-box">
            <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="success-text">{success}</p>
          </div>
        )}

        <button
          type="submit"
          className={`auth-btn ${isSubmitting ? 'auth-btn-loading' : ''}`}
          disabled={isSubmitting}
        >
          <span className="btn-text">
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="back-to-login-btn"
        >
          ← Back to Login
        </button>
      </form>
    </div>
  );

  const renderAuthForm = () => (
    <>
      <div className="auth-tabs">
        <button
          type="button"
          onClick={() => { if (!isLogin) toggleForm(); }}
          className={`auth-tab ${isLogin ? "auth-tab-active" : ""}`}
        >
          <span className="tab-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </span>
          Login
        </button>
        <button
          type="button"
          onClick={() => { if (isLogin) toggleForm(); }}
          className={`auth-tab ${!isLogin ? "auth-tab-active" : ""}`}
        >
          <span className="tab-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </span>
          Register
        </button>
      </div>

      <div className="auth-card-header">
        <h2 className="auth-card-title">
          {isLogin ? "Welcome Back!" : "Join Our Community"}
        </h2>
        <p className="auth-card-subtitle">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Create an account to connect with our alumni network"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+91 1234567890"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Register As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-input form-select"
              >
                <option value="STUDENT">Student</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>
          </>
        )}

        {isLogin && (
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-btn"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <div className="recaptcha-wrapper">
          {!isCaptchaLoaded && (
            <div className="captcha-loading">
              <p>Loading security check...</p>
            </div>
          )}
          <ReCAPTCHA
            ref={captchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
            onErrored={handleCaptchaErrored}
            asyncScriptOnLoad={() => setIsCaptchaLoaded(true)}
          />
        </div>

        {error && (
          <div className="message-box error-box">
            <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="error-text">{error}</p>
          </div>
        )}

        {success && (
          <div className="message-box success-box">
            <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="success-text">{success}</p>
          </div>
        )}

        <button
          type="submit"
          className={`auth-btn ${isSubmitting ? 'auth-btn-loading' : ''}`}
          disabled={isSubmitting || !isCaptchaLoaded}
        >
          <span className="btn-text">
            {isSubmitting
              ? "Processing..."
              : isLogin ? "Sign In" : "Create Account"
            }
          </span>
          {!isSubmitting && (
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </button>
      </form>
    </>
  );

  return (
    <div className="auth-container">
      {/* Decorative Background Elements */}
      <div className="auth-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      {/* Main Content Wrapper */}
      <div className="auth-content">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-container">
              <img src={walchandLogo} alt="Walchand Logo" className="main-logo" />
            </div>
            <h1 className="branding-title">
              <span className="title-line">WCE Alumniverse</span>
            </h1>
            <p className="branding-subtitle">
              Connecting generations of excellence, innovation, and leadership
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Network</h3>
                  <p>Connect with alumni worldwide</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Opportunities</h3>
                  <p>Discover jobs and collaborations</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Resources</h3>
                  <p>Access exclusive alumni content</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            {showForgotPassword ? renderForgotPasswordForm() : renderAuthForm()}

            <div className="auth-footer">
              <p className="footer-text">
                © 2025 Walchand College of Engineering. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;