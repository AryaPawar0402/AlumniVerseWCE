import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FaMapMarkerAlt, FaExternalLinkAlt, FaBuilding, FaUserGraduate, FaCalendarAlt, FaSearch } from "react-icons/fa";
import "./StudentJobs.css";

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    const fetchJobs = () => {
      try {
        const savedJobs = localStorage.getItem('alumniPostedJobs');
        if (savedJobs) {
          const parsedJobs = JSON.parse(savedJobs);
          if (Array.isArray(parsedJobs)) {
            const enhancedJobs = parsedJobs.map(job => ({
              id: job.id || Date.now().toString(),
              title: job.title || "Untitled Position",
              company: job.company || "Unknown Company",
              location: job.location || "Remote",
              description: job.description || "No description provided.",
              link: job.link || "",
              image: job.image || null,
              createdAt: job.createdAt || new Date().toISOString(),
              postedBy: job.postedBy || "Walchand Alumni",
              alumniId: job.alumniId,
              isRealData: job.isRealData || false
            }));
            setJobs(enhancedJobs);
            setFilteredJobs(enhancedJobs);
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.postedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCompany) {
      filtered = filtered.filter(job => job.company === selectedCompany);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedCompany, jobs]);

  const companies = [...new Set(jobs.map(job => job.company).filter(Boolean))];
  const alumniNames = [...new Set(jobs.map(job => job.postedBy).filter(Boolean))];

  const handleApply = (job) => {
    if (job.link) {
      window.open(job.link, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Application process for ${job.title} at ${job.company}\n\nPlease check the company's career page for application details.`);
    }
  };

  const getAlumniInitials = (alumniName) => {
    if (!alumniName) return "AL";
    return alumniName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("");
  };

  if (loading) {
    return (
      <div className="student-jobs-container">
        <div className="jobs-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <Navbar />
        <div className="jobs-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading job opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-jobs-container">
      {/* Decorative Background */}
      <div className="jobs-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <Navbar />

      <div className="jobs-content">
        <div className="jobs-wrapper">
          {/* Header Section */}
          <div className="jobs-header">
            <div className="header-content">
              <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1>Career Opportunities</h1>
            </div>
            <p className="header-subtitle">Discover amazing job opportunities shared by Walchand alumni</p>

            {/* Stats */}
            <div className="jobs-stats">
              <div className="stat-card">
                <FaBuilding className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{jobs.length}</span>
                  <span className="stat-label">Total Jobs</span>
                </div>
              </div>
              <div className="stat-card">
                <FaUserGraduate className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{companies.length}</span>
                  <span className="stat-label">Companies</span>
                </div>
              </div>
              <div className="stat-card">
                <FaUserGraduate className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{alumniNames.length}</span>
                  <span className="stat-label">Alumni Contributors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-box">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, alumni, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Filter by Company:</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="company-filter"
                >
                  <option value="">All Companies</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div className="filter-actions">
                <div className="results-count">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </div>
                {(searchTerm || selectedCompany) && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="jobs-section">
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3>No jobs found</h3>
                <p>
                  {jobs.length === 0
                    ? "No job opportunities have been posted yet. Check back later!"
                    : "No jobs match your search criteria. Try different keywords or filters."
                  }
                </p>
                {(searchTerm || selectedCompany) && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
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
                            {job.isRealData ? "Posted by Walchand Alumni" : "Shared by Alumni"}
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

export default StudentJobs;
