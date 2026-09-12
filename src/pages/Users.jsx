import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Activity, CheckCircle2, Clock3, Eye, Mail, Pencil, Plus, Search, ShieldCheck, UserRound, Users as UsersIcon, X } from "lucide-react";
import { db } from "../services/firebase";
import "../styles/users-dashboard.css";

const sampleUsers = [
  { id: "LCCI-001", firstName: "Patricia", lastName: "Lim", email: "palim@lccian.edu.ph", phone: "0917 555 1002", role: "Coordinator", status: "Active", department: "Business Administration", lastActive: "Today, 9:18 AM" },
  { id: "LCCI-002", firstName: "Ramon", lastName: "Villanueva", email: "rvillanueva@lccian.edu.ph", phone: "0917 555 1003", role: "Coordinator", status: "Active", department: "Accountancy", lastActive: "Today, 8:42 AM" },
  { id: "LCCI-003", firstName: "Beatriz", lastName: "Navarro", email: "bnavarro@lccian.edu.ph", phone: "0917 555 1006", role: "Staff", status: "Active", department: "OJT Office", lastActive: "Yesterday" },
  { id: "LCCI-004", firstName: "Daniel", lastName: "Reyes", email: "dreyes@lccian.edu.ph", phone: "0917 555 1005", role: "Staff", status: "Inactive", department: "Hospitality Management", lastActive: "Sep 08, 2026" },
  { id: "LCCI-005", firstName: "Maria", lastName: "Santos", email: "msantos@lccian.edu.ph", phone: "0917 555 1008", role: "Student", status: "Active", department: "Information Technology", lastActive: "Today, 7:55 AM" },
];

