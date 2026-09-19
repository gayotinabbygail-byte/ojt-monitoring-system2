import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CoordinatorState, useCoordinatorData, valueOf } from "./coordinatorData.jsx";

function PartnerCompanies() {
  const { data, loading, error } = useCoordinatorData(["partnerCompanies", "students"]);
  const [search, setSearch] = useState("");
  const companies = useMemo(() => { const grouped = new Map(); data.partnerCompanies.forEach((company) => { const name = valueOf(company, ["name", "companyName", "company"], "Unnamed company"); grouped.set(name, { ...company, name }); }); data.students.forEach((student) => { const name = valueOf(student, ["company", "partnerCompany", "companyName"], ""); if (name) grouped.set(name, { ...(grouped.get(name) || {}), name, studentCount: (grouped.get(name)?.studentCount || 0) + 1 }); }); return [...grouped.values()]; }, [data.partnerCompanies, data.students]);
  const visible = companies.filter((company) => `${company.name} ${company.address || ""} ${company.industry || ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <CoordinatorState loading={loading} error={error}><main className="coordinator-data-page"><header className="coordinator-data-header"><div><p>OJT partnerships</p><h1>Partner Companies</h1><span>Live partner directory and student assignments.</span></div></header><section className="coordinator-data-panel"><div className="coordinator-data-toolbar"><label className="coordinator-data-search"><Search size={16} /><span className="sr-only">Search companies</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, industry, or address" /></label></div>{visible.length === 0 ? <div className="coordinator-data-empty">No partner companies found.</div> : <div className="coordinator-data-table-wrap"><table className="coordinator-data-table"><thead><tr><th>Company</th><th>Industry</th><th>Contact</th><th>Assigned students</th></tr></thead><tbody>{visible.map((company) => <tr key={company.id || company.name}><td><strong>{company.name}</strong><small>{company.address || "Address not provided"}</small></td><td>{company.industry || company.businessType || "-"}</td><td>{company.email || company.contactEmail || company.phone || "-"}</td><td>{company.studentCount || 0}</td></tr>)}</tbody></table></div>}</section></main></CoordinatorState>;
}

export default PartnerCompanies;
