import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNavbar from "../components/Navbar";
import ChatButton from "../components/ChatButton";
import { connectionService } from "../services/connectionService";
import "./AlumniProfileView.css";

const AlumniProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobsCount, setJobsCount] = useState(0);
  const [alumniJobs, setAlumniJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (id) {
      fetchAlumniProfile(id);
    }
  }, [id]);

  const fetchAlumniProfile = async (alumniId) => {
    try {
      setLoading(true);
      setError('');

      const alumniData = await connectionService.getAlumniProfile(alumniId);

      // Format profile photo URL properly
      if (alumniData.profilePhoto && alumniData.profilePhoto.startsWith('/uploads/')) {
        alumniData.profilePhoto = `http://localhost:8080${alumniData.profilePhoto}`;
      }

      setAlumni(alumniData);
      console.log("📸 Alumni profile photo:", alumniData.profilePhoto);

      // Fetch jobs after alumni data is loaded
      fetchAlumniJobs(alumniData);

    } catch (err) {
      console.error('Error loading alumni data:', err);
      setError('Failed to load alumni profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniJobs = (alumniData) => {
    try {
      const alumniName = `${alumniData.firstName} ${alumniData.lastName}`;

      const savedJobs = localStorage.getItem('alumniPostedJobs');
      console.log('Saved jobs from localStorage:', savedJobs);

      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        console.log('Parsed jobs:', parsedJobs);

        if (Array.isArray(parsedJobs)) {
          // Match by alumniId OR by alumni name
          const filteredJobs = parsedJobs.filter(job => {
            const matchesId = job.alumniId === id;
            const matchesName = job.postedBy === alumniName;
            console.log(`Job ${job.id}: alumniId=${job.alumniId}, postedBy=${job.postedBy}, matchesId=${matchesId}, matchesName=${matchesName}`);
            return matchesId || matchesName;
          });

          console.log('Filtered alumni jobs:', filteredJobs);
          setAlumniJobs(filteredJobs);
          setJobsCount(filteredJobs.length);
        }
      } else {
        console.log('No jobs found in localStorage');
        setAlumniJobs([]);
        setJobsCount(0);
      }
    } catch (error) {
      console.error('Error counting alumni jobs:', error);
      setAlumniJobs([]);
      setJobsCount(0);
    }
  };

  const handleViewJobs = () => {
    navigate(`/alumni-jobs/${id}`, {
      state: {
        alumniName: `${alumni.firstName} ${alumni.lastName}`,
        alumniId: id,
        filteredJobs: alumniJobs
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="alumni-profile-view-container">
        <StudentNavbar />
        <div className="alumni-profile-view-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading alumni profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="alumni-profile-view-container">
        <StudentNavbar />
        <div className="alumni-profile-view-content">
          <div className="not-found-state">
            <svg className="not-found-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2>{error || 'Alumni Not Found'}</h2>
            <p>{error ? 'Please try again later.' : 'The alumni profile you\'re looking for doesn\'t exist.'}</p>
            <button onClick={handleBack} className="back-btn">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${alumni?.firstName?.charAt(0) || ''}${alumni?.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';

  return (
    <div className="alumni-profile-view-container">
      <StudentNavbar />

      <div className="alumni-profile-view-content">
        <div className="profile-view-header">
          <button className="back-button" onClick={handleBack}>
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Network
          </button>
        </div>

        <div className="alumni-profile-view-card">
          <div className="profile-view-avatar-section">
            <div className="profile-view-avatar">
              {alumni.profilePhoto ? (
                <img
                  src={alumni.profilePhoto}
                  alt={`${alumni.firstName} ${alumni.lastName}`}
                  onError={(e) => {
                    console.log("❌ Error loading profile photo, showing placeholder");
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {(!alumni.profilePhoto || alumni.profilePhoto === "") && (
                <div className="avatar-placeholder">
                  {initials}
                </div>
              )}
            </div>
            <div className="profile-view-basic-info">
              <h1 className="profile-view-name">
                {alumni.firstName} {alumni.lastName}
              </h1>
              <p className="profile-view-email">{alumni.email}</p>
              {alumni.graduationYear && (
                <p className="profile-view-batch">Batch of {alumni.graduationYear}</p>
              )}
              {alumni.currentCompany && (
                <p className="profile-view-company">{alumni.currentCompany}</p>
              )}
            </div>
          </div>

          <div className="profile-view-details">
            <div className="details-grid">
              <div className="details-section">
                <h3 className="section-title">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="detail-item">
                  <span className="detail-label">First Name</span>
                  <span className="detail-value">{alumni.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <span className="detail-value">{alumni.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{alumni.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{alumni.phone || "Not provided"}</span>
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                  Academic Information
                </h3>
                <div className="detail-item">
                  <span className="detail-label">Graduation Year</span>
                  <span className="detail-value">{alumni.graduationYear || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Degree</span>
                  <span className="detail-value">{alumni.degree || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Branch</span>
                  <span className="detail-value">{alumni.branch || "Not specified"}</span>
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Professional Information
                </h3>
                <div className="detail-item">
                  <span className="detail-label">Current Company</span>
                  <span className="detail-value">{alumni.currentCompany || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Position</span>
                  <span className="detail-value">{alumni.position || "Not specified"}</span>
                </div>
              </div>
            </div>

            {alumni.about && (
              <div className="details-section full-width">
                <h3 className="section-title">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h3>
                <div className="about-content">
                  <p>{alumni.about}</p>
                </div>
              </div>
            )}

            {/* Career Opportunities Section */}
            <div className="details-section full-width">
              <h3 className="section-title">
                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Career Opportunities
              </h3>
              <div className="jobs-action-section">
                <div className="jobs-action-content">
                  <div className="jobs-action-info">
                    {jobsCount > 0 ? (
                      <>
                        <h4>Explore Job Opportunities</h4>
                        <p>This alumni has posted {jobsCount} job opportunity{jobsCount !== 1 ? 's' : ''}. Click below to view all available positions.</p>
                      </>
                    ) : (
                      <>
                        <h4>No Jobs Posted Yet</h4>
                        <p>This alumni hasn't posted any job opportunities yet. Check back later for career opportunities.</p>
                      </>
                    )}
                  </div>
                  {jobsCount > 0 && (
                    <button className="view-jobs-btn" onClick={handleViewJobs}>
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      View Jobs Posted ({jobsCount})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button - Only show if current user exists */}
      {currentUser && currentUser.id && (
        <ChatButton
          currentUserId={currentUser.id}
          otherUserId={alumni.id}
          otherUserName={`${alumni.firstName} ${alumni.lastName}`}
        />
      )}
    </div>
  );
};

export default AlumniProfileView;