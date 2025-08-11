import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import { USER_ROLES } from "@/config/constants";
import { useAuth } from "@workos-inc/authkit-react";
import { cn } from "@/lib/utils";
import PublicNavbar from "@/components/public/PublicNavbar";
import Footer from "@/components/public/Footer";

const RoleSelection = () => {
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
			bgGradient:
				"from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent",
			iconBg: "bg-primary/10 dark:bg-primary/20",
			iconColor: "text-primary",
			buttonClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
			borderHover: "hover:border-primary/50 dark:hover:border-primary/40",
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
			bgGradient:
				"from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/10 dark:to-transparent",
			iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
			iconColor: "text-blue-600 dark:text-blue-500",
			buttonClass: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
			borderHover: "hover:border-blue-500/50 dark:hover:border-blue-500/40",
			buttonText: "Sign up as Owner",
		},
	];

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Navbar */}
			<PublicNavbar />

			{/* Main Content with Background */}
			<main className="flex-1 relative overflow-hidden">
				{/* Background Decorative Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 dark:bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
				</div>

				{/* Content */}
				<div className="flex items-center justify-center p-6 relative z-10 py-12 lg:py-20">
					<div className="w-full max-w-5xl">
						{/* Header Section */}
						<div className="text-center mb-12 animate-slide-up">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 mb-6">
								<Sparkles className="h-4 w-4 text-primary animate-pulse" />
								<span className="text-sm font-medium">Get started in seconds</span>
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Role</h1>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Select how you want to use QuickCourt. You can always switch between roles later.
							</p>
						</div>

						{/* Role Cards */}
						<div className="grid md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
							{roles.map((role, index) => (
								<Card
									key={role.id}
									className={cn(
										"relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer group",
										"border-border/50 hover:border-border hover:-translate-y-1",

										role.borderHover,
									)}
									onClick={() =>
										handleRoleSelection(role.id as typeof USER_ROLES.USER | typeof USER_ROLES.FACILITY_OWNER)
									}
									style={{ animationDelay: `${0.3 + index * 0.1}s` }}
								>
									{/* Gradient Background */}
									<div className={cn("absolute inset-0 bg-gradient-to-br", role.bgGradient)} />

									<CardHeader className="relative">
										<div className="flex items-start justify-between mb-4">
											<div className={cn("p-3 rounded-xl backdrop-blur-sm", role.iconBg)}>
												<role.icon className={cn("h-6 w-6", role.iconColor)} />
											</div>
											{role.id === USER_ROLES.FACILITY_OWNER && (
												<Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
													Business
												</Badge>
											)}
										</div>

										<CardTitle className="text-2xl mb-2">{role.title}</CardTitle>
										<CardDescription className="text-base">{role.description}</CardDescription>
									</CardHeader>

									<CardContent className="relative space-y-6">
										<div className="space-y-3">
											{role.features.map((feature, idx) => (
												<div key={idx} className="flex items-start space-x-3">
													<div className={cn("mt-0.5 flex-shrink-0 rounded-full p-0.5", role.iconBg)}>
														<CheckCircle className={cn("h-4 w-4", role.iconColor)} />
													</div>
													<span className="text-sm text-muted-foreground">{feature}</span>
												</div>
											))}
										</div>

										<Button
											className={cn(
												"w-full shadow-lg transition-all duration-300",
												"group-hover:scale-[1.02] group-hover:shadow-xl",
												role.buttonClass,
											)}
											size="lg"
										>
											<span>{role.buttonText}</span>
											<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
										</Button>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Footer */}
						<div
							className="mt-12 text-center text-sm text-muted-foreground animate-fade-in"
							style={{ animationDelay: "0.5s" }}
						>
							<p>
								By signing up, you agree to our{" "}
								<button
									className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									Terms of Service
								</button>{" "}
								and{" "}
								<button
									className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
									onClick={(e) => e.stopPropagation()}
								>
									Privacy Policy
								</button>
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default RoleSelection;