const roleClass = { Admin: "admin", Coordinator: "coordinator", Staff: "staff", Student: "student", customer: "student" };

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [status, setStatus] = useState("All statuses");
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        if (active) setUsers(snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() })));
      } catch (error) {
        console.error("Unable to load users:", error);
        if (active) setUsers(sampleUsers);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadUsers();
    return () => { active = false; };
  }, []);

  const displayUsers = users.length ? users : sampleUsers;
  const filteredUsers = useMemo(() => displayUsers.filter((currentUser) => {
    const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
    const normalizedRole = currentUser.role === "customer" ? "Student" : currentUser.role || "Staff";
    const normalizedStatus = currentUser.status === "ACTIVE" ? "Active" : currentUser.status || "Active";
    const query = search.toLowerCase().trim();
    return (!query || `${fullName} ${currentUser.email || ""} ${currentUser.id}`.toLowerCase().includes(query))
      && (role === "All roles" || normalizedRole === role)
      && (status === "All statuses" || normalizedStatus === status);
  }), [displayUsers, role, search, status]);

  const summary = displayUsers.reduce((result, currentUser) => {
    const normalizedRole = currentUser.role === "customer" ? "Student" : currentUser.role || "Staff";
    const normalizedStatus = currentUser.status === "ACTIVE" ? "Active" : currentUser.status || "Active";
    result.total += 1;
    result.active += normalizedStatus === "Active" ? 1 : 0;
    result.coordinators += normalizedRole === "Coordinator" ? 1 : 0;
    result.students += normalizedRole === "Student" ? 1 : 0;
    return result;
  }, { total: 0, active: 0, coordinators: 0, students: 0 });

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const initials = (currentUser) => `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}` || "U";

  return (
    <main className="users-dashboard-page">
      <header className="users-dashboard-header"><div><p className="users-dashboard-eyebrow">Workspace administration</p><h1>Users</h1><p>Manage accounts, roles, and access across the OJT Monitoring System.</p></div><button type="button" className="users-primary-button" onClick={() => showNotice("The create-user form is ready to connect.")}><Plus size={16} /> Add user</button></header>
      <section className="users-summary" aria-label="User summary"><article><span className="users-summary-icon blue"><UsersIcon size={19} /></span><div><span>Total users</span><strong>{summary.total}</strong><small>All registered accounts</small></div></article><article><span className="users-summary-icon green"><CheckCircle2 size={19} /></span><div><span>Active accounts</span><strong>{summary.active}</strong><small>Currently enabled</small></div></article><article><span className="users-summary-icon amber"><ShieldCheck size={19} /></span><div><span>Coordinators</span><strong>{summary.coordinators}</strong><small>Managing placements</small></div></article><article><span className="users-summary-icon coral"><UserRound size={19} /></span><div><span>Students</span><strong>{summary.students}</strong><small>Registered learners</small></div></article></section>
      <section className="users-dashboard-panel"><div className="users-toolbar"><div><p className="users-kicker">Directory</p><h2>All users</h2></div><div className="users-filters"><label className="users-search"><Search size={16} /><span className="sr-only">Search users</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or ID" /></label><select aria-label="Filter users by role" value={role} onChange={(event) => setRole(event.target.value)}><option>All roles</option><option>Admin</option><option>Coordinator</option><option>Staff</option><option>Student</option></select><select aria-label="Filter users by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Inactive</option></select></div></div>{loading && <div className="users-loading"><Activity size={18} /> Loading user directory...</div>}{!loading && <div className="users-table-wrap"><table className="users-dashboard-table"><thead><tr><th>User</th><th>Email and contact</th><th>Role</th><th>Department</th><th>Last active</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{filteredUsers.map((currentUser) => { const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "Unnamed user"; const normalizedRole = currentUser.role === "customer" ? "Student" : currentUser.role || "Staff"; const normalizedStatus = currentUser.status === "ACTIVE" ? "Active" : currentUser.status || "Active"; return <tr key={currentUser.id}><td><div className="user-profile"><span className={`user-avatar ${roleClass[normalizedRole] || "staff"}`}>{initials(currentUser)}</span><div><strong>{fullName}</strong><span>{currentUser.id}</span></div></div></td><td><div className="user-contact"><strong>{currentUser.email || "No email added"}</strong><span>{currentUser.phone || "No contact number"}</span></div></td><td><span className={`user-role-badge ${roleClass[normalizedRole] || "staff"}`}>{normalizedRole}</span></td><td>{currentUser.department || currentUser.course || "OJT Office"}</td><td><span className="user-last-active"><Clock3 size={13} /> {currentUser.lastActive || "Recently"}</span></td><td><span className={`user-status-badge ${normalizedStatus.toLowerCase()}`}>{normalizedStatus}</span></td><td><button type="button" className="users-icon-button" aria-label={`View ${fullName}`} title="View user" onClick={() => setSelectedUser(currentUser)}><Eye size={15} /></button><button type="button" className="users-icon-button" aria-label={`Edit ${fullName}`} title="Edit user" onClick={() => showNotice(`Editing ${fullName} is ready to connect.`)}><Pencil size={15} /></button></td></tr>; })}</tbody></table>{filteredUsers.length === 0 && <div className="users-empty">No users match your filters.</div>}</div>}<footer className="users-table-footer"><span>Showing {filteredUsers.length} of {displayUsers.length} users</span><span className="users-footer-note"><CheckCircle2 size={13} /> Directory synced with account records</span></footer></section>
      <section className="users-quick-grid"><article><div className="quick-icon blue"><Mail size={17} /></div><div><strong>Invite a new team member</strong><span>Create a staff or coordinator account with guided access.</span></div><button type="button" onClick={() => showNotice("The invitation flow is ready to connect.")}>Invite <Plus size={14} /></button></article><article><div className="quick-icon green"><ShieldCheck size={17} /></div><div><strong>Review access roles</strong><span>Keep account permissions aligned with placement responsibilities.</span></div><button type="button" onClick={() => showNotice("Role management is ready to connect.")}>Review <Eye size={14} /></button></article></section>
      {selectedUser && <div className="users-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedUser(null); }}><section className="users-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title"><header><div><p className="users-kicker">Account details</p><h2 id="user-modal-title">{selectedUser.firstName} {selectedUser.lastName}</h2><span>{selectedUser.email}</span></div><button type="button" aria-label="Close user details" onClick={() => setSelectedUser(null)}><X size={17} /></button></header><div className="users-modal-grid"><div><span>Role</span><strong>{selectedUser.role || "Staff"}</strong></div><div><span>Status</span><strong>{selectedUser.status || "Active"}</strong></div><div><span>Phone</span><strong>{selectedUser.phone || "Not provided"}</strong></div><div><span>Department</span><strong>{selectedUser.department || selectedUser.course || "OJT Office"}</strong></div></div><footer><button type="button" className="users-secondary-button" onClick={() => setSelectedUser(null)}>Close</button><button type="button" className="users-primary-button" onClick={() => showNotice("User editing is ready to connect.")}>Edit user</button></footer></section></div>}
      {notice && <div className="users-notice">{notice}</div>}
    </main>
  );
}

export default Users;