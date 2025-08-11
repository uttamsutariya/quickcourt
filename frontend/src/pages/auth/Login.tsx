import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";

const Login = () => {
	const navigate = useNavigate();
	const { signIn } = useAuth();

	const handleLogin = async () => {
		await signIn();
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<div className="p-6">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<button
						onClick={() => navigate("/")}
						className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
						<span>Back</span>
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-md space-y-8">
					{/* Logo */}
					<div className="flex flex-col items-center space-y-2 animate-slide-up">
						<div className="p-3 rounded-2xl gradient-primary text-white">
							<Trophy className="h-10 w-10" />
						</div>
						<h1 className="text-3xl font-bold text-gradient-primary">QuickCourt</h1>
						<p className="text-muted-foreground">Book sports facilities instantly</p>
					</div>

					{/* Login Card */}
					<Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
						<CardHeader className="space-y-1 text-center">
							<CardTitle className="text-2xl">Welcome back</CardTitle>
							<CardDescription>Sign in to access your QuickCourt account</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button
								onClick={handleLogin}
								size="lg"
								className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
							>
								<LogIn className="mr-2 h-5 w-5" />
								Sign In
							</Button>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">New to QuickCourt?</span>
								</div>
							</div>

							<Button onClick={() => navigate("/auth/role-selection")} variant="outline" size="lg" className="w-full">
								<UserPlus className="mr-2 h-5 w-5" />
								Create an Account
							</Button>
						</CardContent>
					</Card>

					{/* Features */}
					<div className="grid grid-cols-3 gap-4 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-primary">500+</div>
							<div className="text-xs text-muted-foreground">Sports Venues</div>
						</div>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-primary">10k+</div>
							<div className="text-xs text-muted-foreground">Active Players</div>
						</div>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-primary">24/7</div>
							<div className="text-xs text-muted-foreground">Booking Available</div>
						</div>
					</div>

					{/* Footer */}
					<div className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
						<p>
							By signing in, you agree to our{" "}
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

export default Login;
