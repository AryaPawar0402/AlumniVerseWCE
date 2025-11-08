import React from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard-container">
      {/* Decorative Background */}
      <div className="dashboard-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <AdminNavbar />

      <div className="admin-dashboard-main">
        {/* Left Side - Hero Content */}
        <div className="admin-dashboard-left">
          <div className="admin-hero-content">
            <div className="admin-hero-badge">
              <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Portal
            </div>
            <h1 className="admin-hero-title">Welcome, Admin!</h1>
            <p className="admin-hero-subtitle">
              Manage college events, connections, and profiles with ease. Your administrative control center for the Walchand community.
            </p>

            {/* Stats */}
            <div className="admin-hero-stats">
              <div className="admin-stat-item">
                <div className="admin-stat-number">24</div>
                <div className="admin-stat-label">Total Events</div>
              </div>
              <div className="admin-stat-item">
                <div className="admin-stat-number">1.2K</div>
                <div className="admin-stat-label">Active Users</div>
              </div>
              <div className="admin-stat-item">
                <div className="admin-stat-number">856</div>
                <div className="admin-stat-label">Connections</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="admin-hero-features">
              <div className="admin-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Event management</span>
              </div>
              <div className="admin-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Network oversight</span>
              </div>
              <div className="admin-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Profile administration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Navigation Cards */}
        <div className="admin-dashboard-right">
          <div className="admin-cards-grid">
            {/* Card 1 - Manage Events */}
            <Link to="/admin/events" className="admin-dashboard-card">
              <div className="admin-card-icon-wrapper">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="admin-card-content">
                <h3 className="admin-card-title">Manage Events</h3>
                <p className="admin-card-description">Create and organize college events</p>
              </div>
              <div className="admin-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 2 - View Events */}
            <Link to="/admin/view-events" className="admin-dashboard-card">
              <div className="admin-card-icon-wrapper">
                <div className="admin-card-icon admin-card-icon-events">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="admin-card-content">
                <h3 className="admin-card-title">View Events</h3>
                <p className="admin-card-description">Browse all upcoming and past events</p>
              </div>
              <div className="admin-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 3 - Connections */}
            <Link to="/admin/connections" className="admin-dashboard-card">
              <div className="admin-card-icon-wrapper">
                <div className="admin-card-icon admin-card-icon-connections">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="admin-card-content">
                <h3 className="admin-card-title">Connections</h3>
                <p className="admin-card-description">Manage connections and networking</p>
              </div>
              <div className="admin-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 4 - Profile */}
            <Link to="/admin/profile" className="admin-dashboard-card">
              <div className="admin-card-icon-wrapper">
                <div className="admin-card-icon admin-card-icon-profile">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="admin-card-content">
                <h3 className="admin-card-title">Profile</h3>
                <p className="admin-card-description">Update your admin profile settings</p>
              </div>
              <div className="admin-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
