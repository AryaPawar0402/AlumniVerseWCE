import React, { useEffect, useState } from "react";
import { connectionService } from "../services/connectionService";
import { useNavigate } from "react-router-dom";
import "./AlumniConnections.css";

const AlumniConnections = () => {
  const [pending, setPending] = useState([]);
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const alumniId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (alumniId) {
      fetchLists();
    }
  }, [alumniId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const [pendingRes, connectedRes] = await Promise.all([
        connectionService.getPendingRequests(alumniId),
        connectionService.getAlumniConnections(alumniId),
      ]);

      console.log("📥 Pending requests:", pendingRes);
      console.log("📥 Connected students:", connectedRes);

      setPending(pendingRes || []);
      setConnected(connectedRes || []);
    } catch (err) {
      console.error("Error fetching connection lists:", err);
      setPending([]);
      setConnected([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      setAcceptingId(connectionId);
      await connectionService.acceptRequest(connectionId);
      setPending((prev) => prev.filter((r) => r.id !== connectionId));

      // Refresh the connections list
      const updatedConnections = await connectionService.getAlumniConnections(alumniId);
      setConnected(updatedConnections || []);
    } catch (err) {
      console.error("Error accepting connection:", err);
      alert(err.message || "Failed to accept connection. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      setPending((prev) => prev.filter((r) => r.id !== connectionId));
    } catch (err) {
      console.error("Error rejecting connection:", err);
      alert(err.message || "Failed to reject connection");
    }
  };

  const handleViewProfile = (studentId) => {
    if (studentId) {
      navigate(`/student-profile/${studentId}`);
    } else {
      alert("Student profile not available");
    }
  };

  // UPDATED: Enhanced profile photo URL formatting with better default
  const getStudentFromConnection = (conn) => {
    const student = conn.student || {};

    // Format profile photo URL properly with default fallback
    let photoUrl = null;

    if (student.profilePhoto && student.profilePhoto.trim() !== "") {
      if (student.profilePhoto.startsWith('/uploads/')) {
        photoUrl = `http://localhost:8080${student.profilePhoto}`;
      } else if (student.profilePhoto.startsWith('http')) {
        photoUrl = student.profilePhoto;
      } else if (student.profilePhoto.startsWith('data:image')) {
        photoUrl = student.profilePhoto;
      }
    }

    // Use the data from StudentDTO that now includes profile information
    const studentData = {
      id: student.id || '',
      name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
      batch: student.batch || student.graduationYear || "Batch not specified",
      branch: student.branch || "Branch not specified",
      position: student.position || student.currentCompany || "Position not specified",
      photoUrl: photoUrl,
      firstName: student.firstName || '',
      lastName: student.lastName || ''
    };

    console.log("👤 Student data for card:", studentData);
    return studentData;
  };

  // NEW: Get initials for default avatar (same as student profile)
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'S';
  };

  if (loading) {
    return (
      <div className="connections-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="connections-container">
      <div className="connections-content">
        <div className="connections-header">
          <div className="header-badge">
            <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="network-heading">Alumni Connections</h1>
          <p className="network-subtext">Manage your professional network and connection requests</p>

          <div className="network-controls">
            <button className="refresh-btn" onClick={fetchLists} disabled={loading}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="connections-sections">
          {/* Pending Requests Section */}
          <div className="connections-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Pending Requests</h2>
                <span className="count-badge">{pending.length}</span>
              </div>
              <div className="section-decoration"></div>
            </div>

            {pending.length === 0 ? (
              <div className="empty-state-view">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>All Caught Up!</h3>
                <p>No pending requests at the moment</p>
              </div>
            ) : (
              <div className="alumni-grid">
                {pending.map((req) => {
                  const student = getStudentFromConnection(req);
                  const initials = getInitials(student.firstName, student.lastName);

                  return (
                    <div className="alumni-card pending-card" key={req.id}>
                      <div className="card-glow"></div>

                      <div className="profile-image-container">
                        <div className="image-border"></div>
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            onError={(e) => {
                              console.log("❌ Error loading profile photo, showing initials");
                              e.target.style.display = 'none';
                              // Show initials as fallback
                              const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: student.photoUrl ? 'none' : 'flex' }}>
                          {initials}
                        </div>
                        <div className="status-badge pending-badge">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                          </svg>
                          Pending
                        </div>
                      </div>

                      <div className="card-content">
                        <h3 className="alumni-name">{student.name}</h3>
                        <div className="alumni-meta">
                          <span className="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                            {student.batch}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-item">{student.branch}</span>
                        </div>
                        <div className="alumni-position-tag">{student.position}</div>
                      </div>

                      <div className="connection-actions">
                        <button
                          className="action-btn accept-btn"
                          onClick={() => handleAccept(req.id)}
                          disabled={acceptingId === req.id}
                        >
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {acceptingId === req.id ? "Accepting..." : "Accept"}
                        </button>
                        <button className="action-btn reject-btn" onClick={() => handleReject(req.id)}>
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                        <button
                          className="action-btn view-profile-btn"
                          onClick={() => handleViewProfile(student.id)}
                        >
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Connected Students Section */}
          <div className="connections-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Connected Students</h2>
                <span className="count-badge success">{connected.length}</span>
              </div>
              <div className="section-decoration"></div>
            </div>

            {connected.length === 0 ? (
              <div className="empty-state-view">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3>Build Your Network</h3>
                <p>When you accept requests, they'll appear here</p>
              </div>
            ) : (
              <div className="alumni-grid">
                {connected.map((conn) => {
                  const student = getStudentFromConnection(conn);
                  const initials = getInitials(student.firstName, student.lastName);

                  return (
                    <div className="alumni-card connected-card" key={conn.id}>
                      <div className="card-glow success"></div>

                      <div className="profile-image-container">
                        <div className="image-border success"></div>
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            onError={(e) => {
                              console.log("❌ Error loading profile photo, showing initials");
                              e.target.style.display = 'none';
                              // Show initials as fallback
                              const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: student.photoUrl ? 'none' : 'flex' }}>
                          {initials}
                        </div>
                        <div className="status-badge connected-badge">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Connected
                        </div>
                      </div>

                      <div className="card-content">
                        <h3 className="alumni-name">{student.name}</h3>
                        <div className="alumni-meta">
                          <span className="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                            {student.batch}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-item">{student.branch}</span>
                        </div>
                        <div className="alumni-position-tag">{student.position}</div>
                      </div>

                      <div className="connection-actions">
                        <button
                          className="action-btn view-profile-btn primary"
                          onClick={() => handleViewProfile(student.id)}
                        >
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniConnections;