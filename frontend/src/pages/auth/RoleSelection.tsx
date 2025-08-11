import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import { USER_ROLES } from "@/config/constants";
import { useAuth } from "@workos-inc/authkit-react";

const RoleSelection = () => {
	const navigate = useNavigate();
	const { setSelectedRole } = useAuthStore();
	const { signUp } = useAuth();

	const handleRoleSelection = async (role: typeof USER_ROLES.USER | typeof USER_ROLES.FACILITY_OWNER) => {
		// Store selected role in Zustand store
		setSelectedRole(role);

		// Redirect to WorkOS signup
		await signUp();
	};

	const roles = [
		{
			id: USER_ROLES.USER,
			title: "Sports Enthusiast",
			icon: User,
			description: "Book courts and play sports at venues near you",
			features: [
				"Browse and book sports facilities",
				"View real-time availability",
				"Manage your bookings",
				"Cancel bookings easily",
				"Discover new venues",
			],
			gradient: "gradient-primary",
			buttonText: "Sign up as Player",
		},
		{
			id: USER_ROLES.FACILITY_OWNER,
			title: "Facility Owner",
			icon: Building2,
			description: "List your sports facilities and manage bookings",
			features: [
				"Add multiple venues",
				"Manage courts and pricing",
				"Set custom time slots",
				"Track bookings and revenue",
				"Handle maintenance schedules",
			],
			gradient: "gradient-secondary",
			buttonText: "Sign up as Owner",
		},
	];

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<div className="p-6">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Trophy className="h-8 w-8 text-primary" />
						<span className="text-2xl font-bold text-gradient-primary">QuickCourt</span>
					</div>
					<Button variant="ghost" onClick={() => navigate("/auth/login")}>
						Already have an account? Sign in
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-5xl">
					<div className="text-center mb-12 animate-slide-up">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Role</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Select how you want to use QuickCourt. You can always switch between roles later.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
						{roles.map((role, index) => (
							<Card
								key={role.id}
								className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer group"
								onClick={() =>
									handleRoleSelection(role.id as typeof USER_ROLES.USER | typeof USER_ROLES.FACILITY_OWNER)
								}
								style={{ animationDelay: `${0.3 + index * 0.1}s` }}
							>
								<div className={`absolute inset-0 opacity-5 ${role.gradient}`} />

								<CardHeader className="relative">
									<div className="flex items-start justify-between mb-4">
										<div className={`p-3 rounded-xl ${role.gradient} text-white`}>
											<role.icon className="h-6 w-6" />
										</div>
										{role.id === USER_ROLES.FACILITY_OWNER && <Badge variant="secondary">Business</Badge>}
									</div>

									<CardTitle className="text-2xl mb-2">{role.title}</CardTitle>
									<CardDescription className="text-base">{role.description}</CardDescription>
								</CardHeader>

								<CardContent className="relative space-y-6">
									<div className="space-y-3">
										{role.features.map((feature, idx) => (
											<div key={idx} className="flex items-start space-x-3">
												<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
												<span className="text-sm text-muted-foreground">{feature}</span>
											</div>
										))}
									</div>

									<Button
										className={`w-full ${role.gradient} text-white hover:opacity-90 transition-opacity group-hover:scale-[1.02] transition-transform`}
										size="lg"
									>
										<span>{role.buttonText}</span>
										<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
									</Button>
								</CardContent>
							</Card>
						))}
					</div>

					<div
						className="mt-12 text-center text-sm text-muted-foreground animate-fade-in"
						style={{ animationDelay: "0.5s" }}
					>
						<p>
							By signing up, you agree to our{" "}
							<a href="#" className="text-primary hover:underline">
								Terms of Service
							</a>{" "}
							and{" "}
							<a href="#" className="text-primary hover:underline">
								Privacy Policy
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RoleSelection;
