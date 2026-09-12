import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Globe2,
  KeyRound,
  Laptop2,
  LockKeyhole,
  LogOut,
  Mail,
  Monitor,
  Palette,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import "../styles/settings.css";

const initialNotifications = {
  attendance: true,
  hours: true,
  evaluation: true,
  reports: false,
  announcements: true,
  email: true,
};

function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState("Light");
  const [fontSize, setFontSize] = useState("Medium");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState({
    fullName: `${user?.firstName || "Admin"} ${user?.lastName || "User"}`.trim(),
    email: user?.email || "admin@lccian.edu.ph",
    contact: user?.contactNumber || "0917 000 0000",
    department: user?.department || "OJT Administration",
  });

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const toggleNotification = (key) => setNotifications((current) => ({ ...current, [key]: !current[key] }));
  const updateProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const navItems = [
    { id: "profile", label: "Profile settings", icon: UserRound },
    { id: "account", label: "Account settings", icon: KeyRound },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "System preferences", icon: Globe2 },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "privacy", label: "Data and privacy", icon: LockKeyhole },
  ];

  return (
    <main className="settings-page">
      <header className="settings-header"><div><p className="settings-eyebrow">LCCI · workspace configuration</p><h1>System Settings</h1><p>Manage your account preferences and system configuration.</p></div><div className="settings-save-state"><span className="settings-online-dot" /> All changes saved locally</div></header>
      <div className="settings-layout">
        <aside className="settings-nav" aria-label="Settings sections"><p className="settings-nav-label">Settings menu</p>{navItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={activeSection === id ? "active" : ""} onClick={() => setActiveSection(id)}><Icon size={17} /><span>{label}</span>{activeSection === id && <ChevronRight size={15} />}</button>)}</aside>
        <div className="settings-content">
          {activeSection === "profile" && <section className="settings-card"><SettingsHeading icon={UserRound} eyebrow="Personal details" title="Profile Settings" description="Keep your contact details and account identity up to date." /><div className="profile-identity"><div className="profile-avatar">{profile.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><h3>{profile.fullName}</h3><p>{user?.role === "coordinator" ? "OJT Coordinator" : "System Administrator"} · {profile.department}</p></div><button type="button" className="settings-outline-button" onClick={() => showNotice("Profile photo upload is ready to connect.")}>Change photo</button></div><div className="settings-form-grid"><TextField label="Full name" value={profile.fullName} onChange={(value) => updateProfile("fullName", value)} /><TextField label="Email address" value={profile.email} onChange={(value) => updateProfile("email", value)} type="email" /><TextField label="Contact number" value={profile.contact} onChange={(value) => updateProfile("contact", value)} /><ReadOnlyField label="Role" value={user?.role === "coordinator" ? "OJT Coordinator" : "System Administrator"} /><ReadOnlyField label="Department or course" value={profile.department} /><ReadOnlyField label="Account ID" value={user?.uid || "LCCI-ADMIN-001"} /></div><div className="settings-card-actions"><button type="button" className="settings-primary-button" onClick={() => showNotice("Profile changes are ready to save.")}>Edit Profile</button></div></section>}

          {activeSection === "account" && <section className="settings-card"><SettingsHeading icon={KeyRound} eyebrow="Account access" title="Account Settings" description="Manage your sign-in credentials and account verification." /><div className="settings-security-banner"><ShieldCheck size={20} /><div><strong>Your account is protected</strong><p>Use a unique password and review your sign-in activity regularly.</p></div><span>Secure</span></div><div className="settings-subsection"><div><h3>Change password</h3><p>Choose a strong password with at least 6 characters.</p></div><div className="settings-password-grid"><PasswordField label="Current password" visible={showPassword} /><PasswordField label="New password" visible={showPassword} /><PasswordField label="Confirm new password" visible={showPassword} /></div><label className="settings-check"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Show password characters</label><button type="button" className="settings-primary-button" onClick={() => showNotice("Password update is ready to connect securely.")}>Update Password</button></div><div className="settings-option-row"><div className="settings-option-icon"><Mail size={17} /></div><div><strong>Update email address</strong><span>Current address: {profile.email}</span></div><button type="button" className="settings-row-button" onClick={() => showNotice("Email update is ready to connect.")}>Update <ChevronRight size={15} /></button></div><div className="settings-option-row"><div className="settings-option-icon green"><ShieldCheck size={17} /></div><div><strong>Two-factor authentication</strong><span>Add another layer of protection to your account.</span></div><Toggle checked={false} onChange={() => showNotice("Two-factor authentication is ready to connect.")} /></div></section>}

          {activeSection === "appearance" && <section className="settings-card"><SettingsHeading icon={Palette} eyebrow="Workspace display" title="Appearance Settings" description="Choose how the OJT Monitoring System looks on your device." /><div className="settings-subsection"><h3>Theme</h3><div className="theme-grid">{[{ name: "Light", icon: Monitor, copy: "Bright and focused" }, { name: "Dark", icon: Laptop2, copy: "Easy on the eyes" }, { name: "System", icon: Smartphone, copy: "Follow device setting" }].map(({ name, icon: Icon, copy }) => <button type="button" key={name} className={`theme-card ${theme === name ? "selected" : ""}`} onClick={() => setTheme(name)}><span><Icon size={19} /></span><strong>{name} mode</strong><small>{copy}</small>{theme === name && <i><Check size={13} /></i>}</button>)}</div></div><div className="settings-subsection"><h3>Font size</h3><p>Adjust the text scale for your workspace.</p><div className="font-options">{["Small", "Medium", "Large"].map((size) => <button type="button" key={size} className={fontSize === size ? "selected" : ""} onClick={() => setFontSize(size)}>{size}<span>{size === "Small" ? "Aa" : size === "Medium" ? "Aa" : "Aa"}</span></button>)}</div></div></section>}

          {activeSection === "notifications" && <section className="settings-card"><SettingsHeading icon={Bell} eyebrow="Stay informed" title="Notification Settings" description="Choose which updates should appear in your workspace." /><div className="notification-list"><NotificationRow icon={CalendarIcon} title="Attendance notifications" description="Get notified when attendance records need review." checked={notifications.attendance} onChange={() => toggleNotification("attendance")} /><NotificationRow icon={ClockIcon} title="OJT hours notifications" description="Receive alerts when student hours fall behind schedule." checked={notifications.hours} onChange={() => toggleNotification("hours")} /><NotificationRow icon={Check} title="Evaluation notifications" description="Know when an evaluation is submitted or needs attention." checked={notifications.evaluation} onChange={() => toggleNotification("evaluation")} /><NotificationRow icon={FileIcon} title="Report notifications" description="Get updates when scheduled reports are ready." checked={notifications.reports} onChange={() => toggleNotification("reports")} /><NotificationRow icon={Bell} title="System announcements" description="Receive important updates from the OJT office." checked={notifications.announcements} onChange={() => toggleNotification("announcements")} /><NotificationRow icon={Mail} title="Email notifications" description="Send enabled notifications to your account email." checked={notifications.email} onChange={() => toggleNotification("email")} /></div></section>}

          {activeSection === "preferences" && <section className="settings-card"><SettingsHeading icon={Globe2} eyebrow="System behavior" title="System Preferences" description="Set defaults that make daily monitoring work the way you do." /><div className="settings-form-grid"><SelectField label="Language" value="English (United States)" options={["English (United States)", "Filipino"]} /><SelectField label="Date format" value="September 12, 2026" options={["September 12, 2026", "12/09/2026", "2026-09-12"]} /><SelectField label="Time format" value="12-hour (AM/PM)" options={["12-hour (AM/PM)", "24-hour"]} /><SelectField label="Default dashboard page" value="Admin Dashboard" options={["Admin Dashboard", "Attendance", "OJT Reports", "OJT Hours"]} /></div><div className="settings-info-strip"><Check size={16} /><span>These preferences apply to your account only and can be changed at any time.</span></div></section>}

          {activeSection === "security" && <section className="settings-card"><SettingsHeading icon={ShieldCheck} eyebrow="Account protection" title="Security Settings" description="Review recent access and protect your account across devices." /><div className="security-grid"><div className="security-detail"><span>Last login</span><strong>September 12, 2026 · 8:42 AM</strong><small>Chrome on Windows · Isabela, PH</small></div><div className="security-detail"><span>Active sessions</span><strong>2 devices</strong><small>This device and Chrome on Windows</small></div><div className="security-detail"><span>Login activity</span><strong>No unusual activity</strong><small>Last reviewed today</small></div></div><div className="settings-option-row"><div className="settings-option-icon"><LockKeyhole size={17} /></div><div><strong>Review login activity</strong><span>See when and where your account was accessed.</span></div><button type="button" className="settings-row-button" onClick={() => showNotice("Login activity is ready to connect.")}>View activity <ChevronRight size={15} /></button></div><div className="settings-option-row danger-row"><div className="settings-option-icon red"><LogOut size={17} /></div><div><strong>Log out from all devices</strong><span>Sign out of every other active session.</span></div><button type="button" className="settings-danger-button" onClick={() => showNotice("All-device logout is ready to connect.")}>Log out all</button></div></section>}

          {activeSection === "privacy" && <section className="settings-card"><SettingsHeading icon={LockKeyhole} eyebrow="Your information" title="Data and Privacy" description="Manage your personal data and privacy preferences." /><div className="privacy-list"><PrivacyRow icon={Download} title="Download my data" description="Get a copy of your profile and OJT monitoring records." action="Request download" onClick={() => showNotice("Data download request is ready to connect.")} /><PrivacyRow icon={ShieldCheck} title="Privacy preferences" description="Review how your account information is used within the system." action="Review preferences" onClick={() => showNotice("Privacy preferences are ready to connect.")} /><PrivacyRow icon={LogOut} title="Data management" description="Contact the OJT office for account deletion or data correction requests." action="Contact support" onClick={() => showNotice("Support contact is ready to connect.")} /></div></section>}
          <footer className="settings-footer"><button type="button" className="settings-cancel-button" onClick={() => showNotice("No changes were discarded.")}><X size={15} /> Cancel</button><button type="button" className="settings-primary-button" onClick={() => showNotice("Settings changes saved successfully.")}><Save size={15} /> Save Changes</button></footer>
        </div>
      </div>
      {notice && <div className="settings-notice">{notice}</div>}
    </main>
  );
}

