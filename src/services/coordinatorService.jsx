import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Get all students
export const getAssignedStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get all applications
export const getApplications = async () => {
  const snapshot = await getDocs(collection(db, "applications"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get attendance records
export const getAttendanceRecords = async () => {
  const snapshot = await getDocs(collection(db, "attendance"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};