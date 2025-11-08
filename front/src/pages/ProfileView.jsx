import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/api";
import "./ProfileView.css";

const ProfileView = () => {
  const { id } = useParams(); // student or alumni id
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <p className="loading-text">Loading profile...</p>;

  if (!profile) return <p className="error-text">Profile not found</p>;

  return (
    <div className="profile-view-container">
      <div className="profile-header">
        <img
          src={profile.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="profile-view-pic"
        />
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.about}</p>
          <p>
            <strong>Graduation Year:</strong> {profile.graduationYear || "—"}
          </p>
        </div>
      </div>

      {profile.role?.name === "ALUMNI" && profile.jobs?.length > 0 && (
        <div className="section">
          <h3>Jobs Posted</h3>
          <ul>
            {profile.jobs.map((job) => (
              <li key={job.id}>
                <strong>{job.title}</strong> – {job.companyName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile.role?.name === "STUDENT" && profile.achievements?.length > 0 && (
        <div className="section">
          <h3>Achievements</h3>
          <ul>
            {profile.achievements.map((ach, idx) => (
              <li key={idx}>{ach}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
