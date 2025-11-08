import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllEvents } from "../services/adminEventService";
import { FaMapMarkerAlt, FaExternalLinkAlt, FaCalendarAlt } from "react-icons/fa";
import "./StudentEvents.css";

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      console.log("🔄 Student: Fetching events...");
      setError(null);

      const data = await getAllEvents();
      console.log("✅ Student: Events data received:", data);

      // DETAILED Debug: Show EVERYTHING about each event
      data.forEach((event, index) => {
        console.log(`\n========== STUDENT EVENT ${index + 1}: "${event.title}" ==========`);
        console.log("📦 FULL OBJECT:", JSON.stringify(event, null, 2));
        console.log("\n📋 ALL FIELDS AND VALUES:");
        Object.keys(event).forEach(key => {
          console.log(`  ${key}:`, event[key], `(type: ${typeof event[key]})`);
        });
        console.log("=======================================\n");
      });

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Student: Error fetching events:", err);
      setError("Failed to load events. Please check your connection and try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return "Invalid date";
    }
  };

  // Enhanced function to get registration link from various possible field names
  const getRegistrationLink = (event) => {
    // Try multiple possible field names that the backend might use
    const link = event.registrationLink ||
                 event.applicationLink ||
                 event.applyLink ||
                 event.link ||
                 event.registration_link ||
                 event.application_link ||
                 event.apply_link ||
                 event.eventLink ||
                 event.event_link ||
                 event.url ||
                 event.registerUrl ||
                 event.register_url ||
                 null;

    console.log(`🔍 Extracted link for "${event.title}":`, link);
    return link;
  };

  // FIXED: Function to handle registration - NO MORE POPUP BLOCKER ISSUES
  const handleRegister = (event) => {
    console.log("\n" + "=".repeat(50));
    console.log("🖱️ STUDENT REGISTER BUTTON CLICKED");
    console.log("=".repeat(50));
    console.log("📌 Event Title:", event.title);

    console.log("\n🔍 CHECKING FOR REGISTRATION LINK...");
    const registrationLink = getRegistrationLink(event);

    console.log("🔗 Result:", registrationLink);
    console.log("🔗 Type:", typeof registrationLink);
    console.log("🔗 Is truthy?", !!registrationLink);
    console.log("🔗 Is not empty string?", registrationLink !== '');

    if (registrationLink && registrationLink.trim() !== '') {
      let link = registrationLink.trim();

      console.log("\n✅ LINK FOUND!");
      console.log("📎 Original link:", link);

      // Ensure the link has http:// or https://
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
        console.log("🔧 Added https:// prefix");
      }

      console.log("🌐 Final URL:", link);
      console.log("🚀 Opening in new tab...");

      try {
        // FIX: Use anchor element approach to avoid popup blockers
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();

        console.log("✅ SUCCESS! Link opened in new tab");
      } catch (error) {
        console.error("❌ Error opening link:", error);
        // Fallback: Open in same tab
        window.location.href = link;
      }
    } else {
      console.log("\n❌ NO REGISTRATION LINK FOUND!");
      const eventKeys = Object.keys(event);
      console.log("📋 Available fields:", eventKeys.join(', '));

      alert(
        `Registration for "${event.title}"\n\n` +
        `No registration link found.\n\n` +
        `Contact organizer: ${event.organizer || 'Unknown'}`
      );
    }
    console.log("=".repeat(50) + "\n");
  };

  // Function to handle image display
  const getEventImage = (event) => {
    if (event.imageUrl) {
      if (event.imageUrl.startsWith('data:image/')) {
        return event.imageUrl;
      }

      if (event.imageUrl.startsWith('/uploads/')) {
        const absoluteUrl = `http://localhost:8080${event.imageUrl}?t=${new Date().getTime()}`;
        return absoluteUrl;
      }

      return event.imageUrl;
    }

    return null;
  };

  const handleImageError = (e, event) => {
    console.log(`❌ Image failed to load for event: "${event.title}"`);
    e.target.style.display = 'none';

    const container = e.target.parentElement;
    const placeholder = container.querySelector('.event-image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  const handleImageLoad = (e, event) => {
    console.log(`✅ Image loaded successfully for event: "${event.title}"`);

    const container = e.target.parentElement;
    const placeholder = container.querySelector('.event-image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };

  return (
    <div className="student-events-container">
      <Navbar />
      <div className="student-events-overlay">
        <div className="student-events-card">
          <div className="student-events-header">
            <h1>Upcoming College Events</h1>
            <p>Stay updated with all the latest events happening in our college</p>
          </div>

          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button
                className="retry-btn"
                onClick={fetchEvents}
              >
                🔄 Retry
              </button>
            </div>
          )}

          {loading ? (
            <p className="loading-view">📦 Loading events...</p>
          ) : events.length === 0 && !error ? (
            <p className="empty-state-view">📭 No upcoming events. Check back later!</p>
          ) : (
            <div>
              <p className="events-count">📊 Found {events.length} upcoming event{events.length !== 1 ? 's' : ''}</p>
              <div className="events-grid-view">
                {events.map((event, index) => {
                  const imageUrl = getEventImage(event);
                  const hasImage = !!imageUrl;
                  const registrationLink = getRegistrationLink(event);
                  const hasRegistrationLink = registrationLink && registrationLink.trim() !== '';

                  return (
                    <div key={event.id || index} className="event-card-view">
                      <div className="event-image-container">
                        <div
                          className="event-image-placeholder"
                          style={hasImage ? {} : {display: 'flex'}}
                        >
                          <div className="placeholder-icon">📅</div>
                          <div className="placeholder-text">{event.title || "Event"}</div>
                        </div>

                        {hasImage && (
                          <img
                            src={imageUrl}
                            alt={event.title || "Event"}
                            className="event-image"
                            onError={(e) => handleImageError(e, event)}
                            onLoad={(e) => handleImageLoad(e, event)}
                            style={{ display: 'block' }}
                          />
                        )}
                      </div>

                      <div className="event-content-view">
                        <h4>{event.title || "Untitled Event"}</h4>
                        <p className="event-date-view"><FaCalendarAlt /> {formatDate(event.date)}</p>
                        <p className="event-description-view">{event.description || "No description available"}</p>
                        <p className="event-organizer-view">👤 Organized by: {event.organizer || "Unknown"}</p>

                        {/* Registration Button - ALWAYS VIOLET */}
                        <div className="event-actions">
                          <button
                            className="register-btn"
                            onClick={() => handleRegister(event)}
                            title={hasRegistrationLink ? "Click to open registration link" : "No registration link available"}
                          >
                            <FaExternalLinkAlt />
                            Register Now
                          </button>
                          {hasRegistrationLink && (
                            <span className="registration-info">
                              🔗 Registration link available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEvents;