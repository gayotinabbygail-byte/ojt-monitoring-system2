import { useState } from "react";
import { Download, Search } from "lucide-react";
import { CoordinatorState, normalizedStudents, useCoordinatorData, useFilteredStudents } from "./coordinatorData.jsx";

function OjtHours() {
  const { data, loading, error } = useCoordinatorData(["students", "attendance"]);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("All companies");
  const students = normalizedStudents(data.students, data.attendance);
  const visible = useFilteredStudents(students, search, { company });
  const companies = [...new Set(students.map((item) => item.company).filter(Boolean))];
  const totals = students.reduce((result, item) => ({ required: result.required + item.required, completed: result.completed + item.completed }), { required: 0, completed: 0 });
  const exportCsv = () => { const rows = [["Student", "Student ID", "Required Hours", "Completed Hours", "Remaining Hours", "Status"], ...students.map((item) => [item.name, item.studentId, item.required, item.completed, item.remaining, item.status])]; const blob = new Blob([rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "ojt-hours.csv"; link.click(); URL.revokeObjectURL(link.href); };
  return <CoordinatorState loading={loading} error={error}><main className="coordinator-data-page"><header className="coordinator-data-header"><div><p>OJT monitoring</p><h1>OJT Hours</h1><span>{totals.completed} of {totals.required} required hours completed.</span></div><button type="button" className="coordinator-primary-button" onClick={exportCsv}><Download size={16} /> Export CSV</button></header><section className="coordinator-data-panel"><div className="coordinator-data-toolbar"><label className="coordinator-data-search"><Search size={16} /><span className="sr-only">Search students</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or ID" /></label><select aria-label="Filter by company" value={company} onChange={(event) => setCompany(event.target.value)}><option>All companies</option>{companies.map((item) => <option key={item}>{item}</option>)}</select></div>{visible.length === 0 ? <div className="coordinator-data-empty">No OJT hour records found.</div> : <div className="coordinator-data-table-wrap"><table className="coordinator-data-table"><thead><tr><th>Student</th><th>Company</th><th>Required</th><th>Completed</th><th>Remaining</th><th>Progress</th></tr></thead><tbody>{visible.map((item) => { const percent = item.required ? Math.min(100, Math.round(item.completed / item.required * 100)) : 0; return <tr key={item.id}><td><strong>{item.name}</strong><small>{item.studentId}</small></td><td>{item.company}</td><td>{item.required}</td><td>{item.completed}</td><td>{item.remaining}</td><td><div className="coordinator-progress-label"><span>{percent}%</span><progress value={percent} max="100" /></div></td></tr>; })}</tbody></table></div>}</section></main></CoordinatorState>;
}

export default OjtHours;
