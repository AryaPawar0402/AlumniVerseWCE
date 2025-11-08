import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AlumniNavbar from "../components/AlumniNavbar";
import api from "../config/api";
import "./StudentAchievements.css";

const AlumniStudentAchievements = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSharingPost, setCurrentSharingPost] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
      fetchStudentAchievements();
    }
  }, [studentId]);

  // ✅ FIXED: Use the correct endpoint from ConnectionController
  const fetchStudentProfile = async () => {
    try {
      console.log("🔍 Fetching student profile for ID:", studentId);

      // Use the connection service endpoint instead of /students/{id}
      const response = await api.get(`/connections/students/${studentId}/profile`);
      console.log("✅ Student profile fetched:", response.data);
      setStudent(response.data);
    } catch (error) {
      console.error("❌ Error fetching student profile:", error);
      // Don't set error state, just log it
    }
  };

  // ✅ FIXED: Use the correct achievements endpoint
  const fetchStudentAchievements = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching achievements for student ID:", studentId);

      // Try the new endpoint first
      const res = await api.get(`/achievements/student/id/${studentId}`);
      console.log("✅ Student achievements fetched:", res.data);
      setAchievements(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch student achievements:", err);
      // Fallback: try the string-based endpoint
      try {
        const fallbackRes = await api.get(`/achievements/student/${studentId}`);
        console.log("✅ Fallback achievements fetched:", fallbackRes.data);
        setAchievements(fallbackRes.data);
      } catch (fallbackErr) {
        console.error("❌ Fallback also failed:", fallbackErr);
        setAchievements([]); // Set empty array
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Rest of your existing methods remain the same...
  const getFileUrl = (path) => {
    if (!path) return null;
    const fileName = path.split('/').pop().split('\\').pop();
    const encodedFileName = encodeURIComponent(fileName);
    const url = `http://localhost:8080/api/images/achievements/${encodedFileName}`;
    return url;
  };

  const isImage = (filePath) => {
    if (!filePath) return false;
    return /\.(jpeg|jpg|gif|png|bmp|webp)$/i.test(filePath);
  };

  const handleLike = (achievementId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(achievementId)) {
        newLiked.delete(achievementId);
      } else {
        newLiked.add(achievementId);
      }
      return newLiked;
    });
  };

  const handleAddComment = (achievementId) => {
    if (!newComment.trim()) return;

    setComments(prev => ({
      ...prev,
      [achievementId]: [
        ...(prev[achievementId] || []),
        {
          id: Date.now(),
          author: getUserName(),
          text: newComment,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
    setNewComment("");
  };

  const extractHashtags = (text) => {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.slice(0, 3);
  };

  const getUserName = () => {
    return localStorage.getItem("name") || "Alumni";
  };

  const getUserInitials = () => {
    const name = localStorage.getItem("name") || "Alumni";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStudentInitials = () => {
    if (!student) return 'S';
    return `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleShare = (achievement) => {
    console.log("🔄 Sharing achievement:", achievement);
    setCurrentSharingPost(achievement);
    setShowShareModal(true);
  };

  const shareOnWhatsApp = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const text = `Check out ${studentName}'s achievement: ${currentSharingPost.title}\n\n${currentSharingPost.description}\n\nShared via WCE Achievements`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const shareOnGmail = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const subject = `${studentName}'s Achievement: ${currentSharingPost.title}`;
    const body = `Hello,\n\nI wanted to share an achievement from ${studentName}:\n\nTitle: ${currentSharingPost.title}\nDescription: ${currentSharingPost.description}\n\nBest regards,\n${getUserName()}`;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'width=600,height=600');
    setShowShareModal(false);
  };

  const shareOnOutlook = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const subject = `${studentName}'s Achievement: ${currentSharingPost.title}`;
    const body = `Hello,%0D%0A%0D%0AI wanted to share an achievement from ${studentName}:%0D%0A%0D%0ATitle: ${currentSharingPost.title}%0D%0ADescription: ${currentSharingPost.description}%0D%0A%0D%0ABest regards,%0D%0A${getUserName()}`;
    const url = `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'width=600,height=600');
    setShowShareModal(false);
  };

  const shareOnLinkedIn = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const text = `I'm excited to share ${studentName}'s achievement: ${currentSharingPost.title}. ${currentSharingPost.description}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const text = `${studentName}'s Achievement: ${currentSharingPost.title}\n${currentSharingPost.description}\n\nShared via WCE Achievements`;
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Copied to clipboard!');
      setShowShareModal(false);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('❌ Failed to copy to clipboard');
      setShowShareModal(false);
    });
  };

  const downloadAsText = () => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const text = `WCE STUDENT ACHIEVEMENT\n\nStudent: ${studentName}\nTitle: ${currentSharingPost.title}\nDescription: ${currentSharingPost.description}\nDate: ${new Date().toLocaleDateString()}\nShared by: ${getUserName()}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievement-${currentSharingPost.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowShareModal(false);
  };

  return (
    <div className="achievements-container">
      {/* Decorative Background */}
      <div className="achievements-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <AlumniNavbar />

      {/* Share Modal */}
      {showShareModal && currentSharingPost && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share this achievement</h3>
              <button
                className="close-modal"
                onClick={() => setShowShareModal(false)}
              >
                ×
              </button>
            </div>
            <div className="share-options">
              <button className="share-option" onClick={shareOnWhatsApp}>
                <div className="share-icon whatsapp">📱</div>
                <span>WhatsApp</span>
              </button>
              <button className="share-option" onClick={shareOnGmail}>
                <div className="share-icon gmail">📧</div>
                <span>Gmail</span>
              </button>
              <button className="share-option" onClick={shareOnOutlook}>
                <div className="share-icon outlook">📨</div>
                <span>Outlook</span>
              </button>
              <button className="share-option" onClick={shareOnLinkedIn}>
                <div className="share-icon linkedin">💼</div>
                <span>LinkedIn</span>
              </button>
              <button className="share-option" onClick={copyToClipboard}>
                <div className="share-icon copy">📋</div>
                <span>Copy Text</span>
              </button>
              <button className="share-option" onClick={downloadAsText}>
                <div className="share-icon download">💾</div>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="achievements-content">
        <div className="achievements-wrapper">
          {/* Header */}
          <div className="achievements-header">
            <button className="back-button" onClick={handleBack}>
              <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </button>

            <div className="header-content">
              <h2>
                {student
                  ? `${student.firstName} ${student.lastName}'s Achievements`
                  : `Student ${studentId}'s Achievements`
                }
              </h2>
            </div>
            <p className="header-subtitle">Celebrating student success and accomplishments</p>

            {/* Stats */}
            <div className="achievements-stats">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-number">{achievements.length}</span>
                  <span className="stat-label">Total Achievements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Only - No Post Form */}
          <div className="feed-section">
            <h3 className="feed-title">Achievements Feed</h3>
            <div className="achievement-feed">
              {loading ? (
                <div className="loading-card">
                  <div className="loading-spinner"></div>
                  <p>Loading achievements...</p>
                </div>
              ) : achievements.length === 0 ? (
                <div className="empty-state">
                  <h4>No achievements yet</h4>
                  <p>This student hasn't posted any achievements yet.</p>
                </div>
              ) : (
                achievements.map((ach, idx) => {
                  const hashtags = extractHashtags(ach.description);
                  const isLiked = likedPosts.has(ach.id || idx);
                  const postComments = comments[ach.id || idx] || [];

                  return (
                    <div key={ach.id || idx} className="achievement-item">
                      {/* User Header */}
                      <div className="achievement-header">
                        <div className="user-avatar">{getStudentInitials()}</div>
                        <div className="user-info">
                          <h4>{student ? `${student.firstName} ${student.lastName}` : 'Student'}</h4>
                          <small>{new Date(ach.createdAt).toLocaleDateString()} • 🌐</small>
                        </div>
                        <div className="achievement-menu">
                          <button className="menu-dots">⋯</button>
                        </div>
                      </div>

                      {/* Achievement Content */}
                      <div className="achievement-text">
                        <h4>{ach.title}</h4>
                        <p>{ach.description}</p>
                      </div>

                      {/* Media Section */}
                      {ach.imagePath && isImage(ach.imagePath) ? (
                        <div className="achievement-image-container">
                          <img
                            src={getFileUrl(ach.imagePath)}
                            alt={ach.title}
                            className="achievement-image"
                            onError={(e) => {
                              console.error('Image failed to load:', ach.imagePath);
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => console.log('Image loaded successfully:', ach.imagePath)}
                          />
                        </div>
                      ) : ach.imagePath ? (
                        <div className="achievement-file-container">
                          <a href={getFileUrl(ach.imagePath)} target="_blank" rel="noopener noreferrer" className="file-link">
                            📄 View Attached File
                          </a>
                        </div>
                      ) : null}

                      {/* Stats */}
                      <div className="achievement-stats">
                        <span>
                          {isLiked ? "👍 You" : ""}
                          {isLiked && " and others liked this"}
                        </span>
                        <span>{postComments.length} comments</span>
                      </div>

                      {/* Reaction Buttons */}
                      <div className="achievement-reactions">
                        <button
                          className={`reaction-btn ${isLiked ? 'liked' : ''}`}
                          onClick={() => handleLike(ach.id || idx)}
                        >
                          👍 Like
                        </button>
                        <button className="reaction-btn">💬 Comment</button>
                        <button
                          className="reaction-btn"
                          onClick={() => handleShare(ach)}
                        >
                          🔄 Share
                        </button>
                      </div>

                      {/* Hashtags */}
                      {hashtags.length > 0 && (
                        <div className="achievement-tags">
                          {hashtags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Comment Section */}
                      <div className="achievement-comments">
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Add a comment as alumni..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(ach.id || idx)}
                        />
                        {postComments.map(comment => (
                          <div key={comment.id} className="comment">
                            <div className="comment-author">{comment.author}</div>
                            <div className="comment-text">{comment.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniStudentAchievements;