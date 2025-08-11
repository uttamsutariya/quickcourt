import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="flex-1 max-w-7xl mx-auto">
				<Outlet />
			</main>
		</div>
	);
};

export default AppLayout;
