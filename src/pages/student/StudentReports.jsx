import { useMemo, useState } from "react";
import { FileText, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import "../../styles/student-portal.css";

const initialReports = [
  {
    id: 1,
    title: "Weekly Accomplishment Report #6",
    week: "Week 6",
    dateSubmitted: "2026-09-18",
    description: "Completed home page module and updated user onboarding tasks.",
    status: "Approved",
    feedback: "Strong progress and clear technical documentation.",
  },
  {
    id: 2,
    title: "Weekly Accomplishment Report #5",
    week: "Week 5",
    dateSubmitted: "2026-09-11",
    description: "Worked on the employee records feature and collaborated with QA testing.",
    status: "Pending",
    feedback: "Awaiting faculty review.",
  },
  {
    id: 3,
    title: "OJT Reflection Report",
    week: "Week 4",
    dateSubmitted: "2026-09-04",
    description: "Discussed learning outcomes, communication, and adaptation in the workplace.",
    status: "Rejected",
    feedback: "Please add more concrete examples and task details.",
  },
];

const emptyForm = {
  title: "",
  week: "Week 1",
  description: "",
  tasks: "",
  skills: "",
  challenges: "",
  reflection: "",
};

function StudentReports() {
  const [reports, setReports] = useState(initialReports);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filteredReports = useMemo(() => {
    if (!search.trim()) return reports;
    const query = search.trim().toLowerCase();
    return reports.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query) ||
        report.week.toLowerCase().includes(query)
    );
  }, [reports, search]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Report title and description are required.");
      return;
    }

    const newReport = {
      id: Date.now(),
      title: form.title,
      week: form.week,
      dateSubmitted: new Date().toISOString().slice(0, 10),
      description: form.description,
      status: "Pending",
      feedback: "Awaiting review.",
    };

    setReports((current) => [newReport, ...current]);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = (id) => {
    setReports((current) => current.filter((report) => report.id !== id));
  };

  return (
    <div className="student-portal-page">
      <header className="student-page-header">
        <div>
          <p className="student-meta">Reporting</p>
          <h1>OJT Reports</h1>
        </div>
        <div className="student-header-actions">
          <button type="button" className="student-button primary">
            <Plus size={15} /> Submit New Report
          </button>
        </div>
      </header>

      <section className="student-card student-panel">
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">Weekly tracking</p>
            <h2 className="student-panel-title">Report Management</h2>
          </div>
          <div className="student-field" style={{ minWidth: "220px" }}>
            <label htmlFor="reportSearch" style={{ display: "none" }}>Search reports</label>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "#718096" }} />
              <input
                id="reportSearch"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports"
                style={{ paddingLeft: "32px" }}
              />
            </div>
          </div>
        </div>

        <table className="student-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Week</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Feedback</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="student-empty-state">No reports found.</div>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.week}</td>
                  <td>{new Date(`${report.dateSubmitted}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <span className={
                      report.status === "Approved"
                        ? "status-badge active"
                        : report.status === "Pending"
                          ? "status-badge pending"
                          : "status-badge absent"
                    }>
                      {report.status}
                    </span>
                  </td>
                  <td>{report.feedback}</td>
                  <td>
                    <div className="student-header-actions">
                      <button type="button" className="student-mini-button" title="View">
                        <FileText size={14} />
                      </button>
                      <button type="button" className="student-mini-button" title="Edit">
                        <PencilLine size={14} />
                      </button>
                      <button type="button" className="student-mini-button" title="Delete" onClick={() => handleDelete(report.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="student-card student-panel" style={{ marginTop: "18px" }}>
        <div className="student-panel-header">
          <div>
            <p className="student-panel-subtitle">New report</p>
            <h2 className="student-panel-title">Submit Report</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="student-form-grid">
            <div className="student-field">
              <label>Report title</label>
              <input type="text" value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Week number</label>
              <select value={form.week} onChange={(event) => handleChange("week", event.target.value)}>
                <option>Week 1</option>
                <option>Week 2</option>
                <option>Week 3</option>
                <option>Week 4</option>
                <option>Week 5</option>
                <option>Week 6</option>
              </select>
            </div>
            <div className="student-field full">
              <label>Weekly accomplishments</label>
              <textarea value={form.description} onChange={(event) => handleChange("description", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Tasks performed</label>
              <textarea value={form.tasks} onChange={(event) => handleChange("tasks", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Skills learned</label>
              <textarea value={form.skills} onChange={(event) => handleChange("skills", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Problems encountered</label>
              <textarea value={form.challenges} onChange={(event) => handleChange("challenges", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Reflection / remarks</label>
              <textarea value={form.reflection} onChange={(event) => handleChange("reflection", event.target.value)} />
            </div>
            <div className="student-field">
              <label>Attachment</label>
              <input type="file" />
            </div>
          </div>

          {error ? <div className="student-warning-box" style={{ marginBottom: "12px" }}>{error}</div> : null}

          <div className="student-actions-row">
            <button type="button" className="student-button">Cancel</button>
            <button type="submit" className="student-button primary">Submit Report</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StudentReports;
