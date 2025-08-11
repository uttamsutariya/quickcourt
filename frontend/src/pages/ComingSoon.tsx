import { Trophy, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNavigate } from "react-router-dom";
import useLogout from "@/hooks/useLogout";

const ComingSoon = () => {
	const navigate = useNavigate();
	const handleLogout = useLogout();

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
			{/* Theme Toggle in top right */}
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			<div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
				<div className="flex justify-center">
					<div className="relative">
						<div className="p-4 rounded-3xl gradient-primary text-white">
							<Trophy className="h-16 w-16" />
						</div>
						<Construction className="absolute -bottom-2 -right-2 h-8 w-8 text-yellow-500" />
					</div>
				</div>

				<div className="space-y-4">
					<h1 className="text-5xl font-bold text-gradient-primary">QuickCourt</h1>
					<p className="text-2xl text-muted-foreground">Coming Soon</p>
				</div>

				<div className="space-y-2">
					<p className="text-lg text-muted-foreground max-w-md mx-auto">
						We're working hard to bring you the best sports facility booking experience. Our platform will be launching
						soon!
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button onClick={() => navigate("/auth/login")} className="gradient-primary text-white hover:opacity-90">
						Sign In
					</Button>
					<Button onClick={() => navigate("/auth/role-selection")} variant="outline">
						Sign Up
					</Button>
					<Button onClick={handleLogout} variant="ghost">
						Logout
					</Button>
				</div>

				<div className="pt-8 border-t">
					<p className="text-sm text-muted-foreground">© 2024 QuickCourt. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
};

export default ComingSoon;
