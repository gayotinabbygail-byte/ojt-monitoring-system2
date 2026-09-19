import { useState } from "react";
import { Lock, Mail, ShieldCheck, BellRing } from "lucide-react";
import "../../styles/student-portal.css";

const defaultSettings = {
  emailNotifications: true,
  reportReminders: true,
  attendanceReminders: true,
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const updatePassword = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    alert("Settings saved successfully.");
  };

  return (
    <div className="student-portal-page">
      <header className="student-page-header">
        <div>
          <p className="student-meta">User preferences</p>
          <h1>Settings</h1>
        </div>
      </header>

      <section className="student-card student-panel">
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">Account</p>
            <h2 className="student-panel-title">Account Settings</h2>
          </div>
          <ShieldCheck size={18} color="#2868c7" />
        </div>

        <div className="student-toggle-row">
          <div className="student-toggle-label">
            <strong>Email notifications</strong>
            <span>Receive updates about reports and reminders.</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${settings.emailNotifications ? "on" : ""}`}
            aria-label="Toggle email notifications"
            onClick={() => toggleSetting("emailNotifications")}
          />
        </div>

        <div className="student-toggle-row">
          <div className="student-toggle-label">
            <strong>Report reminder</strong>
            <span>Get alerts before weekly OJT reports are due.</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${settings.reportReminders ? "on" : ""}`}
            aria-label="Toggle report reminders"
            onClick={() => toggleSetting("reportReminders")}
          />
        </div>

        <div className="student-toggle-row">
          <div className="student-toggle-label">
            <strong>Attendance reminder</strong>
            <span>Receive daily reminders to log your attendance.</span>
          </div>
          <button
            type="button"
            className={`toggle-switch ${settings.attendanceReminders ? "on" : ""}`}
            aria-label="Toggle attendance reminders"
            onClick={() => toggleSetting("attendanceReminders")}
          />
        </div>
      </section>

      <section className="student-card student-panel" style={{ marginTop: "18px" }}>
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">Security</p>
            <h2 className="student-panel-title">Change Password</h2>
          </div>
          <Lock size={18} color="#2868c7" />
        </div>

        <div className="student-form-grid">
          <div className="student-field">
            <label>Current password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePassword("currentPassword", event.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="student-field" />
          <div className="student-field">
            <label>New password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePassword("newPassword", event.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="student-field">
            <label>Confirm password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePassword("confirmPassword", event.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="student-actions-row">
          <button type="button" className="student-button">Cancel</button>
          <button type="button" className="student-button primary" onClick={handleSave}>Save Settings</button>
        </div>
      </section>
    </div>
  );
}

export default Settings;
