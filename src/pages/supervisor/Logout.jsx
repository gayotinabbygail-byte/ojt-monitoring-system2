import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

function Logout() {
	const navigate = useNavigate();
	useEffect(() => {
		const signOut = async () => {
			await logout();
			navigate("/", { replace: true });
		};
		signOut();
	}, [navigate]);
	return <div className="supervisor-page supervisor-empty-state"><p>Signing you out...</p></div>;
}

export default Logout;
