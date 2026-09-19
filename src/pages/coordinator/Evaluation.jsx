import { useState } from "react";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { Check, Eye, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { db } from "../../services/firebase";
import { CoordinatorState, normalizedStudents, useCoordinatorData, valueOf } from "./coordinatorData.jsx";

function Evaluation() {
  const { user } = useAuth();
  const { data, loading, error } = useCoordinatorData(["students", "attendance", "evaluations"]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ rating: "", comments: "" });
  const [feedback, setFeedback] = useState("");
  const students = normalizedStudents(data.students, data.attendance);
  const evaluationsByStudent = new Map(data.evaluations.map((item) => [valueOf(item, ["studentId", "studentID"]), item]));
  const save = async (event) => { event.preventDefault(); if (!selected || !form.rating || !form.comments.trim()) { setFeedback("Rating and comments are required."); return; } try { const existing = evaluationsByStudent.get(selected.studentId); const record = { studentId: selected.studentId, studentName: selected.name, rating: Number(form.rating), comments: form.comments.trim(), evaluatorId: user?.uid || null, evaluatorName: user?.email || "Coordinator", status: "Completed", updatedAt: serverTimestamp() }; if (existing) await updateDoc(doc(db, "evaluations", existing.id), record); else await addDoc(collection(db, "evaluations"), { ...record, createdAt: serverTimestamp() }); setSelected(null); setForm({ rating: "", comments: "" }); setFeedback("Evaluation saved successfully."); } catch (saveError) { console.error("Unable to save evaluation:", saveError); setFeedback("Evaluation could not be saved."); } };
  return <CoordinatorState loading={loading} error={error}><main className="coordinator-data-page"><header className="coordinator-data-header"><div><p>OJT monitoring</p><h1>Evaluations</h1><span>Review student progress and record coordinator evaluations.</span></div></header><section className="coordinator-data-panel"><div className="coordinator-data-table-wrap"><table className="coordinator-data-table"><thead><tr><th>Student</th><th>Company</th><th>OJT status</th><th>Evaluation</th><th /></tr></thead><tbody>{students.map((student) => { const evaluation = evaluationsByStudent.get(student.studentId); return <tr key={student.id}><td><strong>{student.name}</strong><small>{student.studentId}</small></td><td>{student.company}</td><td>{student.status}</td><td>{evaluation ? `${evaluation.rating}/5` : "Awaiting evaluation"}</td><td><button type="button" className="coordinator-icon-button" title={evaluation ? "Edit evaluation" : "Add evaluation"} onClick={() => { setSelected(student); setForm({ rating: evaluation?.rating || "", comments: evaluation?.comments || "" }); setFeedback(""); }}>{evaluation ? <Eye size={16} /> : <Check size={16} />}</button></td></tr>; })}</tbody></table>{students.length === 0 && <div className="coordinator-data-empty">No students are available for evaluation.</div>}</div></section>{feedback && <p className="coordinator-feedback" role="status">{feedback}</p>}{selected && <div className="coordinator-modal-backdrop" role="presentation"><section className="coordinator-modal" role="dialog" aria-modal="true"><header><h2>Evaluate {selected.name}</h2><button type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button></header><form onSubmit={save}><label>Rating (1-5)<input type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} required /></label><label>Comments<textarea value={form.comments} onChange={(event) => setForm({ ...form, comments: event.target.value })} required /></label><button type="submit" className="coordinator-primary-button">Save evaluation</button></form></section></div>}</main></CoordinatorState>;
}

export default Evaluation;
