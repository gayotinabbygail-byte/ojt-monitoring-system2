import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/Registration.css";

/* REGISTRATION */
const Registration = () => {
  const navigate = useNavigate();

  /* FORM DATA */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  /* DATA PRIVACY */
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  /* STATUS */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* HANDLE INPUT CHANGES */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  /* HANDLE REGISTRATION */
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { firstName, lastName, email, phone, password, confirmPassword } =
      formData;

    /* VALIDATION */
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least 1 uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least 1 lowercase letter.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least 1 number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least 1 special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    /* DATA PRIVACY CONSENT */
    if (!privacyConsent) {
      setError("You must agree to the Data Privacy Notice before registering.");
      return;
    }

    /* CREATE ACCOUNT */
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      /* CREATE FIRESTORE USER DOCUMENT */
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: "customer",

        /* DATA PRIVACY CONSENT */
        privacyConsent: true,
        privacyConsentAt: serverTimestamp(),
        privacyNoticeVersion: "1.0",

        /* ACCOUNT INFORMATION */
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      /* SUCCESS */
      setSuccess("Registration successful!");

      /* REDIRECT TO LOGIN */
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      /* FIREBASE AUTH ERRORS */
      if (error.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password must meet all password requirements.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* UI */
  return (
    <div className="registration-page">
      <div className="registration-container">
        {/* HEADER */}

        <div className="registration-header">
          <h1>Create Account</h1>
          <p>Register for an account</p>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleRegister}>
          {/* FIRST NAME */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          {/* LAST NAME */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              disabled={loading}
              autoComplete="tel"
            />
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={loading}
              autoComplete="new-password"
            />

            {/* PASSWORD REQUIREMENTS */}

            {formData.password && (
              <div className="password-requirements password-requirements-visible">
                <p className="password-requirements-title">
                  Password must contain:
                </p>

                <div
                  className={
                    formData.password.length >= 8
                      ? "password-requirement met"
                      : "password-requirement"
                  }
                >
                  <span>{formData.password.length >= 8 ? "✓" : "✕"}</span>
                  <span>At least 8 characters</span>
                </div>

                <div
                  className={
                    /[A-Z]/.test(formData.password)
                      ? "password-requirement met"
                      : "password-requirement"
                  }
                >
                  <span>{/[A-Z]/.test(formData.password) ? "✓" : "✕"}</span>
                  <span>At least 1 uppercase letter</span>
                </div>

                <div
                  className={
                    /[a-z]/.test(formData.password)
                      ? "password-requirement met"
                      : "password-requirement"
                  }
                >
                  <span>{/[a-z]/.test(formData.password) ? "✓" : "✕"}</span>
                  <span>At least 1 lowercase letter</span>
                </div>

                <div
                  className={
                    /\d/.test(formData.password)
                      ? "password-requirement met"
                      : "password-requirement"
                  }
                >
                  <span>{/\d/.test(formData.password) ? "✓" : "✕"}</span>
                  <span>At least 1 number</span>
                </div>

                <div
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "password-requirement met"
                      : "password-requirement"
                  }
                >
                  <span>
                    {/[^A-Za-z0-9]/.test(formData.password) ? "✓" : "✕"}
                  </span>
                  <span>At least 1 special character</span>
                </div>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
            />

            {/* PASSWORD MATCH STATUS */}

            {formData.confirmPassword && (
              <div
                className={
                  formData.password === formData.confirmPassword
                    ? "password-match-message matched"
                    : "password-match-message not-matched"
                }
              >
                <span>
                  {formData.password === formData.confirmPassword ? "✓" : "✕"}
                </span>

                <span>
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Password does not match"}
                </span>
              </div>
            )}
          </div>

          {/* DATA PRIVACY CONSENT */}

          <div className="privacy-consent">
            <label className="privacy-checkbox">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => {
                  setPrivacyConsent(e.target.checked);
                  setError("");
                }}
                disabled={loading}
              />

              <span>
                I have read and understood the{" "}
                <button
                  type="button"
                  className="privacy-link"
                  onClick={() => setShowPrivacyNotice(true)}
                  disabled={loading}
                >
                  Data Privacy Notice
                </button>{" "}
                and agree to the processing of my personal information.
              </span>
            </label>
          </div>

          {/* ERROR MESSAGE */}

          {error && <div className="error-message">{error}</div>}

          {/* SUCCESS MESSAGE */}

          {success && <div className="success-message">{success}</div>}

          {/* REGISTER BUTTON */}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}

        <div className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>

      {/* DATA PRIVACY NOTICE MODAL */}

      {showPrivacyNotice && (
        <div className="privacy-modal-overlay">
          <div className="privacy-modal">
            {/* MODAL HEADER */}

            <div className="privacy-modal-header">
              <h2>Data Privacy Notice</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowPrivacyNotice(false)}
                aria-label="Close Data Privacy Notice"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="privacy-modal-content">
              <h3>Data Privacy Act of 2012</h3>

              <p>
                In accordance with the Data Privacy Act of 2012 (Republic Act
                No. 10173), we respect your right to privacy and are committed
                to protecting your personal information.
              </p>

              <h3>Information We Collect</h3>

              <p>
                During registration, we may collect information such as your
                name, email address, and phone number.
              </p>

              <h3>Purpose of Collection</h3>

              <p>
                Your information may be used to create and manage your account,
                authenticate your identity, provide our services, process
                transactions, communicate with you, and maintain the security of
                the system.
              </p>

              <h3>Protection of Your Information</h3>

              <p>
                We implement reasonable organizational, physical, and technical
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h3>Your Privacy Rights</h3>

              <p>
                Subject to applicable laws and regulations, you may have rights
                regarding your personal information, including the right to
                access, correct, and request the appropriate disposal of your
                personal information.
              </p>

              <p>
                By proceeding with registration, you acknowledge that you have
                read and understood this Data Privacy Notice and consent to the
                processing of your personal information for the purposes
                described above.
              </p>
            </div>

            {/* MODAL FOOTER */}

            <div className="privacy-modal-footer">
              <button
                type="button"
                className="privacy-agree-button"
                onClick={() => {
                  setPrivacyConsent(true);
                  setShowPrivacyNotice(false);
                  setError("");
                }}
              >
                I Understand and Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
