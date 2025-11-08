import React from "react";

const DashboardPage = () => {
  const role = localStorage.getItem("role");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Alumni Portal Dashboard</h1>
      <p>Your role: {role}</p>
      {role === "STUDENT" && <p>Student-specific content here.</p>}
      {role === "ALUMNI" && <p>Alumni-specific content here.</p>}
      {role === "ADMIN" && <p>Admin-specific content here.</p>}
    </div>
  );
};

export default DashboardPage;
