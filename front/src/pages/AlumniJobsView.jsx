import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaMapMarkerAlt, FaExternalLinkAlt, FaBuilding, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import "./AlumniJobsView.css";

const AlumniJobsView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumniName, setAlumniName] = useState("");

  useEffect(() => {
    const { filteredJobs, alumniName } = location.state || {};

    if (filteredJobs && alumniName) {
      // Use the pre-filtered jobs passed from AlumniProfileView
      setJobs(filteredJobs);
      setAlumniName(alumniName);
      setLoading(false);
    } else {
      // Fallback: filter jobs from localStorage
      filterJobsFromStorage();
    }
  }, [location.state, id]);

  const filterJobsFromStorage = () => {
    try {
      const savedJobs = localStorage.getItem('alumniPostedJobs');
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        if (Array.isArray(parsedJobs)) {
          // Filter jobs by alumni ID
          const filteredJobs = parsedJobs.filter(job => job.alumniId === id);
          setJobs(filteredJobs);
        }
      }
    } catch (error) {
      console.error("Error filtering jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    if (job.link) {
      window.open(job.link, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Application process for ${job.title} at ${job.company}\n\nPlease check the company's career page for application details.`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getAlumniInitials = (alumniName) => {
    if (!alumniName) return "AL";
    return alumniName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="alumni-jobs-view-container">
        <div className="jobs-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <Navbar />
        <div className="alumni-jobs-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading job opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-jobs-view-container">
      {/* Decorative Background */}
      <div className="jobs-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <Navbar />

      <div className="alumni-jobs-content">
        <div className="alumni-jobs-wrapper">
          {/* Header Section */}
          <div className="alumni-jobs-header">
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft />
              Back to Profile
            </button>

            <div className="header-content">
              <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1>Jobs Posted by {alumniName}</h1>
            </div>
            <p className="header-subtitle">Career opportunities shared by {alumniName}</p>

            {/* Stats */}
            <div className="jobs-stats">
              <div className="stat-card">
                <FaBuilding className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{jobs.length}</span>
                  <span className="stat-label">Total Jobs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="jobs-section">
            {jobs.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3>No jobs posted yet</h3>
                <p>
                  {alumniName} hasn't posted any job opportunities yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <div className="company-section">
                        {job.image ? (
                          <img src={job.image} alt={job.company} className="company-logo" />
                        ) : (
                          <div className="company-logo-placeholder">
                            {job.company?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div className="company-info">
                          <h3 className="job-title">{job.title}</h3>
                          <p className="company-name">
                            <FaBuilding /> {job.company}
                          </p>
                          <p className="job-location">
                            <FaMapMarkerAlt /> {job.location || 'Remote'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="job-description">
                      <p>{job.description}</p>
                    </div>

                    <div className="posted-by">
                      <div className="alumni-info">
                        <div className="alumni-avatar">
                          {getAlumniInitials(job.postedBy)}
                        </div>
                        <div className="alumni-details">
                          <span className="posted-by-label">
                            Posted by Walchand Alumni
                          </span>
                          <span className="alumni-name">{job.postedBy}</span>
                          {job.isRealData && (
                            <span className="real-data-badge">✓ Real Profile</span>
                          )}
                        </div>
                      </div>
                      <div className="post-date">
                        <FaCalendarAlt />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="job-actions">
                      <button
                        className="apply-now-btn"
                        onClick={() => handleApply(job)}
                      >
                        <FaExternalLinkAlt />
                        {job.link ? 'Apply Now' : 'View Details'}
                      </button>
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-link"
                        >
                          Visit Company Page
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {jobs.length > 0 && (
            <div className="jobs-footer">
              <p>
                💡 All job opportunities are shared by Walchand College of Engineering alumni.
                Connect with them for referrals and guidance!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniJobsView;