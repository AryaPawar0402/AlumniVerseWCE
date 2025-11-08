import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../config/api";
import "./StudentAchievements.css";

const StudentAchievements = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSharingPost, setCurrentSharingPost] = useState(null);

  // Debug localStorage
  const debugLocalStorage = () => {
    console.log("🔍 LocalStorage Contents:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value}`);
    }
  };

  // Get email from JWT token
  const getEmailFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email;
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = localStorage.getItem("name") || "Your Profile";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = () => {
    return localStorage.getItem("name") || "Your Profile";
  };

  useEffect(() => {
    debugLocalStorage();
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/achievements/student/me");
      console.log("🔍 Fetched achievements:", res.data);
      setAchievements(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch achievements:", err);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    const emailFromToken = getEmailFromToken(token);
    const studentId = localStorage.getItem("studentId") ||
                      localStorage.getItem("email") ||
                      emailFromToken;

    console.log("🔍 Student ID:", studentId);

    if (!studentId) {
      alert("❌ No student ID found. Please login again.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    const achievementData = {
      studentId: studentId,
      title,
      description,
    };

    console.log("Achievement Data:", achievementData);

    try {
      formData.append("data", JSON.stringify(achievementData));

      if (file) {
        formData.append("file", file);
        console.log("Uploading file:", file.name);
      }

      console.log("Sending upload request...");

      const response = await api.post("/achievements/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Upload successful:", response.data);
      alert("Achievement posted successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchAchievements();

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please check console for details.");
    } finally {
      setUploading(false);
    }
  };

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

  // LinkedIn-style interactions
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
    return hashtags.slice(0, 3); // Limit to 3 hashtags
  };

  // Real Share Functionality
  const handleShare = (achievement) => {
    console.log("🔄 Sharing achievement:", achievement);
    setCurrentSharingPost(achievement);
    setShowShareModal(true);
  };

  const shareOnWhatsApp = () => {
    const text = `Check out my achievement: ${currentSharingPost.title}\n\n${currentSharingPost.description}\n\nShared via WCE Achievements`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const shareOnGmail = () => {
    const subject = `My Achievement: ${currentSharingPost.title}`;
    const body = `Hello,\n\nI wanted to share my achievement with you:\n\nTitle: ${currentSharingPost.title}\nDescription: ${currentSharingPost.description}\n\nBest regards,\n${getUserName()}`;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'width=600,height=600');
    setShowShareModal(false);
  };

  const shareOnOutlook = () => {
    const subject = `My Achievement: ${currentSharingPost.title}`;
    const body = `Hello,%0D%0A%0D%0AI wanted to share my achievement with you:%0D%0A%0D%0ATitle: ${currentSharingPost.title}%0D%0ADescription: ${currentSharingPost.description}%0D%0A%0D%0ABest regards,%0D%0A${getUserName()}`;
    const url = `https://outlook.live.com/owa/?path=/mail/action/compose&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'width=600,height=600');
    setShowShareModal(false);
  };

  const shareOnLinkedIn = () => {
    const text = `I'm excited to share my achievement: ${currentSharingPost.title}. ${currentSharingPost.description}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    const text = `Achievement: ${currentSharingPost.title}\n${currentSharingPost.description}\n\nShared via WCE Achievements`;
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
    const text = `WCE ACHIEVEMENT\n\nTitle: ${currentSharingPost.title}\nDescription: ${currentSharingPost.description}\nDate: ${new Date().toLocaleDateString()}\nShared by: ${getUserName()}`;

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

      <Navbar />

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
            <div className="header-content">
              <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h2>Share Your Achievements</h2>
            </div>
            <p className="header-subtitle">Celebrate your success and inspire others in the community</p>
          </div>

          {/* Post Form */}
          <form onSubmit={handleSubmit} className="achievement-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Achievement Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={uploading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Describe your achievement in detail... (Use #hashtags for better reach)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={uploading}
                className="form-textarea"
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,.pdf,.doc,.docx"
                  disabled={uploading}
                  id="file-upload"
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-label">
                  <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{file ? file.name : "Attach Image or Document"}</span>
                </label>
              </div>
            </div>

            <button type="submit" className="upload-btn" disabled={uploading}>
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Post Achievement</span>
                </>
              )}
            </button>
          </form>

          {/* Feed */}
          <div className="feed-section">
            <h3 className="feed-title">Your Achievements Feed</h3>
            <div className="achievement-feed">
              {loading ? (
                <div className="loading-card">
                  <div className="loading-spinner"></div>
                  <p>Loading achievements...</p>
                </div>
              ) : achievements.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h4>No achievements yet</h4>
                  <p>Share your first achievement and inspire the community!</p>
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
                        <div className="user-avatar">{getUserInitials()}</div>
                        <div className="user-info">
                          <h4>{getUserName()}</h4>
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
                          placeholder="Add a comment..."
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

export default StudentAchievements;
