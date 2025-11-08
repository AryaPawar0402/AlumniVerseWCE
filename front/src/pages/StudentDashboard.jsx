import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  return (
    <div className="student-dashboard-container">
      {/* Decorative Background Elements */}
      <div className="dashboard-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <Navbar />

      <div className="student-dashboard-main">
        {/* Left Side - Hero Content */}
        <div className="student-dashboard-left">
          <div className="student-hero-content">
            <div className="student-hero-badge">
              <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Student Portal
            </div>
            <h1 className="student-hero-title">Welcome to the Alumni Portal</h1>
            <p className="student-hero-subtitle">
              Stay connected with the Walchand alumni network and unlock endless opportunities for growth, collaboration, and success.
            </p>

            {/* Stats */}
            <div className="student-hero-stats">
              <div className="student-stat-item">
                <div className="student-stat-number">10,000+</div>
                <div className="student-stat-label">Active Alumni</div>
              </div>
              <div className="student-stat-item">
                <div className="student-stat-number">500+</div>
                <div className="student-stat-label">Job Postings</div>
              </div>
              <div className="student-stat-item">
                <div className="student-stat-number">150+</div>
                <div className="student-stat-label">Annual Events</div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="student-hero-features">
              <div className="student-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect with alumni worldwide</span>
              </div>
              <div className="student-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access exclusive opportunities</span>
              </div>
              <div className="student-feature-highlight">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Showcase your achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Navigation Cards */}
        <div className="student-dashboard-right">
          <div className="student-cards-grid">
            {/* Card 1 - Profile */}
            <Link to="/student/profile" className="student-dashboard-card">
              <div className="student-card-icon-wrapper">
                <div className="student-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="student-card-content">
                <h3 className="student-card-title">View Profile</h3>
                <p className="student-card-description">Manage your personal information and preferences</p>
              </div>
              <div className="student-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 2 - Events */}
            <Link to="/student/events" className="student-dashboard-card">
              <div className="student-card-icon-wrapper">
                <div className="student-card-icon student-card-icon-events">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="student-card-content">
                <h3 className="student-card-title">Alumni Events</h3>
                <p className="student-card-description">Discover and register for upcoming events</p>
              </div>
              <div className="student-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 3 - Network */}
            <Link to="/student/network" className="student-dashboard-card">
              <div className="student-card-icon-wrapper">
                <div className="student-card-icon student-card-icon-network">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="student-card-content">
                <h3 className="student-card-title">Networking</h3>
                <p className="student-card-description">Connect with alumni across the globe</p>
              </div>
              <div className="student-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 4 - Jobs */}
            <Link to="/student/jobs" className="student-dashboard-card">
              <div className="student-card-icon-wrapper">
                <div className="student-card-icon student-card-icon-jobs">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="student-card-content">
                <h3 className="student-card-title">Job Opportunities</h3>
                <p className="student-card-description">Explore career opportunities and internships</p>
              </div>
              <div className="student-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Card 5 - Achievements */}
            <Link to="/student/achievements" className="student-dashboard-card">
              <div className="student-card-icon-wrapper">
                <div className="student-card-icon student-card-icon-achievements">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="student-card-content">
                <h3 className="student-card-title">Post Achievements</h3>
                <p className="student-card-description">Share your accomplishments with the community</p>
              </div>
              <div className="student-card-arrow">
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

export default StudentDashboard;