import React, { useEffect, useState, useRef } from "react";
import AlumniNavbar from "../components/AlumniNavbar";
import AlumniProfileService from "../services/AlumniProfileService";
import { FaCamera, FaTimes } from "react-icons/fa";
import "./AlumniProfile.css";

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching alumni profile data from backend...");
        const data = await AlumniProfileService.getProfile();
        console.log("🔄 Fetched alumni profile data:", data);

        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          graduationYear: data.graduationYear || "",
          degree: data.degree || "",
          branch: data.branch || "",
          currentCompany: data.currentCompany || "",
          position: data.position || "",
          about: data.about || "",
        });

        // Handle both file paths and base64 data
        if (data.profilePhoto && data.profilePhoto.startsWith('/uploads/')) {
          setProfilePhoto(`http://localhost:8080${data.profilePhoto}`);
        } else {
          setProfilePhoto(data.profilePhoto || null);
        }

        setError("");
      } catch (err) {
        console.error("❌ Error fetching alumni profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError("");
  };

  // Direct photo upload without entering edit mode
  const handlePhotoUpload = async (file) => {
    try {
      setUploadingPhoto(true);
      console.log("📸 Uploading alumni photo directly...");

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        console.log("📸 File converted to base64");

        // Create data object with current profile data + new photo
        const dataToSend = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          graduationYear: profile.graduationYear,
          degree: profile.degree,
          branch: profile.branch,
          currentCompany: profile.currentCompany,
          position: profile.position,
          about: profile.about,
          profilePhoto: base64Data
        };

        console.log("💾 Saving photo directly to backend...");
        const updated = await AlumniProfileService.updateProfile(dataToSend);

        // Update state with the response from backend
        console.log("✅ Alumni photo uploaded successfully:", updated);

        setProfile(updated);

        // Update profile photo with file path from backend
        if (updated.profilePhoto && updated.profilePhoto.startsWith('/uploads/')) {
          setProfilePhoto(`http://localhost:8080${updated.profilePhoto}`);
        } else {
          setProfilePhoto(updated.profilePhoto || null);
        }

        setSelectedFile(null);
        setUploadingPhoto(false);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Error uploading alumni photo:", err);
      setError(err.response?.data?.message || "Failed to upload photo");
      setUploadingPhoto(false);
    }
  };

  // Delete photo functionality
  const handleDeletePhoto = async () => {
    try {
      console.log("🗑️ Deleting alumni profile photo...");

      // Create data object with current profile data but empty photo
      const dataToSend = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        graduationYear: profile.graduationYear,
        degree: profile.degree,
        branch: profile.branch,
        currentCompany: profile.currentCompany,
        position: profile.position,
        about: profile.about,
        profilePhoto: "" // Empty string to delete photo
      };

      console.log("💾 Saving alumni profile with EMPTY photo to backend...");
      const updated = await AlumniProfileService.updateProfile(dataToSend);

      // Update state with the response from backend
      console.log("✅ Alumni photo deleted successfully:", updated);
      console.log("📷 Alumni profile photo after deletion:", updated.profilePhoto ? updated.profilePhoto : "NULL/EMPTY");

      setProfile(updated);
      setProfilePhoto(null);

    } catch (err) {
      console.error("❌ Error deleting alumni photo:", err);
      setError(err.response?.data?.message || "Failed to delete photo");
    }
  };

  // HandleSave - don't send profilePhoto unless it's a new base64 image
  const handleSave = async () => {
    try {
      // Create data object without profilePhoto to avoid sending stale data
      const dataToSend = { ...formData };

      // Only include profilePhoto if it's a new base64 image (from direct upload)
      // Otherwise, let backend handle the existing photo
      if (profilePhoto && profilePhoto.startsWith('data:image')) {
        dataToSend.profilePhoto = profilePhoto;
      } else {
        // Don't send profilePhoto field to let backend keep existing photo
        delete dataToSend.profilePhoto;
      }

      console.log("💾 Saving alumni profile data:", dataToSend);

      const updated = await AlumniProfileService.updateProfile(dataToSend);

      // Update state with the response from backend
      console.log("✅ Alumni profile updated response:", updated);

      setProfile(updated);
      setFormData({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        email: updated.email || "",
        phone: updated.phone || "",
        graduationYear: updated.graduationYear || "",
        degree: updated.degree || "",
        branch: updated.branch || "",
        currentCompany: updated.currentCompany || "",
        position: updated.position || "",
        about: updated.about || "",
      });

      // Update profile photo with file path from backend
      if (updated.profilePhoto && updated.profilePhoto.startsWith('/uploads/')) {
        setProfilePhoto(`http://localhost:8080${updated.profilePhoto}`);
      } else if (updated.profilePhoto && updated.profilePhoto === "") {
        // Handle case when photo was deleted
        setProfilePhoto(null);
      } else {
        setProfilePhoto(updated.profilePhoto || null);
      }

      setSelectedFile(null);
      setIsEditing(false);
      setError("");

    } catch (err) {
      console.error("❌ Error saving alumni profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      graduationYear: profile.graduationYear,
      degree: profile.degree,
      branch: profile.branch,
      currentCompany: profile.currentCompany,
      position: profile.position,
      about: profile.about,
    });

    // Reset to saved profile photo from backend
    if (profile.profilePhoto && profile.profilePhoto.startsWith('/uploads/')) {
      setProfilePhoto(`http://localhost:8080${profile.profilePhoto}`);
    } else {
      setProfilePhoto(profile.profilePhoto || null);
    }

    setSelectedFile(null);
    setIsEditing(false);
    setError("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-upload the photo when file is selected
      handlePhotoUpload(file);
    }
  };

  const initials = `${profile?.firstName?.charAt(0) || ""}${profile?.lastName?.charAt(0) || ""}`.toUpperCase() || "A";

  if (loading)
    return (
      <div className="alumni-profile-container">
        <div className="alumni-profile-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <AlumniNavbar />
        <div className="alumni-profile-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="alumni-profile-container">
        <div className="alumni-profile-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-pattern"></div>
        </div>
        <AlumniNavbar />
        <div className="alumni-profile-content">
          <div className="error-state">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="alumni-profile-container">
      <div className="alumni-profile-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-pattern"></div>
      </div>

      <AlumniNavbar />

      <div className="alumni-profile-content">
        <div className="alumni-profile-card">
          <div className="alumni-profile-header">
            <div className="alumni-profile-header-content">
              <div className="alumni-profile-avatar-section">
                <div className="alumni-profile-avatar-wrapper">
                  <div className="alumni-profile-avatar">
                    {uploadingPhoto ? (
                      <div className="uploading-spinner">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Camera Overlay - Always visible */}
                  <div className="change-photo-overlay" onClick={handleAvatarClick}>
                    <FaCamera />
                  </div>

                  {/* Delete Button - Only show when photo exists */}
                  {profilePhoto && !uploadingPhoto && (
                    <div className="delete-profile" onClick={handleDeletePhoto}>
                      <FaTimes />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="alumni-profile-user-info">
                <h1 className="alumni-profile-name">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="alumni-profile-email">{profile.email}</p>
                {profile.graduationYear && <p className="alumni-profile-batch">Batch of {profile.graduationYear}</p>}
              </div>

              <button className="alumni-edit-profile-btn" onClick={handleEditToggle}>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                </svg>
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="alumni-profile-body">
            <div className="alumni-profile-info-grid">
              <div className="alumni-info-section">
                <div className="alumni-section-header">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3>Personal Information</h3>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">First Name</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.firstName
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Last Name</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.lastName
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Email</span>
                  <span className="alumni-info-value">{profile.email}</span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Phone</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.phone || "Not provided"
                    )}
                  </span>
                </div>
              </div>

              <div className="alumni-info-section">
                <div className="alumni-section-header">
                  <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3>Academic & Professional</h3>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Graduation Year</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.graduationYear || "Not specified"
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Degree</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.degree || "Not specified"
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Branch</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.branch || "Not specified"
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Current Company</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.currentCompany || "Not specified"
                    )}
                  </span>
                </div>

                <div className="alumni-info-item">
                  <span className="alumni-info-label">Position</span>
                  <span className="alumni-info-value">
                    {isEditing ? (
                      <input
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="alumni-profile-input"
                      />
                    ) : (
                      profile.position || "Not specified"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="alumni-info-section alumni-info-full">
              <div className="alumni-section-header">
                <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>About</h3>
              </div>
              <div className="alumni-info-item alumni-info-item-full">
                <span className="alumni-info-value">
                  {isEditing ? (
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows="4"
                      className="alumni-profile-textarea"
                      placeholder="Tell us about yourself, your journey, achievements..."
                    />
                  ) : (
                    profile.about || "No information provided"
                  )}
                </span>
              </div>
            </div>

            {isEditing && (
              <div className="alumni-profile-actions">
                <button className="save-btn" onClick={handleSave}>
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;