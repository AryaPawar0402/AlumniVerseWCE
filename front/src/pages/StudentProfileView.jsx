import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlumniNavbar from "../components/AlumniNavbar";
import ChatButton from "../components/ChatButton";
import { connectionService } from "../services/connectionService";
import "./StudentProfileView.css";

const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      fetchStudentProfile(id);
    }
  }, [id]);

  const fetchStudentProfile = async (studentId) => {
    try {
      setLoading(true);
      setError('');

      // Use the new service method to fetch real student data
      const studentData = await connectionService.getStudentProfile(studentId);

      // Format profile photo URL properly
      if (studentData.profilePhoto && studentData.profilePhoto.startsWith('/uploads/')) {
        studentData.profilePhoto = `http://localhost:8080${studentData.profilePhoto}`;
      }

      setStudent(studentData);
      console.log("📸 Student profile photo:", studentData.profilePhoto);

    } catch (err) {
      console.error('Error loading student data:', err);
      setError('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewAchievements = () => {
    navigate(`/student-achievements/${id}`);
  };

  if (loading) {
    return (
      <div className="student-profile-view-container">
        <AlumniNavbar />
        <div className="student-profile-view-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading student profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="student-profile-view-container">
        <AlumniNavbar />
        <div className="student-profile-view-content">
          <div className="not-found-state">
            <svg className="not-found-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2>{error || 'Student Not Found'}</h2>
            <p>{error ? 'Please try again later.' : 'The student profile you\'re looking for doesn\'t exist.'}</p>
            <button onClick={handleBack} className="back-btn">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${student?.firstName?.charAt(0) || ''}${student?.lastName?.charAt(0) || ''}`.toUpperCase() || 'S';

  return (
    <div className="student-profile-view-container">
      <AlumniNavbar />

      <div className="student-profile-view-content">
        <div className="profile-view-header">
          <button className="back-button" onClick={handleBack}>
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Connections
          </button>
        </div>

        <div className="student-profile-view-card">
          <div className="profile-view-avatar-section">
            <div className="profile-view-avatar">
              {student.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  alt={`${student.firstName} ${student.lastName}`}
                  onError={(e) => {
                    console.log("❌ Error loading profile photo, showing placeholder");
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {(!student.profilePhoto || student.profilePhoto === "") && (
                <div className="avatar-placeholder">
                  {initials}
                </div>
              )}
            </div>
            <div className="profile-view-basic-info">
              <h1 className="profile-view-name">
                {student.firstName} {student.lastName}
              </h1>
              <p className="profile-view-email">{student.email}</p>
              {student.graduationYear && (
                <p className="profile-view-batch">Batch of {student.graduationYear}</p>
              )}

              {/* View Achievements Button */}
              <button
                className="view-achievements-btn"
                onClick={handleViewAchievements}
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                View Achievements
              </button>
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
                  <span className="detail-value">{student.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <span className="detail-value">{student.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{student.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{student.phone || "Not provided"}</span>
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
                  <span className="detail-value">{student.graduationYear || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Degree</span>
                  <span className="detail-value">{student.degree || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Branch</span>
                  <span className="detail-value">{student.branch || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Batch</span>
                  <span className="detail-value">{student.batch || "Not specified"}</span>
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
                  <span className="detail-value">{student.currentCompany || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Position</span>
                  <span className="detail-value">{student.position || "Not specified"}</span>
                </div>
              </div>
            </div>

            {student.about && (
              <div className="details-section full-width">
                <h3 className="section-title">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h3>
                <div className="about-content">
                  <p>{student.about}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Button - Only show if current user exists */}
      {currentUser && currentUser.id && (
        <ChatButton
          currentUserId={currentUser.id}
          otherUserId={student.id}
          otherUserName={`${student.firstName} ${student.lastName}`}
        />
      )}
    </div>
  );
};

export default StudentProfileView;