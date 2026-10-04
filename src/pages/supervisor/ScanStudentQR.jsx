import { lazy, Suspense, useCallback, useState } from "react";
import { Camera, CameraOff, CheckCircle2, Clock3, QrCode, ScanLine } from "lucide-react";
import { scanStudentAttendanceQr } from "../../services/attendanceQrService";
import { PageHeader } from "./SupervisorComponents";
import "../../styles/supervisor-student-qr.css";

const SupervisorStudentQrScanner = lazy(() => import("./SupervisorStudentQrScanner"));

function ScanStudentQR() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const handleScan = useCallback(async (token) => {
    setScannerOpen(false);
    setProcessing(true);
    setFeedback(null);

    try {
      const result = await scanStudentAttendanceQr(token);
      const scan = {
        id: `${result.studentId}-${Date.now()}`,
        studentId: result.studentId,
        studentName: result.studentName,
        action: result.action,
        time: result.time,
        alreadyRecorded: result.alreadyRecorded,
      };
      setRecentScans((current) => [scan, ...current].slice(0, 8));
      setFeedback({
        type: "success",
        text: result.alreadyRecorded
          ? `${result.studentName} was already recorded for ${result.action} at ${result.time}.`
          : `${result.action} recorded for ${result.studentName} at ${result.time}.`,
      });
    } catch (error) {
      console.error("Unable to validate the scanned student QR code:", error);
      setFeedback({
        type: "error",
        text: error.message || "The scanned QR code could not be validated. Ask the student to refresh their code.",
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleScannerError = useCallback((message) => {
    setFeedback({ type: "error", text: message });
  }, []);

  return (
    <div className="supervisor-page supervisor-student-qr-page">
      <PageHeader
        eyebrow="Supervisor workspace · Attendance"
        title="Scan Student QR"
        description="Scan the signed QR code displayed in a student’s My Attendance page to record Time-In or Time-Out."
      />

      <section className="supervisor-student-qr-layout">
        <article className="supervisor-panel supervisor-student-qr-panel">
          <div className="supervisor-student-qr-heading">
            <span className="supervisor-student-qr-icon"><ScanLine size={20} /></span>
            <div>
              <h2>Student Attendance Scanner</h2>
              <p>Each code expires in 30 seconds and can only be used once.</p>
            </div>
          </div>

          <div className="supervisor-student-qr-actions">
            <button
              type="button"
              className="supervisor-primary"
              onClick={() => {
                setFeedback(null);
                setScannerOpen((open) => !open);
              }}
              disabled={processing}
            >
              {scannerOpen ? <CameraOff size={16} /> : <Camera size={16} />}
              {scannerOpen ? "Close camera" : "Open camera scanner"}
            </button>
            {processing && <span role="status">Validating attendance...</span>}
          </div>

          {feedback && (
            <div className={`supervisor-student-qr-feedback ${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
              {feedback.type === "success" ? <CheckCircle2 size={17} /> : <QrCode size={17} />}
              <span>{feedback.text}</span>
            </div>
          )}

          {scannerOpen && (
            <Suspense fallback={<p className="supervisor-muted" role="status">Loading camera scanner...</p>}>
              <SupervisorStudentQrScanner
                onScan={handleScan}
                onScannerError={handleScannerError}
              />
            </Suspense>
          )}

          {!scannerOpen && !feedback && (
            <div className="supervisor-student-qr-help">
              <QrCode size={32} />
              <strong>Ready to scan</strong>
              <span>Open the camera, then point it at the student’s QR code.</span>
            </div>
          )}
        </article>

        <article className="supervisor-panel supervisor-student-qr-panel">
          <div className="supervisor-student-qr-heading">
            <span className="supervisor-student-qr-icon live"><Clock3 size={20} /></span>
            <div>
              <h2>Recent Scans</h2>
              <p>Successful scans from this page.</p>
            </div>
          </div>

          {recentScans.length === 0 ? (
            <div className="supervisor-student-qr-help">
              <Clock3 size={30} />
              <strong>No recent scans</strong>
              <span>Scanned students and their Time-In/Time-Out actions will appear here.</span>
            </div>
          ) : (
            <div className="supervisor-student-qr-list">
              {recentScans.map((scan) => (
                <div className="supervisor-student-qr-row" key={scan.id}>
                  <span className="supervisor-student-qr-avatar">
                    {(scan.studentName || "S").trim().charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{scan.studentName}</strong>
                    <span>{scan.studentId}</span>
                  </div>
                  <span className="supervisor-student-qr-action">{scan.action}</span>
                  <time>{scan.time}</time>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default ScanStudentQR;
