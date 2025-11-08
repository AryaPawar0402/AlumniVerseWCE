import React, { useEffect, useState, useRef } from "react";
import AlumniNavbar from "../components/AlumniNavbar";
import { FaPlus, FaImage, FaMapMarkerAlt, FaBuilding, FaLink, FaEye } from "react-icons/fa";
import "./AlumniJobs.css";

const AlumniJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    link: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAlumni, setCurrentAlumni] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedJobs = localStorage.getItem('alumniPostedJobs');
    if (savedJobs) {
      const parsedJobs = JSON.parse(savedJobs);
      if (Array.isArray(parsedJobs)) {
        setJobs(parsedJobs);
      }
    }

    fetchAlumniProfile();
  }, []);

  const fetchAlumniProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoints = [
        '/api/alumni/profile',
        '/api/profile',
        '/api/user/profile',
        '/api/alumni/me',
        '/api/users/me'
      ];

      let profileData = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            profileData = await response.json();
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!profileData) {
        throw new Error('Could not fetch profile from any endpoint');
      }

      const alumniName = extractAlumniName(profileData);
      const alumniId = profileData.id || profileData.userId || `alumni_${Date.now()}`;

      setCurrentAlumni({
        name: alumniName,
        id: alumniId,
        profileData: profileData
      });

    } catch (error) {
      console.error('❌ Error fetching alumni profile:', error);
      const fallbackData = getFallbackAlumniData();
      setCurrentAlumni(fallbackData);
    } finally {
      setLoadingProfile(false);
    }
  };

  const extractAlumniName = (profileData) => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (profileData.name) return profileData.name;
    if (profileData.fullName) return profileData.fullName;
    if (profileData.user?.firstName && profileData.user?.lastName) {
      return `${profileData.user.firstName} ${profileData.user.lastName}`;
    }
    if (profileData.user?.name) return profileData.user.name;
    if (profileData.email) {
      const emailName = profileData.email.split('@')[0];
      return emailName.split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return "Alumni User";
  };

  const getFallbackAlumniData = () => {
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key =>
      key.includes('user') ||
      key.includes('profile') ||
      key.includes('auth') ||
      key.includes('token')
    );

    let bestName = "Alumni User";

    userKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && typeof data === 'object') {
          if (data.firstName && data.lastName && data.firstName !== "Alumni") {
            bestName = `${data.firstName} ${data.lastName}`;
          } else if (data.name && data.name !== "Alumni") {
            bestName = data.name;
          }
        }
      } catch (e) {
        // Ignore non-JSON data
      }
    });

    return {
      name: bestName,
      id: `alumni_${Date.now()}`,
      isFallback: true
    };
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentAlumni) {
      alert("Unable to fetch your profile data. Please try again.");
      return;
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.title,
      company: formData.company,
      location: formData.location,
      description: formData.description,
      link: formData.link,
      image: imagePreview,
      createdAt: new Date().toISOString(),
      postedBy: currentAlumni.name,
      alumniId: currentAlumni.id,
      isRealData: !currentAlumni.isFallback
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    localStorage.setItem('alumniPostedJobs', JSON.stringify(updatedJobs));

    setFormData({
      title: "",
      company: "",
      location: "",
      description: "",
      link: "",
      image: null
    });
    setImagePreview(null);
    setShowJobForm(false);

    alert(`Job posted successfully! It will appear as posted by ${currentAlumni.name}`);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loadingProfile) {
    return (
      <div className="alumni-jobs-container">
        <div className="alumni-jobs-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <AlumniNavbar />
        <div className="alumni-jobs-content-wrapper">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-jobs-container">
      {/* Decorative Background */}
      <div className="alumni-jobs-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <AlumniNavbar />

      <div className="alumni-jobs-content-wrapper">
        <div className="alumni-jobs-content">
          {/* Header Section */}
          <div className="alumni-jobs-header">
            <h1>Post Job Opportunities</h1>
            <p>Share career opportunities with the Walchand community</p>
            <div className="alumni-header-actions">
              <button
                className="alumni-post-job-btn"
                onClick={() => setShowJobForm(true)}
              >
                <FaPlus /> Post a Job
              </button>
              {jobs.length > 0 && (
                <button
                  className="alumni-view-jobs-btn"
                  onClick={() => window.location.href = "/alumni/view-jobs"}
                >
                  <FaEye /> View Jobs ({jobs.length})
                </button>
              )}
            </div>
          </div>

          {/* Job Posting Form Modal */}
          {showJobForm && currentAlumni && (
            <div className="alumni-modal-overlay">
              <div className="alumni-job-form-modal">
                <div className="alumni-modal-header">
                  <h2>Post a New Job</h2>
                  <button
                    className="alumni-close-btn"
                    onClick={() => setShowJobForm(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="alumni-job-form">
                  <div className="alumni-form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>

                  <div className="alumni-form-row">
                    <div className="alumni-form-group">
                      <label><FaBuilding /> Company *</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company name"
                        required
                      />
                    </div>
                    <div className="alumni-form-group">
                      <label><FaMapMarkerAlt /> Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Pune, Maharashtra"
                        required
                      />
                    </div>
                  </div>

                  <div className="alumni-form-group">
                    <label>Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the role, requirements, and benefits..."
                      rows="5"
                      required
                    />
                  </div>

                  <div className="alumni-form-group">
                    <label><FaLink /> Application Link</label>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="https://company.com/careers"
                    />
                  </div>

                  <div className="alumni-form-group">
                    <label>Company/Job Image</label>
                    <div className="alumni-image-upload-section">
                      <button
                        type="button"
                        className="alumni-image-upload-btn"
                        onClick={triggerFileInput}
                      >
                        <FaImage /> Choose Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      {imagePreview && (
                        <div className="alumni-image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alumni Info Display */}
                  <div className="alumni-posting-as-info">
                    <div className="alumni-posting-as-card">
                      <h4>📝 You are posting as:</h4>
                      <div className="alumni-alumni-details">
                        <div className="alumni-detail-item">
                          <span className="alumni-label">Name:</span>
                          <span className="alumni-value">{currentAlumni.name}</span>
                        </div>
                      </div>
                      <p className="alumni-info-note">
                        Students will see your name when viewing this job post.
                        {currentAlumni.isFallback && " Update your profile for better visibility."}
                      </p>
                    </div>
                  </div>

                  <div className="alumni-form-actions">
                    <button type="button" onClick={() => setShowJobForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="alumni-submit-btn">
                      Post Job as {currentAlumni.name}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniJobs;
