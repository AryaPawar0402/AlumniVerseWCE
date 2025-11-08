import React, { useEffect, useState } from "react";
import { connectionService } from "../services/connectionService";
import { useNavigate } from "react-router-dom";
import "./StudentNetwork.css";

const StudentNetwork = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const studentId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (studentId && token) {
      fetchAllAlumni();
    } else {
      setError("Please log in to access this feature.");
    }
    // eslint-disable-next-line
  }, [studentId, token]);

  const fetchAllAlumni = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await connectionService.getAllAlumni();
      console.log("📥 Alumni data received:", res);
      setAlumniList(res || []);
      await fetchStudentConnections();
    } catch (err) {
      console.error("Error fetching alumni:", err);
      setError("Failed to load alumni data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentConnections = async () => {
    try {
      const res = await connectionService.getConnectionStatus(studentId);
      if (Array.isArray(res)) {
        const map = {};
        res.forEach((conn) => {
          if (conn.alumniId && conn.status) {
            map[conn.alumniId] = conn.status;
          }
        });
        setConnections(map);
      } else if (typeof res === "object" && res !== null) {
        setConnections(res);
      } else {
        setConnections({});
      }
    } catch (err) {
      console.error("Error fetching connection status:", err);
      setConnections({});
    }
  };

  const sendRequest = async (alumniId) => {
    try {
      await connectionService.sendConnectionRequest(studentId, alumniId);
      alert("Connection request sent!");
      await fetchStudentConnections();
    } catch (err) {
      console.error("Error sending request:", err);
      alert(err?.response?.data?.message || "Failed to send connection request.");
    }
  };

  const handleViewAlumniProfile = (alumniId) => {
    navigate(`/alumni-profile/${alumniId}`);
  };

  const filteredAlumni = alumniList.filter((alumni) => {
    if (!alumni) return false;
    const searchLower = searchTerm.toLowerCase();
    const profile = alumni.profile || {};

    // Convert batch to string for searching
    const batchString = profile.batch ? profile.batch.toString() : '';
    const graduationYearString = profile.graduationYear ? profile.graduationYear.toString() : '';

    return (
      (alumni.name && alumni.name.toLowerCase().includes(searchLower)) ||
      (profile.firstName && profile.firstName.toLowerCase().includes(searchLower)) ||
      (profile.lastName && profile.lastName.toLowerCase().includes(searchLower)) ||
      batchString.includes(searchTerm) || // Search batch as string
      graduationYearString.includes(searchTerm) || // Search graduation year as string
      (profile.branch && profile.branch.toLowerCase().includes(searchLower)) ||
      (profile.position && profile.position.toLowerCase().includes(searchLower)) ||
      (profile.currentCompany && profile.currentCompany.toLowerCase().includes(searchLower))
    );
  });

  // Enhanced alumni data extraction with proper photo handling
  const getAlumniDisplayData = (alumni) => {
    const profile = alumni.profile || {};

    // Handle profile photo URL - convert relative paths to absolute
    let photoUrl = profile.profilePhoto || null;
    if (photoUrl && photoUrl.startsWith('/uploads/')) {
      photoUrl = `http://localhost:8080${photoUrl}`;
    }

    return {
      id: alumni.id,
      name: profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : alumni.name || "Alumni Name",
      batch: profile.batch || profile.graduationYear || "Batch not specified",
      branch: profile.branch || "Branch not specified",
      position: profile.position || "Position not specified",
      company: profile.currentCompany || "",
      photoUrl: photoUrl,
      firstName: profile.firstName || '',
      lastName: profile.lastName || ''
    };
  };

  // Get initials for avatar placeholder
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'A';
  };

  if (!studentId || !token) {
    return (
      <div className="student-network-container">
        <div className="auth-warning-card">
          <div className="warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2>Authentication Required</h2>
          <p>Please log in to access the network features and connect with alumni</p>
          <button className="refresh-btn" onClick={() => (window.location.href = "/login")}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-network-container">
      <div className="network-content">
        <div className="network-header">
          <div className="header-badge">
            <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h1 className="network-heading">Alumni Network</h1>
          <p className="network-subtext">Discover and connect with industry-leading alumni</p>
        </div>

        <div className="network-controls">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, batch, branch, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button className="refresh-btn" onClick={fetchAllAlumni} disabled={loading}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="error-content">
              <p>{error}</p>
              <button className="retry-btn" onClick={() => { setError(""); fetchAllAlumni(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Discovering amazing alumni...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="results-bar">
              <p className="results-count">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                {filteredAlumni.length} {filteredAlumni.length === 1 ? 'Alumni' : 'Alumni'} Found
              </p>
            </div>

            <div className="alumni-grid">
              {filteredAlumni.length > 0 ? (
                filteredAlumni.map((alumni) => {
                  const alumniData = getAlumniDisplayData(alumni);
                  const status = connections[alumni.id];
                  const initials = getInitials(alumniData.firstName, alumniData.lastName);

                  return (
                    <div className={`alumni-card ${status === 'ACCEPTED' ? 'connected-card' : status === 'PENDING' ? 'pending-card' : ''}`} key={alumni.id}>
                      <div className={`card-glow ${status === 'ACCEPTED' ? 'success' : status === 'PENDING' ? 'pending' : ''}`}></div>

                      <div className="profile-image-container">
                        <div className={`image-border ${status === 'ACCEPTED' ? 'success' : status === 'PENDING' ? 'pending' : ''}`}></div>
                        {alumniData.photoUrl ? (
                          <img
                            src={alumniData.photoUrl}
                            alt={alumniData.name}
                            onError={(e) => {
                              console.log("❌ Error loading profile photo, showing initials");
                              e.target.style.display = 'none';
                              // Show initials as fallback
                              const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: alumniData.photoUrl ? 'none' : 'flex' }}>
                          {initials}
                        </div>
                      </div>

                      <div className="card-content">
                        <h3 className="alumni-name">{alumniData.name}</h3>
                        <div className="alumni-meta">
                          <span className="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                            </svg>
                            {alumniData.batch}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-item">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                            </svg>
                            {alumniData.branch}
                          </span>
                        </div>
                        <div className="alumni-position-tag">{alumniData.position}</div>
                        {alumniData.company && (
                          <div className="alumni-company">{alumniData.company}</div>
                        )}
                      </div>

                      <div className="connection-actions">
                        {status === "ACCEPTED" ? (
                          <div className="status-actions">
                            <div className="status-label connected">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              Connected
                            </div>
                            <button
                              className="view-profile-btn"
                              onClick={() => handleViewAlumniProfile(alumni.id)}
                            >
                              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              View Profile
                            </button>
                          </div>
                        ) : status === "PENDING" ? (
                          <div className="status-actions">
                            <div className="status-label pending">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                              </svg>
                              Request Pending
                            </div>
                            <button
                              className="view-profile-btn"
                              onClick={() => handleViewAlumniProfile(alumni.id)}
                            >
                              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              View Profile
                            </button>
                          </div>
                        ) : (
                          <div className="status-actions">
                            <button
                              className="connect-btn green-btn"
                              onClick={() => sendRequest(alumni.id)}
                            >
                              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                              Connect
                            </button>
                            <button
                              className="view-profile-btn secondary"
                              onClick={() => handleViewAlumniProfile(alumni.id)}
                            >
                              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              View Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state-view">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3>No Alumni Found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentNetwork;