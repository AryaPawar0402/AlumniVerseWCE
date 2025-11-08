import api from "../config/api";

// Get logged-in admin's profile
export const getAdminProfile = async () => {
  try {
    console.log("🔄 adminProfileService: Fetching admin profile...");
    const res = await api.get("/admin/profile");
    console.log("✅ adminProfileService: Admin profile fetched successfully", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ adminProfileService: Error fetching admin profile", error);
    throw error;
  }
};

// Update admin profile
export const updateAdminProfile = async (data) => {
  try {
    console.log("🔄 adminProfileService: Updating admin profile...", data);
    const res = await api.put("/admin/profile", data);
    console.log("✅ adminProfileService: Admin profile updated successfully", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ adminProfileService: Error updating admin profile", error);
    throw error;
  }
};