import { useContext } from "react";
import { AttendanceContext } from "./AttendanceContextDefinition";

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error("useAttendance must be used within AttendanceProvider");
  return context;
}