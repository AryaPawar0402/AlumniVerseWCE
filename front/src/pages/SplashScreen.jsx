import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import walchandLogo from "../assets/walchand-logo.png";
import wceCampus from "../assets/wce-campus.jpg";
import "./SplashScreen.css";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      {/* Premium Campus Reveal (3 seconds) */}
      <div className="campus-reveal">
        {/* Modern Decorative Elements */}
        <div className="reveal-decorations">
          <div className="reveal-shape reveal-shape-1"></div>
          <div className="reveal-shape reveal-shape-2"></div>
          <div className="reveal-shape reveal-shape-3"></div>
          <div className="reveal-ring reveal-ring-1"></div>
          <div className="reveal-ring reveal-ring-2"></div>
        </div>

        {/* Floating Particles */}
        <div className="reveal-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="reveal-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <div className="campus-card">
          <div className="campus-card-image-wrapper">
            <img src={wceCampus} alt="WCE Campus" className="campus-reveal-image" />
            <div className="campus-overlay-gradient"></div>
          </div>

          <div className="campus-content">
            <div className="campus-logo-mini">
              <img src={walchandLogo} alt="WCE Logo" className="campus-logo-img" />
            </div>

            <h2 className="campus-title">Walchand College of Engineering</h2>
            <div className="campus-tagline-wrapper">
              <div className="tagline-item">
                <span className="tagline-icon">✦</span>
                <span className="campus-tagline-text">Connect</span>
              </div>
              <span className="tagline-separator">•</span>
              <div className="tagline-item">
                <span className="tagline-icon">✦</span>
                <span className="campus-tagline-text">Explore</span>
              </div>
              <span className="tagline-separator">•</span>
              <div className="tagline-item">
                <span className="tagline-icon">✦</span>
                <span className="campus-tagline-text">Succeed</span>
              </div>
            </div>
            <p className="campus-subtitle">Est. 1947 • Sangli, Maharashtra</p>

            <div className="campus-badges">
              <div className="campus-badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">NAAC A+</span>
              </div>
              <div className="campus-badge">
                <span className="badge-icon">🎓</span>
                <span className="badge-text">Autonomous</span>
              </div>
              <div className="campus-badge">
                <span className="badge-icon">⭐</span>
                <span className="badge-text">75+ Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="grid-pattern"></div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="splash-content">
        {/* Logo Section with Premium Design */}
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <div className="logo-wrapper">
              <img src={walchandLogo} alt="Walchand Logo" className="college-logo" />
            </div>
          </div>

          {/* Est. Year Badge */}
          <div className="est-badge">
            <span className="est-text">EST.</span>
            <span className="est-year">1947</span>
          </div>
        </div>

        {/* Brand Title Section */}
        <div className="brand-section">
          <div className="college-name">
            <span className="college-name-letter">W</span>
            <span className="college-name-letter">A</span>
            <span className="college-name-letter">L</span>
            <span className="college-name-letter">C</span>
            <span className="college-name-letter">H</span>
            <span className="college-name-letter">A</span>
            <span className="college-name-letter">N</span>
            <span className="college-name-letter">D</span>
          </div>

          <div className="brand-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>

          <h1 className="main-title">
            <span className="title-wce">WCE</span>
            <span className="title-alumniverse">AlumniVerse</span>
          </h1>

          <p className="brand-subtitle">College of Engineering, Sangli</p>

          <div className="tagline-container">
            <div className="tagline-icon">✦</div>
            <p className="tagline">Connect • Inspire • Succeed</p>
            <div className="tagline-icon">✦</div>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="loading-section">
          <div className="loading-bar-container">
            <div className="loading-bar">
              <div className="loading-progress"></div>
              <div className="loading-shimmer"></div>
            </div>
          </div>
          <p className="loading-text">
            <span className="loading-dots">Initializing platform</span>
          </p>
        </div>
      </div>

      {/* Floating Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Bottom Info Bar */}
      <div className="info-bar">
        <div className="info-item">
          <span className="info-icon">🏛️</span>
          <span className="info-text">Autonomous Institute</span>
        </div>
        <div className="info-separator">|</div>
        <div className="info-item">
          <span className="info-icon">⭐</span>
          <span className="info-text">NAAC A+ Accredited</span>
        </div>
        <div className="info-separator">|</div>
        <div className="info-item">
          <span className="info-icon">🌟</span>
          <span className="info-text">75+ Years of Excellence</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
