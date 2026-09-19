import { useState } from "react";
import "../../styles/student-portal.css";

const initialProfile = {
  fullName: "Juan Dela Cruz",
  studentId: "2024-00123",
  program: "BS Information Technology",
  yearLevel: "4th Year",
  email: "juan.delacruz@student.lccian.edu.ph",
  contactNumber: "+63 912 345 6789",
  address: "123 Rizal Street, San Pablo City, Laguna",
  company: "ABC Technologies Inc.",
  companySupervisor: "Maria Santos",
  facultyCoordinator: "Prof. John Reyes",
  startDate: "2025-06-03",
  endDate: "2025-12-15",
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
  };

  return (
    <div className="student-portal-page">
      <header className="student-page-header">
        <div>
          <p className="student-meta">Student profile</p>
          <h1>My Profile</h1>
        </div>
        <div className="student-header-actions">
          {!isEditing ? (
            <button type="button" className="student-button primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : null}
        </div>
      </header>

      <section className="student-card student-panel">
        <div className="student-profile-summary">
          <div className="student-avatar">JD</div>
          <div>
            <h2>{profile.fullName}</h2>
            <p>{profile.studentId} • {profile.program}</p>
            <p>{profile.yearLevel}</p>
          </div>
        </div>

        <div className="student-form-grid" style={{ padding: "0 22px 18px" }}>
          <div className="student-field">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(event) => handleFieldChange("fullName", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Student ID</label>
            <input type="text" value={profile.studentId} readOnly />
          </div>
          <div className="student-field">
            <label>Course / Program</label>
            <input
              type="text"
              value={profile.program}
              onChange={(event) => handleFieldChange("program", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Year Level</label>
            <input
              type="text"
              value={profile.yearLevel}
              onChange={(event) => handleFieldChange("yearLevel", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(event) => handleFieldChange("email", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Contact Number</label>
            <input
              type="tel"
              value={profile.contactNumber}
              onChange={(event) => handleFieldChange("contactNumber", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field full">
            <label>Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(event) => handleFieldChange("address", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>OJT Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(event) => handleFieldChange("company", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Company Supervisor</label>
            <input
              type="text"
              value={profile.companySupervisor}
              onChange={(event) => handleFieldChange("companySupervisor", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>Faculty Coordinator</label>
            <input
              type="text"
              value={profile.facultyCoordinator}
              onChange={(event) => handleFieldChange("facultyCoordinator", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>OJT Start Date</label>
            <input
              type="date"
              value={profile.startDate}
              onChange={(event) => handleFieldChange("startDate", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className="student-field">
            <label>OJT End Date</label>
            <input
              type="date"
              value={profile.endDate}
              onChange={(event) => handleFieldChange("endDate", event.target.value)}
              readOnly={!isEditing}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="student-actions-row" style={{ padding: "0 22px 22px" }}>
            <button type="button" className="student-button" onClick={handleCancel}>Cancel</button>
            <button type="button" className="student-button primary" onClick={handleSave}>Save Changes</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default Profile;
