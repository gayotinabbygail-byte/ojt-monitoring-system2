const { createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

initializeApp();

const db = getFirestore();
const attendanceQrSecret = defineSecret("ATTENDANCE_QR_SECRET");
const tokenLifetimeSeconds = 30;
const timeZone = "Asia/Manila";

function getLocalDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getLocalTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function signToken(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsignedToken = `${header}.${body}`;
  const signature = createHmac("sha256", secret).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
}

function verifyToken(token, secret) {
  if (typeof token !== "string" || token.length > 8192) {
    throw new HttpsError("invalid-argument", "The student attendance QR token is invalid.");
  }

  const [header, body, signature, extra] = token.split(".");
  if (!header || !body || !signature || extra !== undefined) {
    throw new HttpsError("invalid-argument", "The student attendance QR token is invalid.");
  }

  const unsignedToken = `${header}.${body}`;
  const expectedSignature = createHmac("sha256", secret).update(unsignedToken).digest();
  const suppliedSignature = Buffer.from(signature, "base64url");
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new HttpsError("unauthenticated", "The student attendance QR signature is invalid.");
  }

  try {
    const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decodedHeader.alg !== "HS256" || decodedHeader.typ !== "JWT") {
      throw new Error("Invalid token header");
    }
    return payload;
  } catch {
    throw new HttpsError("invalid-argument", "The student attendance QR token is invalid.");
  }
}

async function getUserProfile(uid) {
  const userSnapshot = await db.collection("users").doc(uid).get();
  return userSnapshot.exists ? userSnapshot.data() : null;
}

function getStudentNumber(profile, fallbackId) {
  return profile.studentId || profile.studentID || profile.idNumber || fallbackId;
}

function getStudentName(profile) {
  const name =
    profile.name ||
    profile.fullName ||
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return name || profile.email || "Student";
}

function calculateHours(timeIn, timeOut) {
  const parseTime = (value) => {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || "");
    if (!match) return null;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hour += 12;
    return hour * 60 + Number(match[2]);
  };

  const start = parseTime(timeIn);
  const end = parseTime(timeOut);
  return start === null || end === null
    ? 0
    : Number((Math.max(0, end - start) / 60).toFixed(2));
}

exports.issueStudentAttendanceQrToken = onCall(
  { secrets: [attendanceQrSecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in as a student to generate your attendance QR code.");
    }

    const studentUid = request.auth.uid;
    const studentProfile = await getUserProfile(studentUid);
    if (studentProfile?.role !== "student") {
      throw new HttpsError("permission-denied", "Only students can generate a student attendance QR code.");
    }

    const now = Date.now();
    const issuedAt = Math.floor(now / 1000);
    const expiresAt = now + tokenLifetimeSeconds * 1000;
    const token = signToken(
      {
        iss: "ojt-monitoring-system",
        student_id: studentUid,
        iat: issuedAt,
        exp: Math.floor(expiresAt / 1000),
        nonce: randomBytes(24).toString("base64url"),
      },
      attendanceQrSecret.value(),
    );

    return {
      token,
      studentId: getStudentNumber(studentProfile, studentUid),
      expiresAt,
    };
  },
);

exports.scanStudentAttendanceQr = onCall(
  { secrets: [attendanceQrSecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in as a supervisor to scan student attendance.");
    }

    const supervisorUid = request.auth.uid;
    const supervisorProfile = await getUserProfile(supervisorUid);
    if (supervisorProfile?.role !== "supervisor") {
      throw new HttpsError("permission-denied", "Only supervisors can scan student attendance QR codes.");
    }

    const payload = verifyToken(request.data?.token, attendanceQrSecret.value());
    const now = Date.now();
    const currentTime = Math.floor(now / 1000);
    if (
      payload.iss !== "ojt-monitoring-system" ||
      typeof payload.student_id !== "string" ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 32 ||
      !Number.isInteger(payload.iat) ||
      !Number.isInteger(payload.exp) ||
      payload.iat > currentTime + 5 ||
      payload.exp <= currentTime ||
      payload.exp - payload.iat > tokenLifetimeSeconds
    ) {
      throw new HttpsError("deadline-exceeded", "This student QR code has expired. Ask the student to refresh it.");
    }

    const studentUid = payload.student_id;
    const studentProfile = await getUserProfile(studentUid);
    if (studentProfile?.role !== "student") {
      throw new HttpsError("not-found", "The scanned QR code does not belong to an active student account.");
    }

    const studentId = getStudentNumber(studentProfile, studentUid);
    const studentName = getStudentName(studentProfile);
    const date = getLocalDate(new Date(now));
    const scanRef = db.collection("attendanceQrScans").doc(payload.nonce);
    const attendanceQuery = db.collection("attendance").where("studentUid", "==", studentUid);
    const fallbackAttendanceRef = db.collection("attendance").doc(`${studentUid}_${date}`);
    const time = getLocalTime(new Date(now));

    return db.runTransaction(async (transaction) => {
      const previousScan = await transaction.get(scanRef);
      if (previousScan.exists) {
        const previous = previousScan.data();
        return {
          alreadyRecorded: true,
          studentId,
          studentName,
          action: previous.action,
          time: previous.time,
          totalHours: previous.totalHours,
        };
      }

      const attendanceSnapshot = await transaction.get(attendanceQuery);
      const existingRecord = attendanceSnapshot.docs.find((document) => document.data().date === date);
      const attendanceRef = existingRecord?.ref || fallbackAttendanceRef;
      const attendanceDocument = existingRecord
        ? null
        : await transaction.get(attendanceRef);
      const previousAttendance = existingRecord
        ? existingRecord.data()
        : attendanceDocument.exists
          ? attendanceDocument.data()
          : {};
      const currentTimeIn =
        previousAttendance.timeIn ||
        previousAttendance.morningTimeIn ||
        previousAttendance.afternoonTimeIn ||
        "";
      const currentTimeOut =
        previousAttendance.timeOut ||
        previousAttendance.morningTimeOut ||
        previousAttendance.afternoonTimeOut ||
        "";

      if (currentTimeIn && currentTimeOut) {
        throw new HttpsError("failed-precondition", `${studentName} already has both Time-In and Time-Out recorded today.`);
      }

      const action = currentTimeIn ? "Time-Out" : "Time-In";
      const nextTimeIn = currentTimeIn || (action === "Time-In" ? time : "");
      const nextTimeOut = currentTimeOut || (action === "Time-Out" ? time : "");
      const totalHours = calculateHours(nextTimeIn, nextTimeOut);
      const attendance = {
        ...previousAttendance,
        studentUid,
        studentId,
        studentName,
        date,
        timeIn: nextTimeIn,
        timeOut: nextTimeOut,
        totalHours,
        hours: totalHours,
        status: "Present",
        lastAttendanceAction: action,
        supervisorId: supervisorUid,
        updatedAt: FieldValue.serverTimestamp(),
        ...(!existingRecord && !attendanceDocument.exists
          ? { createdAt: FieldValue.serverTimestamp() }
          : {}),
      };

      transaction.create(scanRef, {
        studentUid,
        studentId,
        studentName,
        supervisorId: supervisorUid,
        action,
        time,
        totalHours,
        scannedAt: Timestamp.fromMillis(now),
      });
      transaction.set(attendanceRef, attendance);

      return { alreadyRecorded: false, studentId, studentName, action, time, totalHours };
    });
  },
);
