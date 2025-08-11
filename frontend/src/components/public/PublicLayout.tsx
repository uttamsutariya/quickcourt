import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer";

const PublicLayout = () => {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<PublicNavbar />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default PublicLayout;
