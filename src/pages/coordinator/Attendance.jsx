import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { CalendarDays, UserRound } from "lucide-react";
import { db } from "../../services/firebase";

const attendancePeriods = [
  { value: "amIn", label: "AM / IN", short: "AM IN" },
  { value: "amOut", label: "AM / OUT", short: "AM OUT" },
  { value: "pmIn", label: "PM / IN", short: "PM IN" },
  { value: "pmOut", label: "PM / OUT", short: "PM OUT" },
];

function getLocalDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getStudentName(student) {
  return (
    student.name ||
    student.fullName ||
    student.studentName ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    "Unnamed student"
  );
}

function getStudentId(student) {
  return String(
    student.studentId ||
      student.studentID ||
      student.idNumber ||
      student.id ||
      "",
  );
}

function getPeriodTime(record, period) {
  const legacyValues = {
    amIn: record.timeIn || record.morningTimeIn,
    amOut: record.morningTimeOut,
    pmIn: record.afternoonTimeIn,
    pmOut: record.timeOut || record.afternoonTimeOut,
  };
  return record[period] || legacyValues[period] || "";
}

function dateLabel(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDate);

  useEffect(() => {
    let studentsLoaded = false;
    let attendanceLoaded = false;
    const finishLoading = () => {
      if (studentsLoaded && attendanceLoaded) setLoading(false);
    };

    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        setStudents(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        );
        studentsLoaded = true;
        finishLoading();
      },
      (snapshotError) => {
        console.error("Unable to load students for attendance:", snapshotError);
        setError("Student records could not be loaded. Check Firestore permissions.");
        studentsLoaded = true;
        finishLoading();
      },
    );
    const unsubscribeAttendance = onSnapshot(
      collection(db, "attendance"),
      (snapshot) => {
        setRecords(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        );
        attendanceLoaded = true;
        finishLoading();
      },
      (snapshotError) => {
        console.error("Unable to load attendance records:", snapshotError);
        setError("Attendance records could not be loaded. Check Firestore permissions.");
        attendanceLoaded = true;
        finishLoading();
      },
    );

    return () => {
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, []);

  const studentById = useMemo(
    () => new Map(students.map((student) => [getStudentId(student), student])),
    [students],
  );
  const attendanceForDate = useMemo(
    () => records.filter((record) => record.date === selectedDate),
    [records, selectedDate],
  );

  const rowsForDate = (dateRecords) =>
    dateRecords.map((record) => {
      const student =
        studentById.get(String(record.studentId || "")) ||
        students.find((item) => item.id === record.studentUid);
      return {
        ...record,
        displayName:
          record.studentName || record.student || getStudentName(student || {}),
        displayId: record.studentId || getStudentId(student || {}) || "—",
      };
    });

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            LCCI · OJT Monitoring System
          </p>
          <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Attendance Records
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Review students&apos; daily time records by date.
          </p>
        </header>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <UserRound size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                  Daily time record
                </p>
                <h2 className="m-0 mt-1 text-lg font-bold text-slate-900">
                  Attendance by student
                </h2>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={17} className="text-slate-400" />
              <span className="sr-only">Filter attendance by date</span>
              <input
                aria-label="Filter attendance by date"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          </div>

          <div className="p-4 sm:p-6">
            <AttendanceTable
              title={`Attendance records · ${dateLabel(selectedDate)}`}
              records={rowsForDate(attendanceForDate)}
              loading={loading}
              emptyText="No attendance records for this date."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function AttendanceTable({
  title,
  records,
  loading,
  emptyText,
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-4">
        <UserRound className="text-slate-400" size={17} />
        <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-700">
          {title}
        </h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[670px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Name of Student
              </th>
              {attendancePeriods.map((period) => (
                <th
                  className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
                  key={period.value}
                >
                  {period.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-slate-500"
                  colSpan={5}
                >
                  Loading attendance…
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-slate-500"
                  colSpan={5}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr className="border-t border-slate-100" key={record.id}>
                  <td className="px-4 py-3">
                    <strong className="block text-sm font-semibold text-slate-800">
                      {record.displayName}
                    </strong>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {record.displayId}
                    </span>
                  </td>
                  {attendancePeriods.map((period) => (
                    <td
                      className="px-3 py-3 text-center text-sm font-medium text-slate-700"
                      key={period.value}
                    >
                      {getPeriodTime(record, period.value) || "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Attendance;