function SettingsHeading({ icon: Icon, eyebrow, title, description }) { return <div className="settings-card-heading"><span className="settings-heading-icon"><Icon size={19} /></span><div><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span></div></div>; }
function TextField({ label, value, onChange, type = "text" }) { return <label className="settings-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function ReadOnlyField({ label, value }) { return <label className="settings-field"><span>{label}</span><input value={value} readOnly /></label>; }
function SelectField({ label, value, options }) { return <label className="settings-field"><span>{label}</span><select value={value} onChange={() => {}}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function PasswordField({ label, visible }) { return <label className="settings-field"><span>{label}</span><input type={visible ? "text" : "password"} placeholder="Enter password" /></label>; }
function Toggle({ checked, onChange }) { return <button type="button" role="switch" aria-checked={checked} className={`settings-toggle ${checked ? "on" : ""}`} onClick={onChange}><span /></button>; }
function NotificationRow({ icon: Icon, title, description, checked, onChange }) { return <div className="notification-row"><span className="notification-icon"><Icon size={16} /></span><div><strong>{title}</strong><span>{description}</span></div><Toggle checked={checked} onChange={onChange} /></div>; }
function PrivacyRow({ icon: Icon, title, description, action, onClick }) { return <div className="privacy-row"><span className="notification-icon"><Icon size={17} /></span><div><strong>{title}</strong><span>{description}</span></div><button type="button" className="settings-row-button" onClick={onClick}>{action} <ChevronRight size={15} /></button></div>; }
function CalendarIcon({ size }) { return <CalendarDays size={size} />; }
function ClockIcon({ size }) { return <Clock3 size={size} />; }
function FileIcon({ size }) { return <FileText size={size} />; }

export default Settings;