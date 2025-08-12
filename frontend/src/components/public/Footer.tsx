import { Link } from "react-router-dom";
import { Trophy, Mail, Phone, MapPin, Heart } from "lucide-react";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-muted/50 border-t mt-auto">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-lg gradient-primary text-white">
								<Trophy className="h-5 w-5" />
							</div>
							<span className="text-xl font-bold">QuickCourt</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Your ultimate platform for booking sports venues. Play more, worry less.
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-semibold">Quick Links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link to="/venues" className="text-muted-foreground hover:text-primary transition-colors">
									Browse Venues
								</Link>
							</li>
							<li>
								<Link to="/auth/role-selection" className="text-muted-foreground hover:text-primary transition-colors">
									List Your Venue
								</Link>
							</li>
						</ul>
					</div>

					{/* Support */}
					<div className="space-y-4">
						<h3 className="font-semibold">Support</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
									Help Center
								</a>
							</li>
							<li>
								<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
									Terms of Service
								</a>
							</li>
							<li>
								<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
									Privacy Policy
								</a>
							</li>
							<li>
								<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
									Contact Us
								</a>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h3 className="font-semibold">Get in Touch</h3>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center gap-2 text-muted-foreground">
								<Mail className="h-4 w-4" />
								<span>uttamsutariya.dev@gmail.com</span>
							</li>
							<li className="flex items-center gap-2 text-muted-foreground">
								<Phone className="h-4 w-4" />
								<span>+91 96647 24887</span>
							</li>
							<li className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>Ahmedabad, India</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t mt-8 pt-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground text-center md:text-left">
							© {currentYear} QuickCourt. All rights reserved.
						</p>
						<p className="text-sm text-muted-foreground flex items-center gap-1">
							Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in India
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
