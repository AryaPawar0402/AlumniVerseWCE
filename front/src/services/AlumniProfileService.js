// services/AlumniProfileService.js
import api from "../config/api";

// ✅ Get logged-in alumni's profile
export const getProfile = async () => {
  try {
    console.log("🔄 AlumniProfileService: Fetching alumni profile...");
    const res = await api.get("/alumni/profile");
    console.log("✅ AlumniProfileService: Alumni profile fetched successfully", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ AlumniProfileService: Error fetching alumni profile", error);
    throw error;
  }
};

// ✅ Update alumni profile with file upload support
export const updateProfile = async (formData) => {
  try {
    console.log("🔄 AlumniProfileService: Sending update request to backend...");

    // Check if data is FormData (file upload) or regular object
    if (formData instanceof FormData) {
      console.log("📁 Detected FormData, sending as multipart/form-data");

      // Debug: Check what's in the FormData
      console.log("🔍 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.type}, ${value.size} bytes)` : value);
      }

      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

      console.log("🌐 Sending multipart request to:", `${API_URL}/alumni/profile/upload`);

      const response = await fetch(`${API_URL}/alumni/profile/upload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ AlumniProfileService: Profile updated successfully with file", result);
      return result;
    } else {
      // Regular JSON data
      console.log("📄 Sending as JSON data:", formData);
      const res = await api.put("/alumni/profile", formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("✅ AlumniProfileService: Profile updated successfully", res.data);
      return res.data;
    }
  } catch (error) {
    console.error("❌ AlumniProfileService: Error updating alumni profile", error);
    throw error;
  }
};

// ✅ Upload profile picture only
export const uploadProfilePicture = async (file) => {
  try {
    console.log("🔄 AlumniProfileService: Uploading profile picture...", file);

    const formData = new FormData();
    formData.append('profilePhoto', file);

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

    console.log("🌐 Sending profile picture upload to:", `${API_URL}/alumni/upload-profile-picture`);

    const response = await fetch(`${API_URL}/alumni/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("📡 Upload response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Upload error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    console.log("✅ AlumniProfileService: Profile picture uploaded successfully", result);
    return { profilePhoto: result };
  } catch (error) {
    console.error("❌ AlumniProfileService: Error uploading profile picture", error);
    throw error;
  }
};

// ✅ Get alumni's posted jobs
export const getJobs = async () => {
  try {
    console.log("🔄 AlumniProfileService: Fetching alumni jobs...");
    const res = await api.get("/alumni/jobs");
    console.log("✅ AlumniProfileService: Alumni jobs fetched successfully", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ AlumniProfileService: Error fetching alumni jobs", error);
    throw error;
  }
};

// ✅ Post a new job (Temporary frontend simulation)
export const postJob = async (data) => {
  try {
    console.log("🔄 AlumniProfileService: Simulating job posting...", data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create simulated job object
    const simulatedJob = {
      id: Date.now(),
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      link: data.link,
      image: data.image ? URL.createObjectURL(data.image) : null,
      createdAt: new Date().toISOString(),
      postedBy: "Current Alumni",
      message: "Job posted successfully (Frontend simulation)"
    };

    console.log("✅ AlumniProfileService: Job posting simulated successfully");
    return simulatedJob;

  } catch (error) {
    console.error("❌ AlumniProfileService: Error in simulated job posting", error);
    throw error;
  }
};

// ✅ Test file upload function
export const testFileUpload = async (file) => {
  try {
    console.log("🧪 TEST: Starting file upload test...");
    console.log("🧪 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const formData = new FormData();
    formData.append('profilePhoto', file);
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'test@example.com');
    formData.append('phone', '1234567890');
    formData.append('graduationYear', '2020');
    formData.append('degree', 'B.Tech');
    formData.append('branch', 'IT');
    formData.append('currentCompany', 'Test Company');
    formData.append('position', 'Test Position');
    formData.append('about', 'Test about section');

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

    console.log("🧪 Sending test request to:", `${API_URL}/alumni/profile/upload`);

    const response = await fetch(`${API_URL}/alumni/profile/upload`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("🧪 Test response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🧪 Test upload failed with error:", errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("🧪 Test upload result:", result);

    return result;
  } catch (error) {
    console.error("🧪 Test upload failed:", error);
    throw error;
  }
};

// ✅ Export all functions
export default {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getJobs,
  postJob,
  testFileUpload  // ✅ Now properly exported
};