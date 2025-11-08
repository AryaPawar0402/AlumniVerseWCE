import api from "../config/api";

/**
 * ===========================
 * PROFILE SERVICE (Student)
 * Handles fetching and updating student profile
 * with better token handling and fallback logging
 * ===========================
 */

// ✅ Get logged-in student's profile
export const getProfile = async () => {
  try {
    console.log("🔄 [profileService] Fetching student profile...");

    const res = await api.get("/student/profile");

    // If backend returns profile successfully
    console.log("✅ [profileService] Profile fetched:", res.data);

    // Optional: cache locally for persistence
    localStorage.setItem("studentProfile", JSON.stringify(res.data));

    return res.data;
  } catch (error) {
    console.error("❌ [profileService] Error fetching profile:", error);

    // If backend is unreachable, try local fallback
    const cached = localStorage.getItem("studentProfile");
    if (cached) {
      console.warn("⚠️ [profileService] Using cached profile from localStorage");
      return JSON.parse(cached);
    }

    throw error;
  }
};

// ✅ Update student's profile - FIXED: Force JSON content type
export const updateProfile = async (data) => {
  try {
    console.log("🔄 [profileService] Updating profile with data:", data);

    // FIX: Force JSON content type for the request
    const res = await api.put("/student/profile", data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ [profileService] Profile updated successfully:", res.data);

    // Update local cache after successful save
    localStorage.setItem("studentProfile", JSON.stringify(res.data));

    return res.data;
  } catch (error) {
    console.error("❌ [profileService] Error updating profile:", error);

    // Optional: revert to cached version if update fails
    const cached = localStorage.getItem("studentProfile");
    if (cached) {
      console.warn("⚠️ [profileService] Using last known cached data");
      return JSON.parse(cached);
    }

    throw error;
  }
};