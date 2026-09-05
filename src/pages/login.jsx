import "../styles/Login.css";
import { useState } from "react";
import { createAccount, login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getUserData } from "../services/userService";
import { ArrowRight, BriefcaseBusiness, UserPlus } from "lucide-react";
import { createUserProfile } from "../services/userService";

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setErrorMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!email || !password || (isRegistering && (!fullName || !confirmPassword))) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const userCredential = isRegistering
        ? await createAccount(email, password)
        : await login(email, password);

      if (isRegistering) {
        await createUserProfile(userCredential.user.uid, {
          fullName,
          email,
          role: "student",
          status: "active",
          createdAt: new Date().toISOString(),
        });
        alert("Account created successfully!");
        navigate("/Student");
        return;
      }

      const userData = await getUserData(userCredential.user.uid);
      console.log(userData);

      alert("Login Successful!");

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
      } else {
        alert("Invalid user role.");
      }
    } catch (error) {
      const authMessages = {
        "auth/invalid-credential": "The email or password is incorrect. Confirm that this account exists in Firebase Authentication.",
        "auth/user-not-found": "No Firebase account was found for this email.",
        "auth/wrong-password": "The password is incorrect.",
        "auth/email-already-in-use": "This email already has a Firebase account. Sign in instead.",
        "auth/weak-password": "Password must contain at least 6 characters.",
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
        <div className="login-mark"><BriefcaseBusiness size={21} /></div>
        <p className="login-overline">LCCI · OJT MONITORING</p>
        <h1>Make every placement count.</h1>
        <p className="login-story-copy">A clearer view of students, partners, attendance, and progress, all in one place.</p>
        <div className="login-story-line"><span /> Built for better coordination</div>
      </div>
      <div className="login-card">
        <p className="login-card-kicker">{isRegistering ? "New student account" : "Welcome back"}</p>
        <h2>{isRegistering ? "Create your account" : "Sign in to your workspace"}</h2>
        <p className="login-card-copy">{isRegistering ? "Register with your LCCI email to get started." : "Use your LCCI account to continue."}</p>

        <form onSubmit={handleLogin}>
          {isRegistering && <div className="input-group">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>}

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

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegistering && <div className="input-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>}

          {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}

          <button type="submit">{isRegistering ? "Create account" : "Continue"} {isRegistering ? <UserPlus size={17} /> : <ArrowRight size={17} />}</button>
        </form>
        <button type="button" className="login-mode-button" onClick={switchMode}>{isRegistering ? "Already have an account? Sign in" : "Need an account? Create one"}</button>
      </div>
    </div>
  );
}

export default Login;
