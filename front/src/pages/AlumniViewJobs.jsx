import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AlumniNavbar from "../components/AlumniNavbar";
import StudentNavbar from "../components/Navbar"; // Import student navbar
import { FaMapMarkerAlt, FaExternalLinkAlt, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import "./AlumniViewJobs.css";

const AlumniViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState('alumni'); // 'alumni' or 'student'
  const [alumniName, setAlumniName] = useState("");
  const location = useLocation();

  useEffect(() => {
    const { filteredJobs, alumniName, viewMode: mode } = location.state || {};

    if (mode === 'student' && filteredJobs) {
      // Student viewing specific alumni's jobs
      setViewMode('student');
      setAlumniName(alumniName || "");
      setJobs(filteredJobs);
    } else {
      // Alumni viewing their own jobs (original functionality)
      setViewMode('alumni');
      const savedJobs = localStorage.getItem('alumniPostedJobs');
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        if (Array.isArray(parsedJobs)) {
          setJobs(parsedJobs);
        }
      }
    }
  }, [location.state]);

  const deleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('alumniPostedJobs', JSON.stringify(updatedJobs));
      alert("Job deleted successfully!");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Render appropriate navbar based on view mode
  const NavbarComponent = viewMode === 'student' ? StudentNavbar : AlumniNavbar;

  return (
    <div className="alumni-viewjobs-container">
      {/* Decorative Background Elements */}
      <div className="viewjobs-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <NavbarComponent />

      <div className="alumni-viewjobs-content">
        {/* Header Section */}
        <div className="viewjobs-header">
          {viewMode === 'student' && (
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft /> Back to Profile
            </button>
          )}

          <div className="header-badge">
            <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {viewMode === 'student' ? `Jobs Posted by ${alumniName}` : 'Posted Jobs'}
          </div>

          <h1>
            {viewMode === 'student'
              ? `Jobs from ${alumniName}`
              : 'Your Job Postings'
            }
          </h1>

          <p>
            {viewMode === 'student'
              ? `Explore career opportunities shared by ${alumniName}`
              : 'Manage all job opportunities you\'ve shared with the community'
            }
          </p>

          <div className="header-actions">
            <div className="jobs-count">
              <span className="count-number">{jobs.length}</span>
              <span className="count-label">
                Job{jobs.length !== 1 ? 's' : ''} Posted
              </span>
            </div>

            {viewMode === 'alumni' && (
              <button
                className="post-job-btn"
                onClick={() => window.location.href = "/alumni/jobs"}
              >
                <FaPlus /> Post New Job
              </button>
            )}
          </div>
        </div>

        {/* Jobs List */}
        <div className="jobs-section">
          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>
                {viewMode === 'student'
                  ? 'No jobs posted yet'
                  : 'No jobs posted yet'
                }
              </h3>
              <p>
                {viewMode === 'student'
                  ? 'This alumni hasn\'t posted any job opportunities yet.'
                  : 'Start sharing career opportunities with the Walchand community'
                }
              </p>
              {viewMode === 'alumni' && (
                <button
                  className="post-job-btn"
                  onClick={() => window.location.href = "/alumni/jobs"}
                >
                  <FaPlus /> Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="viewjobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="job-card-view">
                  <div className="job-card-header">
                    {job.image ? (
                      <img src={job.image} alt={job.company} className="company-logo" />
                    ) : (
                      <div className="company-logo-placeholder">
                        {job.company?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="job-title-section">
                      <h3>{job.title}</h3>
                      <p className="company-name">{job.company}</p>
                      <p className="job-location">
                        <FaMapMarkerAlt /> {job.location}
                      </p>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{job.description}</p>
                  </div>

                  <div className="job-card-actions">
                    <div className="action-left">
                      {job.link ? (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apply-btn"
                        >
                          <FaExternalLinkAlt /> Apply Now
                        </a>
                      ) : (
                        <button className="apply-btn disabled">
                          Apply Details
                        </button>
                      )}
                      <span className="post-date">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Show delete button only for alumni viewing their own jobs */}
                    {viewMode === 'alumni' && (
                      <div className="action-right">
                        <button
                          className="delete-job-btn"
                          onClick={() => deleteJob(job.id)}
                          title="Delete Job"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniViewJobs;