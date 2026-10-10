import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  QrCode,
  Search,
  ScanLine,
  UserRound,
} from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/useAuth";
import { scanStudentAttendanceQr } from "../../services/attendanceQrService";

const StudentQrScanner = lazy(
  () => import("../supervisor/SupervisorStudentQrScanner"),
);

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

function formatTime(value) {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

function timeInMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || "");
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

function calculateTotalHours(record) {
  const pairs = [
    [getPeriodTime(record, "amIn"), getPeriodTime(record, "amOut")],
    [getPeriodTime(record, "pmIn"), getPeriodTime(record, "pmOut")],
  ];
  return pairs.reduce((total, [startValue, endValue]) => {
    const start = timeInMinutes(startValue);
    const end = timeInMinutes(endValue);
    return start === null || end === null
      ? total
      : total + Math.max(0, end - start) / 60;
  }, 0);
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
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [scannerDate, setScannerDate] = useState(getLocalDate);
  const [manualDate, setManualDate] = useState(getLocalDate);
  const [scannerPeriod, setScannerPeriod] = useState("amIn");
  const [manualPeriod, setManualPeriod] = useState("amIn");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerBusy, setScannerBusy] = useState(false);
  const [manualStudentId, setManualStudentId] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [savingManual, setSavingManual] = useState(false);

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
  const attendanceForScannerDate = useMemo(
    () => records.filter((record) => record.date === scannerDate),
    [records, scannerDate],
  );
  const attendanceForManualDate = useMemo(
    () => records.filter((record) => record.date === manualDate),
    [records, manualDate],
  );
  const visibleScannerRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return attendanceForScannerDate;
    return attendanceForScannerDate.filter((record) => {
      const student =
        studentById.get(String(record.studentId || "")) ||
        students.find((item) => item.id === record.studentUid);
      const name = record.studentName || record.student || getStudentName(student || {});
      return `${name} ${record.studentId || ""} ${record.company || ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [attendanceForScannerDate, search, studentById, students]);

  const handleScan = useCallback(
    async (token) => {
      setScannerOpen(false);
      setScannerBusy(true);
      setError("");
      setNotice("");

      if (scannerDate !== getLocalDate()) {
        setError("QR scans can only record attendance for today. Use manual recording for another date.");
        setScannerBusy(false);
        return;
      }

      try {
        const result = await scanStudentAttendanceQr(token, scannerPeriod);
        const selectedPeriod = attendancePeriods.find(
          (period) => period.value === scannerPeriod,
        );
        setNotice(
          result.alreadyRecorded
            ? `${result.studentName} already has ${result.action} recorded at ${result.time}.`
            : `${selectedPeriod?.label} recorded for ${result.studentName} at ${result.time}.`,
        );
      } catch (scanError) {
        console.error("Unable to record scanned attendance:", scanError);
        setError(scanError.message || "The attendance QR code could not be validated.");
      } finally {
        setScannerBusy(false);
      }
    },
    [scannerDate, scannerPeriod],
  );

  const handleScannerError = useCallback((message) => {
    setError(message);
  }, []);

  const saveManualAttendance = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const studentId = manualStudentId.trim();
    const student = studentById.get(studentId);
    if (!student) {
      setError("Enter an ID number belonging to a registered student.");
      return;
    }
    if (!manualTime) {
      setError("Enter an attendance time.");
      return;
    }

    const studentName = getStudentName(student);
    const existingRecord = records.find(
      (record) =>
        record.date === manualDate &&
        String(record.studentId || "") === studentId,
    );
    if (existingRecord && getPeriodTime(existingRecord, manualPeriod)) {
      setError(
        `${studentName} already has ${attendancePeriods.find((period) => period.value === manualPeriod)?.label} recorded for this date.`,
      );
      return;
    }

    const currentRecord = existingRecord || {};
    const formattedTime = formatTime(manualTime);
    const updatedRecord = {
      ...currentRecord,
      studentUid: student.uid || student.id,
      studentId,
      studentName,
      company:
        student.company || student.partnerCompany || student.companyName || "",
      date: manualDate,
      [manualPeriod]: formattedTime,
    };
    const amIn = getPeriodTime(updatedRecord, "amIn");
    const amOut = getPeriodTime(updatedRecord, "amOut");
    const pmIn = getPeriodTime(updatedRecord, "pmIn");
    const pmOut = getPeriodTime(updatedRecord, "pmOut");
    const periodInfo = attendancePeriods.find(
      (period) => period.value === manualPeriod,
    );

    setSavingManual(true);
    try {
      const data = {
        studentUid:
          student.uid || student.studentUid || student.authUid || student.id,
        studentId,
        studentName,
        company: updatedRecord.company,
        date: manualDate,
        [manualPeriod]: formattedTime,
        timeIn: amIn || pmIn || currentRecord.timeIn || "",
        timeOut: pmOut || amOut || currentRecord.timeOut || "",
        totalHours: Number(calculateTotalHours(updatedRecord).toFixed(2)),
        hours: Number(calculateTotalHours(updatedRecord).toFixed(2)),
        status: "Present",
        remarks: remarks.trim() || currentRecord.remarks || "",
        lastAttendanceAction: periodInfo.label,
        updatedBy: user?.uid || null,
        updatedAt: serverTimestamp(),
      };

      if (existingRecord) {
        await updateDoc(doc(db, "attendance", existingRecord.id), data);
      } else {
        await addDoc(collection(db, "attendance"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setNotice(
        `${periodInfo.label} saved for ${studentName} on ${dateLabel(manualDate)}.`,
      );
      setManualStudentId("");
      setManualTime("");
      setRemarks("");
    } catch (saveError) {
      console.error("Unable to save manual attendance:", saveError);
      setError(saveError.message || "Manual attendance could not be saved.");
    } finally {
      setSavingManual(false);
    }
  };

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
            Student Attendance Monitoring
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Record student attendance using the QR scanner or enter a record manually.
          </p>
        </header>

        {(error || notice) && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
            role={error ? "alert" : "status"}
          >
            {error ? (
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
            ) : (
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            )}
            <p>{error || notice}</p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <QrCode size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                  Scanner method
                </p>
                <h2 className="m-0 mt-1 text-lg font-bold text-slate-900">
                  Scan a student QR code
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.65fr)]">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Date
                <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500">
                  <CalendarDays size={17} />
                  <input
                    aria-label="Scanner attendance date"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 outline-none focus:ring-0"
                    type="date"
                    value={scannerDate}
                    onChange={(event) => setScannerDate(event.target.value)}
                  />
                </span>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Attendance action
                <select
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  value={scannerPeriod}
                  onChange={(event) => setScannerPeriod(event.target.value)}
                >
                  {attendancePeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Scanner</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {scannerOpen ? "Camera is ready to scan" : "Secure student QR recognition"}
                    </p>
                  </div>
                  <ScanLine className="text-blue-600" size={20} />
                </div>
                {scannerOpen ? (
                  <Suspense
                    fallback={
                      <div className="grid aspect-square place-items-center rounded-xl bg-white text-sm text-slate-500">
                        Loading scanner…
                      </div>
                    }
                  >
                    <StudentQrScanner
                      onScan={handleScan}
                      onScannerError={handleScannerError}
                    />
                  </Suspense>
                ) : (
                  <div className="grid aspect-square max-h-64 place-items-center rounded-xl border border-slate-200 bg-white text-center">
                    <div>
                      <QrCode className="mx-auto text-blue-300" size={56} strokeWidth={1.4} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Ready to scan
                      </p>
                      <p className="mt-1 px-4 text-xs text-slate-500">
                        Start the scanner and center a student QR code in the frame.
                      </p>
                    </div>
                  </div>
                )}
                <button
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
                  type="button"
                  disabled={scannerBusy}
                  onClick={() => {
                    setError("");
                    setScannerOpen((open) => !open);
                  }}
                >
                  <ScanLine size={16} />
                  {scannerBusy
                    ? "Recording attendance…"
                    : scannerOpen
                      ? "Close scanner"
                      : "Open scanner"}
                </button>
                <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <ClipboardCheck className="mt-0.5 shrink-0" size={14} />
                  QR scans record today&apos;s attendance only. Use manual recording for another date.
                </p>
              </div>
            </div>

            <AttendanceTable
              title="Name of Student"
              records={rowsForDate(visibleScannerRecords)}
              loading={loading}
              search={search}
              onSearch={setSearch}
              emptyText="No attendance records for this date."
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <ClipboardCheck size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                  Manual recording
                </p>
                <h2 className="m-0 mt-1 text-lg font-bold text-slate-900">
                  Enter attendance details
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.65fr)]">
            <form className="space-y-4" onSubmit={saveManualAttendance}>
              <label className="block text-sm font-semibold text-slate-700">
                ID Number
                <input
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  list="registered-student-ids"
                  value={manualStudentId}
                  onChange={(event) => setManualStudentId(event.target.value)}
                  placeholder="Enter student ID"
                  required
                />
                <datalist id="registered-student-ids">
                  {students.map((student) => (
                    <option key={student.id} value={getStudentId(student)}>
                      {getStudentName(student)}
                    </option>
                  ))}
                </datalist>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Date
                <input
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  type="date"
                  value={manualDate}
                  onChange={(event) => setManualDate(event.target.value)}
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Attendance action
                <select
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  value={manualPeriod}
                  onChange={(event) => setManualPeriod(event.target.value)}
                >
                  {attendancePeriods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Time
                <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-slate-400 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                  <Clock3 size={16} />
                  <input
                    className="min-w-0 flex-1 border-0 p-0 text-sm font-normal text-slate-800 outline-none focus:ring-0"
                    type="time"
                    value={manualTime}
                    onChange={(event) => setManualTime(event.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Textbox
                <textarea
                  className="mt-1.5 block min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add a note (optional)"
                  rows={3}
                />
              </label>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={savingManual || loading}
              >
                <CheckCircle2 size={16} />
                {savingManual ? "Saving record…" : "Save attendance"}
              </button>
            </form>

            <AttendanceTable
              title="Manual attendance records"
              records={rowsForDate(attendanceForManualDate)}
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
  search,
  onSearch,
  emptyText,
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UserRound className="text-slate-400" size={17} />
          <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-700">
            {title}
          </h3>
        </div>
        {onSearch && (
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-400 sm:max-w-xs">
            <Search size={15} />
            <span className="sr-only">Search attendance</span>
            <input
              className="min-w-0 flex-1 border-0 p-0 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search student name or ID"
            />
          </label>
        )}
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
