# Attendance QR Functions

Student QR codes are signed by Firebase Functions and validated by the
server before attendance is written. Never place the signing secret in the
React application.

Before deploying, configure the secret once:

```powershell
firebase functions:secrets:set ATTENDANCE_QR_SECRET
```

Use a strong, randomly generated value of at least 32 bytes. Then deploy the
functions and Firestore rules:

```powershell
firebase deploy --only functions,firestore:rules
```

The student portal refreshes each student's signed QR token every 30 seconds.
The supervisor scans it using the camera scanner. The function derives the
student and supervisor identities from Firebase Authentication, validates the
signature, expiry, roles, and one-time nonce, then records Time-In on the
student's first scan and Time-Out on the next scan that day. The supervisor
dashboard listens to attendance records in real time.

Camera access requires HTTPS (localhost is allowed during local development).
