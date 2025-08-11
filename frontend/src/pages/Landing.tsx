import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CompactVenueCard from "@/components/venue/CompactVenueCard";
import venueService from "@/services/venue.service";
import { popularSports } from "@/data/sports";
import { ArrowRight, MapPin, Users, Clock, ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Landing = () => {
	const navigate = useNavigate();
	const [trendingVenues, setTrendingVenues] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	useEffect(() => {
		const fetchTrendingVenues = async () => {
			try {
				setIsLoading(true);
				const response = await venueService.getVenues({
					page: 1,
					limit: 12,
					status: "approved",
				});
				setTrendingVenues(response.venues || []);
			} catch (error) {
				console.error("Failed to fetch trending venues:", error);
				toast.error("Failed to load trending venues");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrendingVenues();
	}, []);

	const scrollToIndex = (index: number) => {
		if (carouselRef.current) {
			const cardWidth = 280; // Card width + gap
			carouselRef.current.scrollTo({
				left: index * cardWidth,
				behavior: "smooth",
			});
			setCurrentIndex(index);
		}
	};

	const handleScroll = () => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

			// Update current index based on scroll position
			const cardWidth = 280;
			const newIndex = Math.round(scrollLeft / cardWidth);
			setCurrentIndex(newIndex);
		}
	};

	const handlePrevSlide = () => {
		const newIndex = Math.max(0, currentIndex - 1);
		scrollToIndex(newIndex);
	};

	const handleNextSlide = () => {
		const cardsPerView =
			window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
		const maxIndex = Math.max(0, trendingVenues.length - cardsPerView);
		const newIndex = Math.min(maxIndex, currentIndex + 1);
		scrollToIndex(newIndex);
	};

	const handleSportClick = (sportId: string) => {
		navigate(`/venues?sport=${sportId}`);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Animated Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
					<div className="absolute inset-0">
						{/* Animated circles */}
						<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
						<div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
					</div>
				</div>

				<div className="relative container mx-auto px-4 py-20 lg:py-32">
					<div className="max-w-4xl mx-auto text-center space-y-8">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium">Your Game, Your Court, Your Time</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
							Book Your Perfect
							<span className="block text-gradient-primary mt-2">Sports Venue</span>
						</h1>

						{/* Subtitle */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
							Discover and book sports facilities near you. From cricket pitches to swimming pools, find the perfect
							venue for your game in just a few clicks.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Button
								size="lg"
								className="gradient-primary text-white hover:opacity-90"
								onClick={() => navigate("/venues")}
							>
								Browse Venues
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
							<Button size="lg" variant="outline" onClick={() => navigate("/auth/role-selection")}>
								List Your Venue
								<MapPin className="ml-2 h-5 w-5" />
							</Button>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
							<div className="text-center">
								<p className="text-3xl font-bold text-primary">500+</p>
								<p className="text-sm text-muted-foreground">Active Venues</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold text-primary">10K+</p>
								<p className="text-sm text-muted-foreground">Happy Players</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold text-primary">15+</p>
								<p className="text-sm text-muted-foreground">Sports Available</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Trending Venues Section */}
			<section className="py-16 lg:py-24 bg-muted/30">
				<div className="container mx-auto px-4">
					{/* Section Header */}
					<div className="flex items-center justify-between mb-12">
						<div>
							<h2 className="text-3xl lg:text-4xl font-bold mb-2">Trending Venues</h2>
							<p className="text-muted-foreground">Most popular sports facilities this week</p>
						</div>
						<Button variant="outline" onClick={() => navigate("/venues")} className="hidden sm:flex">
							See All Venues
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>

					{/* Carousel */}
					{isLoading ? (
						<div className="flex gap-4 overflow-hidden">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="w-64 flex-shrink-0">
									<div className="rounded-xl overflow-hidden border border-border/50">
										<Skeleton className="h-40 w-full" />
										<div className="p-3 space-y-2">
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-3 w-1/2" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : trendingVenues.length > 0 ? (
						<div className="relative group">
							{/* Carousel Container */}
							<div className="relative overflow-hidden">
								<div
									ref={carouselRef}
									className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
									onScroll={handleScroll}
									style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
								>
									{trendingVenues.map((venue) => (
										<div key={venue._id} className="w-64 flex-shrink-0 first:ml-0 last:mr-0">
											<CompactVenueCard venue={venue} />
										</div>
									))}
								</div>

								{/* Gradient Edges for visual effect */}
								{canScrollLeft && (
									<div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
								)}
								{canScrollRight && (
									<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
								)}
							</div>

							{/* Navigation Buttons */}
							{canScrollLeft && (
								<button
									onClick={handlePrevSlide}
									className={cn(
										"absolute left-2 top-1/2 -translate-y-1/2 z-20",
										"bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg",
										"hover:bg-background hover:shadow-xl transition-all duration-200",
										"opacity-0 group-hover:opacity-100 focus:opacity-100",
										"border border-border/50 hover:border-primary/20",
									)}
									aria-label="Previous venues"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
							)}
							{canScrollRight && (
								<button
									onClick={handleNextSlide}
									className={cn(
										"absolute right-2 top-1/2 -translate-y-1/2 z-20",
										"bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg",
										"hover:bg-background hover:shadow-xl transition-all duration-200",
										"opacity-0 group-hover:opacity-100 focus:opacity-100",
										"border border-border/50 hover:border-primary/20",
									)}
									aria-label="Next venues"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							)}

							{/* Dots Indicator for mobile */}
							<div className="flex justify-center gap-1.5 mt-6 lg:hidden">
								{Array.from({ length: Math.ceil(trendingVenues.length / 2) }).map((_, index) => (
									<button
										key={index}
										onClick={() => scrollToIndex(index * 2)}
										className={cn(
											"h-1.5 rounded-full transition-all duration-300",
											Math.floor(currentIndex / 2) === index
												? "w-6 bg-primary"
												: "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
										)}
										aria-label={`Go to venue group ${index + 1}`}
									/>
								))}
							</div>
						</div>
					) : (
						<div className="rounded-xl border border-border/50 bg-card p-12">
							<div className="text-center space-y-4">
								<MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
								<h3 className="text-lg font-semibold">No Venues Available</h3>
								<p className="text-muted-foreground">Check back later for trending venues</p>
							</div>
						</div>
					)}

					{/* Mobile CTA */}
					<div className="mt-8 sm:hidden">
						<Button variant="outline" className="w-full" onClick={() => navigate("/venues")}>
							See All Venues
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</section>

			{/* Popular Sports Section */}
			<section className="py-16 lg:py-24">
				<div className="container mx-auto px-4">
					{/* Section Header */}
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold mb-2">Popular Sports</h2>
						<p className="text-muted-foreground">Choose your favorite sport and find the perfect venue</p>
					</div>

					{/* Sports Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
						{popularSports.map((sport) => {
							const Icon = sport.icon;
							return (
								<Card
									key={sport.id}
									className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
									onClick={() => handleSportClick(sport.id)}
								>
									<CardContent className="p-6">
										<div className="flex flex-col items-center text-center space-y-4">
											<div
												className={cn(
													"w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
													sport.bgColor,
												)}
											>
												<Icon className={cn("h-10 w-10", sport.iconColor)} />
											</div>
											<div>
												<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
													{sport.name}
												</h3>
												<p className="text-xs text-muted-foreground mt-1">{sport.description}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 lg:py-24 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl lg:text-4xl font-bold mb-2">Why Choose QuickCourt?</h2>
						<p className="text-muted-foreground">Everything you need for the perfect game</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="text-center">
							<CardContent className="pt-8 pb-6 space-y-4">
								<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
									<Clock className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold">Instant Booking</h3>
								<p className="text-muted-foreground">Book your favorite venues instantly with real-time availability</p>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardContent className="pt-8 pb-6 space-y-4">
								<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
									<Star className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold">Verified Venues</h3>
								<p className="text-muted-foreground">All venues are verified and rated by real players like you</p>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardContent className="pt-8 pb-6 space-y-4">
								<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
									<Users className="h-8 w-8 text-primary" />
								</div>
								<h3 className="text-xl font-semibold">Community Driven</h3>
								<p className="text-muted-foreground">Join thousands of sports enthusiasts in your area</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 lg:py-24">
				<div className="container mx-auto px-4">
					<Card className="gradient-primary text-white overflow-hidden">
						<CardContent className="p-12 text-center space-y-6">
							<h2 className="text-3xl lg:text-4xl font-bold">Ready to Play?</h2>
							<p className="text-lg opacity-90 max-w-2xl mx-auto">
								Join QuickCourt today and never miss a game. Find and book sports venues in seconds.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
								<Button size="lg" variant="secondary" onClick={() => navigate("/auth/role-selection")}>
									Get Started
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="bg-white/10 border-white/20 text-white hover:bg-white/20"
									onClick={() => navigate("/venues")}
								>
									Explore Venues
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
};

export default Landing;
