import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { createCollectionDocument } from "../../services/firestoreDataService";
import { CoordinatorState, useCoordinatorData, valueOf } from "./coordinatorData.jsx";
import "../../styles/partner-data.css";

const defaults = {
  name: "",
  industry: "",
  location: "",
  contact: "",
  phone: "",
  email: "",
  address: "",
  status: "Active",
};

function PartnerCompanies() {
  const { data, loading, error } = useCoordinatorData(["partnerCompanies", "students"]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const companies = useMemo(() => {
    const grouped = new Map();
    data.partnerCompanies.forEach((company) => {
      const name = valueOf(company, ["name", "companyName", "company"], "Unnamed company");
      grouped.set(name, { ...company, name });
    });
    data.students.forEach((student) => {
      const name = valueOf(student, ["company", "partnerCompany", "companyName"], "");
      if (name) {
        grouped.set(name, {
          ...(grouped.get(name) || {}),
          name,
          studentCount: (grouped.get(name)?.studentCount || 0) + 1,
        });
      }
    });
    return [...grouped.values()];
  }, [data.partnerCompanies, data.students]);

  const visible = companies.filter((company) =>
    `${company.name} ${company.address || ""} ${company.industry || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const updateDraft = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        industry: draft.industry.trim(),
        location: draft.location.trim(),
        contact: draft.contact.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        address: draft.address.trim(),
        status: draft.status,
      };

      await createCollectionDocument("partnerCompanies", payload);
      setDraft(defaults);
      setShowForm(false);
      setNotice("OJT supervisor added.");
      window.setTimeout(() => setNotice(""), 2400);
    } catch (error) {
      console.error("Unable to add OJT supervisor:", error);
      setNotice("OJT supervisor could not be added.");
      window.setTimeout(() => setNotice(""), 2400);
    } finally {
      setSaving(false);
    }
  };

  return <CoordinatorState loading={loading} error={error}><main className="coordinator-data-page"><header className="coordinator-data-header"><div><p>OJT partnerships</p><h1>OJT Supervisors</h1><span>Live supervisor directory and student assignments.</span></div><button type="button" className="partner-data-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add OJT Supervisor</button></header><section className="coordinator-data-panel"><div className="coordinator-data-toolbar"><label className="coordinator-data-search"><Search size={16} /><span className="sr-only">Search supervisors</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supervisor, industry, or address" /></label></div>{visible.length === 0 ? <div className="coordinator-data-empty">No OJT supervisors found.</div> : <div className="coordinator-data-table-wrap"><table className="coordinator-data-table"><thead><tr><th>Supervisor</th><th>Industry</th><th>Contact</th><th>Assigned students</th></tr></thead><tbody>{visible.map((company) => <tr key={company.id || company.name}><td><strong>{company.name}</strong><small>{company.address || "Address not provided"}</small></td><td>{company.industry || company.businessType || "-"}</td><td>{company.email || company.contactEmail || company.phone || "-"}</td><td>{company.studentCount || 0}</td></tr>)}</tbody></table></div>}</section>{showForm && <div className="partner-data-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && setShowForm(false)}><form className="partner-data-dialog" onSubmit={handleSubmit}><header><div><p>Supervisor record</p><h2>Add OJT supervisor</h2></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close add supervisor form"><X size={17} /></button></header><div className="partner-data-details"><div className="full"><small>Supervisor name</small><input name="name" value={draft.name} onChange={updateDraft} placeholder="e.g. LCCI Tech Solutions" required /></div><div><small>Industry</small><input name="industry" value={draft.industry} onChange={updateDraft} placeholder="Industry" /></div><div><small>Contact person</small><input name="contact" value={draft.contact} onChange={updateDraft} placeholder="Contact person" /></div><div><small>Phone</small><input name="phone" value={draft.phone} onChange={updateDraft} placeholder="Phone number" /></div><div><small>Email</small><input name="email" type="email" value={draft.email} onChange={updateDraft} placeholder="Email" /></div><div><small>Location</small><input name="location" value={draft.location} onChange={updateDraft} placeholder="Location" /></div><div className="full"><small>Address</small><input name="address" value={draft.address} onChange={updateDraft} placeholder="Address" /></div><div className="full"><small>Status</small><select name="status" value={draft.status} onChange={updateDraft}><option>Active</option><option>Inactive</option></select></div></div><footer><button type="button" className="partner-data-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="partner-data-primary" disabled={saving}>{saving ? "Saving..." : "Save supervisor"}</button></footer></form></div>}{notice && <div className="partner-data-notice">{notice}</div>}</main></CoordinatorState>;
}

export default PartnerCompanies;
