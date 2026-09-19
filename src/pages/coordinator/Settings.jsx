import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/useAuth";
import { auth, db } from "../../services/firebase";
import "../../styles/coordinator-module.css";

function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", phone: user?.phone || "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const save = async (event) => { event.preventDefault(); setNotice(""); setError(""); if (!form.firstName.trim() || !form.lastName.trim()) { setError("First name and last name are required."); return; } try { const name = `${form.firstName.trim()} ${form.lastName.trim()}`; if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name }); await updateDoc(doc(db, "users", user.uid), { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim(), updatedAt: new Date().toISOString() }); setNotice("Profile settings saved."); } catch (saveError) { console.error("Unable to save settings:", saveError); setError("Settings could not be saved."); } };
  return <main className="coordinator-data-page"><header className="coordinator-data-header"><div><p>Account</p><h1>Coordinator Settings</h1><span>Update your profile information.</span></div></header><section className="coordinator-settings-panel"><form onSubmit={save}><label>First name<input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label><label>Last name<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label><label>Email<input value={user?.email || ""} readOnly /></label><label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>{error && <p className="coordinator-feedback coordinator-error" role="alert">{error}</p>}{notice && <p className="coordinator-feedback" role="status">{notice}</p>}<button type="submit" className="coordinator-primary-button">Save changes</button></form></section></main>;
}

export default Settings;
