import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { createEvent } from "../services/adminEventService";
import "./AdminEvents.css";

const AdminEvents = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    organizer: "",
    registrationLink: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should be less than 5MB");
        return;
      }

      setNewEvent({ ...newEvent, image: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setMessage("Image selected successfully!");
    }
  };

  const removeImage = () => {
    setNewEvent({ ...newEvent, image: null });
    setImagePreview("");
    setMessage("Image removed");

    const fileInput = document.getElementById("eventImage");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.date ||
      !newEvent.organizer
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setMessage("Adding event...");

    try {
      const formData = new FormData();
      formData.append("title", newEvent.title);
      formData.append("description", newEvent.description);
      formData.append("date", newEvent.date);
      formData.append("organizer", newEvent.organizer);
      formData.append("registrationLink", newEvent.registrationLink || "");

      if (newEvent.image) {
        formData.append("image", newEvent.image);
      }

      console.log(" FormData contents:");
      console.log("   Title:", newEvent.title);
      console.log("   Description:", newEvent.description);
      console.log("   Date:", newEvent.date);
      console.log("   Organizer:", newEvent.organizer);
      console.log("   Registration Link:", newEvent.registrationLink);

      const result = await createEvent(formData);

      setMessage("Event added successfully! It will appear in View Events page.");

      setNewEvent({
        title: "",
        description: "",
        date: "",
        organizer: "",
        registrationLink: "",
        image: null
      });
      setImagePreview("");

      const fileInput = document.getElementById("eventImage");
      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      console.error("Error creating event:", err);
      const errorMessage = err.response?.data || err.message || "Failed to add event. Please try again.";
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-events-container">
      {/* Decorative Background */}
      <div className="admin-events-floating-circles">
        <div className="admin-events-circle admin-events-circle-1"></div>
        <div className="admin-events-circle admin-events-circle-2"></div>
        <div className="admin-events-circle admin-events-circle-3"></div>
      </div>

      <AdminNavbar />

      <div className="admin-events-content">
        <div className="admin-events-card">
          <div className="admin-events-header">
            <div className="admin-events-header-icon"></div>
            <h1>Create New Event</h1>
            <p>Fill in the details below to add a new college event</p>
          </div>

          {message && (
            <div className={`admin-events-message ${message.includes("failed") || message.includes("Please") || message.includes("should") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          <form className="admin-events-form" onSubmit={handleSubmit}>
            {/* Event Details */}
            <div className="admin-events-section">
              <div className="admin-events-section-header">
                <span className="admin-events-section-icon"></span>
                <h3>Event Details</h3>
              </div>

              <div className="admin-events-input-group">
                <label>Event Title *</label>
                <div className="admin-events-input-wrapper">
                  <span className="admin-events-input-icon"></span>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="admin-events-input-group">
                <label>Event Description *</label>
                <div className="admin-events-input-wrapper">
                  <span className="admin-events-input-icon"></span>
                  <textarea
                    name="description"
                    placeholder="Describe your event"
                    value={newEvent.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Event Schedule */}
            <div className="admin-events-section">
              <div className="admin-events-section-header">
                <span className="admin-events-section-icon"></span>
                <h3>Event Schedule</h3>
              </div>

              <div className="admin-events-row">
                <div className="admin-events-input-group">
                  <label>Event Date *</label>
                  <div className="admin-events-input-wrapper">
                    <span className="admin-events-input-icon"></span>
                    <input
                      type="date"
                      name="date"
                      value={newEvent.date}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="admin-events-input-group">
                  <label>Organizer *</label>
                  <div className="admin-events-input-wrapper">
                    <span className="admin-events-input-icon"></span>
                    <input
                      type="text"
                      name="organizer"
                      placeholder="Organizer name"
                      value={newEvent.organizer}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Link */}
            <div className="admin-events-section">
              <div className="admin-events-section-header">
                <span className="admin-events-section-icon"></span>
                <h3>Registration</h3>
              </div>

              <div className="admin-events-input-group">
                <label>Registration Link (Optional)</label>
                <div className="admin-events-input-wrapper">
                  <span className="admin-events-input-icon"></span>
                  <input
                    type="url"
                    name="registrationLink"
                    placeholder="https://example.com/register"
                    value={newEvent.registrationLink}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="admin-events-hint">
                 Add a registration link for students to sign up for the event
              </div>
            </div>

            {/* Event Media */}
            <div className="admin-events-section">
              <div className="admin-events-section-header">
                <span className="admin-events-section-icon"></span>
                <h3>Event Media</h3>
              </div>

              <div className="admin-events-file-upload">
                {imagePreview ? (
                  <div className="admin-events-image-preview">
                    <img src={imagePreview} alt="Event preview" />
                    <button
                      type="button"
                      className="admin-events-remove-image"
                      onClick={removeImage}
                      disabled={submitting}
                    >
                       Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="admin-events-upload-area" htmlFor="eventImage">
                    <div className="admin-events-upload-icon"></div>
                    <div className="admin-events-upload-text">
                      <p>Click to upload event image</p>
                      <span>PNG, JPG, JPEG (Max 5MB)</span>
                    </div>
                    <input
                      type="file"
                      id="eventImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={submitting}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              <div className="admin-events-hint">
                 Upload a high-quality image for better event presentation
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-events-submit-btn"
              disabled={submitting}
            >
              <span className="admin-events-btn-icon">
                {submitting ? "⏳" : "🚀"}
              </span>
              <span>{submitting ? "Publishing..." : "Publish Event"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;