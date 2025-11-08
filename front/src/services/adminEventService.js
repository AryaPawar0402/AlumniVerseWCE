// src/services/adminEventService.js
import api from "../config/api";

// Fetch all events
export const getAllEvents = async () => {
  try {
    console.log("🔄 Fetching events from /events...");
    const res = await api.get("/events");
    console.log("✅ Events fetched successfully. Count:", res.data.length);
    console.log("📋 Sample event data:", res.data[0]); // Log sample to check registrationLink
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    throw error;
  }
};

// Create new event with file upload
export const createEvent = async (formData) => {
  try {
    console.log("📤 Creating new event with FormData...");
    console.log("🔗 Registration Link being sent:", formData.get('registrationLink'));

    const res = await api.post("/admin/events", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Event created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error creating event:", error);

    if (error.response) {
      console.error("📡 Server response:");
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }

    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    console.log(`🗑️ Deleting event with ID: ${id}`);
    const res = await api.delete(`/admin/events/${id}`);
    console.log("✅ Event deleted successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    throw error;
  }
};