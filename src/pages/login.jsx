import "../styles/Login.css";
import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getUserData } from "../services/userService";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    try {
      const userCredential = await login(email, password);

      const userData = await getUserData(userCredential.user.uid);

      if (!userData) {
        alert("User profile not found.");
        return;
      }

      if (userData.role === "admin") {
        navigate("/admin");
      } else if (userData.role === "client") {
        navigate("/client");
      } else if (userData.role === "coordinator") {
        navigate("/coordinator");
      } else if (userData.role === "student") {
        navigate("/Student");
      } else if (userData.role === "supervisor") {
        navigate("/supervisor");
      } else {
        alert("Invalid user role.");
      }
    } catch (error) {
      const authMessages = {
        "auth/invalid-credential":
          "The email or password is incorrect. Confirm that this account exists in Firebase Authentication.",
        "auth/user-not-found": "No Firebase account was found for this email.",
        "auth/wrong-password": "The password is incorrect.",
      };
      setErrorMessage(authMessages[error.code] || error.message);
    }
  };

  useEffect(() => {
    const redirectUser = async () => {
      if (!user) return;

      try {
        const userData = await getUserData(user.uid);

        if (!userData) return;

        if (userData.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (userData.role === "client") {
          navigate("/client", { replace: true });
        } else if (userData.role === "student") {
          navigate("/Student", { replace: true });
        } else if (userData.role === "coordinator") {
          navigate("/coordinator", { replace: true });
        } else if (userData.role === "supervisor") {
          navigate("/supervisor", { replace: true });
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    redirectUser();
  }, [user, navigate]);

  return (
    <div className="login-container">
      <div className="login-story">
        <div className="login-mark" aria-label="LCCI">
          LCCI
        </div>
        <p className="login-overline">LCCI · OJT MONITORING</p>
        <h1>Make every placement count.</h1>
        <p className="login-story-copy">
          A clearer view of students, partners, attendance, and progress, all in
          one place.
        </p>
        <div className="login-story-line">
          <span /> Built for better coordination
        </div>
      </div>

      <div className="login-card">
        <p className="login-card-kicker">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p className="login-card-copy">Use your LCCI account to continue.</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="login-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="login-submit-button">
            Continue
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
