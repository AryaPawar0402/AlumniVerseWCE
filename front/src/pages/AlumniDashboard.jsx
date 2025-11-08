import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlumniNavbar from "../components/AlumniNavbar";
import AlumniProfileService from "../services/AlumniProfileService";
import "./AlumniDashboard.css";

const AlumniDashboard = () => {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("🔄 Starting to fetch alumni data...");
        const profileData = await AlumniProfileService.getProfile();
        console.log("📊 Profile data:", profileData);
        setAlumni(profileData);
      } catch (err) {
        console.error("❌ Error in AlumniDashboard:", err);
        console.error("❌ Error response:", err.response?.data);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="alumni-dashboard-container">
        <div className="dashboard-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <AlumniNavbar />
        <div className="alumni-dashboard-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading Alumni Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alumni-dashboard-container">
        <div className="dashboard-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <AlumniNavbar />
        <div className="alumni-dashboard-content">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard-container">
      {/* Decorative Background */}
      <div className="dashboard-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <AlumniNavbar />

      <div className="alumni-dashboard-main">
        {/* Left Side - Hero Content */}
        <div className="alumni-dashboard-left">
          <div className="alumni-hero-content">
            <div className="alumni-hero-badge">
              <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Alumni Portal
            </div>
            <h1 className="alumni-hero-title">Welcome, {alumni?.firstName || "Alumni"}!</h1>
            <p className="alumni-hero-subtitle">
              Connect with fellow alumni, share opportunities, and give back to the Walchand community. Your experience shapes the future.
            </p>

            {/* Stats */}
            <div className="alumni-hero-stats">
              <div className="alumni-stat-item">
                <div className="alumni-stat-number">10,000+</div>
                <div className="alumni-stat-label">Active Alumni</div>
              </div>
              <div className="alumni-stat-item">
                <div className="alumni-stat-number">500+</div>
                <div className="alumni-stat-label">Job Postings</div>
              </div>
              <div className="alumni-stat-item">
                <div className="alumni-stat-number">150+</div>
                <div className="alumni-stat-label">Annual Events</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="alumni-hero-features">
              <div className="alumni-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Post job opportunities</span>
              </div>
              <div className="alumni-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect with alumni network</span>
              </div>
              <div className="alumni-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mentor the next generation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Navigation Cards */}
        <div className="alumni-dashboard-right">
          <div className="alumni-cards-grid">
            {/* Card 1 - Profile */}
            <button onClick={() => navigate("/alumni/profile")} className="alumni-dashboard-card">
              <div className="alumni-card-icon-wrapper">
                <div className="alumni-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="alumni-card-content">
                <h3 className="alumni-card-title">View Profile</h3>
                <p className="alumni-card-description">Manage your alumni profile and information</p>
              </div>
              <div className="alumni-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Card 2 - Post Jobs */}
            <button onClick={() => navigate("/alumni/jobs")} className="alumni-dashboard-card">
              <div className="alumni-card-icon-wrapper">
                <div className="alumni-card-icon alumni-card-icon-jobs">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="alumni-card-content">
                <h3 className="alumni-card-title">Post Jobs</h3>
                <p className="alumni-card-description">Share job opportunities with students</p>
              </div>
              <div className="alumni-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Card 3 - View Posted Jobs */}
            <button onClick={() => navigate("/alumni/view-jobs")} className="alumni-dashboard-card">
              <div className="alumni-card-icon-wrapper">
                <div className="alumni-card-icon alumni-card-icon-view">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="alumni-card-content">
                <h3 className="alumni-card-title">View Posted Jobs</h3>
                <p className="alumni-card-description">See and manage your job postings</p>
              </div>
              <div className="alumni-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Card 4 - Connections */}
            <button onClick={() => navigate("/alumni/connections")} className="alumni-dashboard-card">
              <div className="alumni-card-icon-wrapper">
                <div className="alumni-card-icon alumni-card-icon-connections">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="alumni-card-content">
                <h3 className="alumni-card-title">Connections</h3>
                <p className="alumni-card-description">View and manage your network</p>
              </div>
              <div className="alumni-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
