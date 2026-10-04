import { useEffect, useId } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function SupervisorStudentQrScanner({ onScan, onScannerError }) {
  const scannerId = `supervisor-student-qr-scanner-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        rememberLastUsedCamera: true,
      },
      false,
    );
    let scanSubmitted = false;

    scanner.render(
      (decodedText) => {
        if (scanSubmitted) return;
        scanSubmitted = true;
        onScan(decodedText);
      },
      () => {},
    );

    return () => {
      void scanner.clear().catch((error) => {
        console.error("Unable to close the student QR camera scanner:", error);
        onScannerError("The camera scanner could not be closed cleanly. Refresh the page if it remains visible.");
      });
    };
  }, [onScan, onScannerError, scannerId]);

  return <div className="supervisor-student-qr-reader" id={scannerId} aria-label="Student attendance QR camera scanner" />;
}

export default SupervisorStudentQrScanner;
