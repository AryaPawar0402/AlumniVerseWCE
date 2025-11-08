// services/adminEventService.js
import api from "../config/api";

// Get all events
export const getAllEvents = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    throw error;
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem("token");
    console.log("📤 Sending event data:", eventData);
    
    const response = await api.post("/events", eventData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("✅ Event created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating event:", error);
    
    // Detailed error logging
    if (error.response) {
      console.error("📡 Server response error:", error.response.data);
      console.error("📡 Status code:", error.response.status);
    } else if (error.request) {
      console.error("📡 No response received:", error.request);
    } else {
      console.error("📡 Request setup error:", error.message);
    }
    
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.delete(`/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    throw error;
  }
};

// Upload achievement (your existing function - keep this for achievements)
export const uploadAchievement = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const response = await api.post("/achievements/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
};