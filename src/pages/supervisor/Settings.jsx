import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "./SupervisorComponents";

function Settings() {
	const [settings, setSettings] = useState({ email: true, reminders: true, weekly: false });
	const [message, setMessage] = useState("");
	const toggle = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }));
	return <div className="supervisor-page"><PageHeader title="Settings" description="Manage supervisor notifications and workspace preferences." /><div className="supervisor-two-column"><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Notifications</h2><p>Choose which updates you want to receive.</p></div></div><div className="supervisor-setting"><div><strong>Email notifications</strong><p>Receive important OJT system updates.</p></div><input type="checkbox" checked={settings.email} onChange={() => toggle("email")} /></div><div className="supervisor-setting"><div><strong>Attendance reminders</strong><p>Get notified when attendance needs review.</p></div><input type="checkbox" checked={settings.reminders} onChange={() => toggle("reminders")} /></div><div className="supervisor-setting"><div><strong>Weekly summary</strong><p>Receive a weekly trainee progress summary.</p></div><input type="checkbox" checked={settings.weekly} onChange={() => toggle("weekly")} /></div><button type="button" className="supervisor-primary" onClick={() => setMessage("Settings saved successfully.")}><Save size={16} /> Save settings</button>{message && <p className="supervisor-message">{message}</p>}</section><section className="supervisor-panel"><div className="supervisor-panel-heading"><div><h2>Supervisor profile</h2><p>Displayed account information.</p></div></div><div className="supervisor-form"><div className="supervisor-field"><label htmlFor="supervisor-name">Display name</label><input id="supervisor-name" className="supervisor-input" defaultValue="OJT Supervisor" /></div><div className="supervisor-field"><label htmlFor="supervisor-email">Email address</label><input id="supervisor-email" className="supervisor-input" type="email" defaultValue="supervisor@lcci.edu.ph" /></div></div></section></div></div>;
}

export default Settings;
