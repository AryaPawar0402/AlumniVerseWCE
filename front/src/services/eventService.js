import api from "../config/api"; // your axios instance

// Get all events (for students and admin)
export const getAllEvents = async () => {
  const res = await api.get("/api/events");
  return res.data;
};

// Create a new event (admin)
export const createEvent = async (event) => {
  const res = await api.post("/api/admin/events", event);
  return res.data;
};

// Delete event by ID (admin)
export const deleteEvent = async (id) => {
  const res = await api.delete(`/api/admin/events/${id}`);
  return res.data;
};
