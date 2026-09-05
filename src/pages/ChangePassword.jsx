import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import {
  doc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

import "../styles/ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();
  const { firebaseUser, user, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SUBMIT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // CHECK PASSWORD
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!firebaseUser) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      // UPDATE FIREBASE AUTH PASSWORD
      await updatePassword(firebaseUser, newPassword);

      // UPDATE FIRESTORE USER PROFILE
      const userRef = doc(db, "users", firebaseUser.uid);

      await updateDoc(userRef, {
        mustChangePassword: false,
        passwordChanged: true,
        temporaryPassword: deleteField(),
        updatedAt: serverTimestamp(),
      });

      // REFRESH USER CONTEXT
      if (refreshUser) {
        await refreshUser();
      }

      // SUCCESS
      setSuccess("Your password has been changed successfully.");

      // REDIRECT BASED ON ROLE
      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin", {
            replace: true,
          });
        } else if (user?.role === "staff") {
          navigate("/staff", {
            replace: true,
          });
        } else if (user?.role === "customer") {
          navigate("/customer", {
            replace: true,
          });
        } else {
          navigate("/", {
            replace: true,
          });
        }
      }, 1200);
    } catch (error) {
      console.error("Change password error:", error);

      // FIREBASE AUTH ERRORS
      if (error.code === "auth/requires-recent-login") {
        setError(
          "For security, please log in again before changing your password.",
        );
      } else if (error.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (error.code === "permission-denied") {
        setError(
          "Password changed in Authentication, but your Firestore profile could not be updated. Please contact the administrator.",
        );
      } else {
        setError(error.message || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <h1>Change Your Password</h1>

        <p className="change-password-description">
          You are using a temporary password. For security, you must create a
          new password before continuing.
        </p>

        {/* ERROR */}

        {error && <div className="password-alert error">{error}</div>}

        {/* SUCCESS */}
        {success && <div className="password-alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* NEW PASSWORD */}
          <div className="password-form-group">
            <label>New Password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
            />

            <small>Minimum 6 characters.</small>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="password-form-group">
            <label>Confirm New Password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="change-password-btn"
            disabled={loading}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
