import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const { signIn, user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			signIn();
		} else {
			navigate("/");
		}
	}, [user, signIn, navigate]);

	return null;
}
