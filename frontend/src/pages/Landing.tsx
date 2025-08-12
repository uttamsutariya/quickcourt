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
	const [isHovering, setIsHovering] = useState(false);
	const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

	// Auto-scroll effect for trending venues
	useEffect(() => {
		if (!isLoading && trendingVenues.length > 0 && !isHovering) {
			autoScrollIntervalRef.current = setInterval(() => {
				const cardsPerView =
					window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
				const maxIndex = Math.max(0, trendingVenues.length - cardsPerView);

				setCurrentIndex((prevIndex) => {
					const nextIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
					scrollToIndex(nextIndex);
					return nextIndex;
				});
			}, 3000); // Scroll every 3 seconds
		}

		return () => {
			if (autoScrollIntervalRef.current) {
				clearInterval(autoScrollIntervalRef.current);
				autoScrollIntervalRef.current = null;
			}
		};
	}, [isLoading, trendingVenues.length, isHovering]);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (autoScrollIntervalRef.current) {
				clearInterval(autoScrollIntervalRef.current);
			}
		};
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

	const [sportsCurrentIndex, setSportsCurrentIndex] = useState(0);
	const sportsCarouselRef = useRef<HTMLDivElement>(null);
	const [canScrollSportsLeft, setCanScrollSportsLeft] = useState(false);
	const [canScrollSportsRight, setCanScrollSportsRight] = useState(true);
	const [isSportsHovering, setIsSportsHovering] = useState(false);
	const sportsAutoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleSportClick = (sportId: string) => {
		navigate(`/venues?sport=${sportId}`);
	};

	const scrollSportsToIndex = (index: number) => {
		if (sportsCarouselRef.current) {
			const cardWidth = 280; // Card width + gap
			sportsCarouselRef.current.scrollTo({
				left: index * cardWidth,
				behavior: "smooth",
			});
			setSportsCurrentIndex(index);
		}
	};

	const handleSportsScroll = () => {
		if (sportsCarouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = sportsCarouselRef.current;
			setCanScrollSportsLeft(scrollLeft > 0);
			setCanScrollSportsRight(scrollLeft < scrollWidth - clientWidth - 10);

			// Update current index based on scroll position
			const cardWidth = 280;
			const newIndex = Math.round(scrollLeft / cardWidth);
			setSportsCurrentIndex(newIndex);
		}
	};

	const handleSportsPrevSlide = () => {
		const newIndex = Math.max(0, sportsCurrentIndex - 1);
		scrollSportsToIndex(newIndex);
	};

	const handleSportsNextSlide = () => {
		const cardsPerView =
			window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
		const maxIndex = Math.max(0, popularSports.length - cardsPerView);
		const newIndex = Math.min(maxIndex, sportsCurrentIndex + 1);
		scrollSportsToIndex(newIndex);
	};

	// Auto-scroll effect for sports carousel
	useEffect(() => {
		if (!isSportsHovering && popularSports.length > 0) {
			sportsAutoScrollIntervalRef.current = setInterval(() => {
				const cardsPerView =
					window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
				const maxIndex = Math.max(0, popularSports.length - cardsPerView);

				setSportsCurrentIndex((prevIndex) => {
					const nextIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
					scrollSportsToIndex(nextIndex);
					return nextIndex;
				});
			}, 4000); // Scroll every 4 seconds (slightly different from venues)
		}

		return () => {
			if (sportsAutoScrollIntervalRef.current) {
				clearInterval(sportsAutoScrollIntervalRef.current);
				sportsAutoScrollIntervalRef.current = null;
			}
		};
	}, [isSportsHovering, popularSports.length]);

	// Cleanup sports interval on unmount
	useEffect(() => {
		return () => {
			if (sportsAutoScrollIntervalRef.current) {
				clearInterval(sportsAutoScrollIntervalRef.current);
			}
		};
	}, []);

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
						<div
							className="relative group"
							onMouseEnter={() => setIsHovering(true)}
							onMouseLeave={() => setIsHovering(false)}
						>
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
					<div className="flex items-center justify-between mb-12">
						<div>
							<h2 className="text-3xl lg:text-4xl font-bold mb-2">Popular Sports</h2>
							<p className="text-muted-foreground">Choose your favorite sport and find the perfect venue</p>
						</div>
						<Button variant="outline" onClick={() => navigate("/venues")} className="hidden sm:flex">
							Browse All Sports
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>

					{/* Sports Carousel */}
					<div
						className="relative group"
						onMouseEnter={() => setIsSportsHovering(true)}
						onMouseLeave={() => setIsSportsHovering(false)}
					>
						{/* Carousel Container */}
						<div className="relative overflow-hidden">
							<div
								ref={sportsCarouselRef}
								className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
								onScroll={handleSportsScroll}
								style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
							>
								{popularSports.map((sport) => (
									<div
										key={sport.id}
										className="w-64 h-40 flex-shrink-0 first:ml-0 last:mr-0 cursor-pointer group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative rounded-xl"
										onClick={() => handleSportClick(sport.id)}
									>
										{/* Sport Image - covers the entire div */}
										<img
											src={sport.image}
											alt={sport.name}
											className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
											style={{
												objectFit: "cover",
												objectPosition: "center",
											}}
											loading="lazy"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.src = "/assets/cricket.jpg"; // Fallback image
											}}
										/>

										{/* Dark Overlay */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/50 transition-all duration-300" />

										{/* Sport Name Overlay */}
										<div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
											<h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">{sport.name}</h3>
											<p className="text-white/90 text-xs line-clamp-2 drop-shadow-md">{sport.description}</p>
										</div>

										{/* Hover Indicator */}
										<div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
											<ArrowRight className="h-4 w-4 text-white" />
										</div>
									</div>
								))}
							</div>

							{/* Gradient Edges for visual effect */}
							{canScrollSportsLeft && (
								<div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
							)}
							{canScrollSportsRight && (
								<div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
							)}
						</div>

						{/* Navigation Buttons */}
						{canScrollSportsLeft && (
							<button
								onClick={handleSportsPrevSlide}
								className={cn(
									"absolute left-2 top-1/2 -translate-y-1/2 z-20",
									"bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg",
									"hover:bg-background hover:shadow-xl transition-all duration-200",
									"opacity-0 group-hover:opacity-100 focus:opacity-100",
									"border border-border/50 hover:border-primary/20",
								)}
								aria-label="Previous sports"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
						)}
						{canScrollSportsRight && (
							<button
								onClick={handleSportsNextSlide}
								className={cn(
									"absolute right-2 top-1/2 -translate-y-1/2 z-20",
									"bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg",
									"hover:bg-background hover:shadow-xl transition-all duration-200",
									"opacity-0 group-hover:opacity-100 focus:opacity-100",
									"border border-border/50 hover:border-primary/20",
								)}
								aria-label="Next sports"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						)}

						{/* Dots Indicator for mobile */}
						<div className="flex justify-center gap-1.5 mt-6 lg:hidden">
							{Array.from({ length: Math.ceil(popularSports.length / 2) }).map((_, index) => (
								<button
									key={index}
									onClick={() => scrollSportsToIndex(index * 2)}
									className={cn(
										"h-1.5 rounded-full transition-all duration-300",
										Math.floor(sportsCurrentIndex / 2) === index
											? "w-6 bg-primary"
											: "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
									)}
									aria-label={`Go to sport group ${index + 1}`}
								/>
							))}
						</div>
					</div>

					{/* Mobile CTA */}
					<div className="mt-8 sm:hidden">
						<Button variant="outline" className="w-full" onClick={() => navigate("/venues")}>
							Browse All Sports
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
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
			<section className="py-16 lg:py-24 relative overflow-hidden">
				<div className="container mx-auto px-4 relative z-10">
					<div className="relative">
						{/* Card with gradient background */}
						<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60 dark:from-primary dark:via-primary/90 dark:to-secondary shadow-2xl">
							{/* Animated Background Elements */}
							<div className="absolute inset-0 overflow-hidden">
								{/* Animated Gradient Orbs */}
								<div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 dark:bg-white/10 rounded-full blur-3xl animate-pulse" />
								<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/30 dark:bg-secondary/30 rounded-full blur-3xl animate-pulse delay-700" />
								<div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/15 dark:bg-white/5 rounded-full blur-2xl animate-pulse delay-300" />

								{/* Moving Gradient Blobs */}
								<div className="absolute inset-0">
									<div className="absolute top-10 left-20 w-64 h-64 bg-gradient-to-br from-white/30 dark:from-white/10 to-transparent rounded-full blur-2xl animate-blob" />
									<div className="absolute bottom-10 right-20 w-72 h-72 bg-gradient-to-tr from-white/25 dark:from-secondary/20 to-transparent rounded-full blur-2xl animate-blob animation-delay-2000" />
									<div className="absolute top-1/3 right-1/3 w-56 h-56 bg-gradient-to-bl from-white/20 dark:from-white/10 to-transparent rounded-full blur-xl animate-blob animation-delay-4000" />
								</div>

								{/* Subtle Grid Pattern */}
								<div
									className="absolute inset-0 opacity-20 dark:opacity-10"
									style={{
										backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
										backgroundSize: "50px 50px",
									}}
								/>

								{/* Radial Gradient Overlay */}
								<div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10 dark:to-black/20" />
							</div>

							{/* Content */}
							<CardContent className="relative p-12 lg:p-16 text-center space-y-8 z-10">
								{/* Badge */}
								<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20">
									<Sparkles className="h-4 w-4 text-white animate-pulse" />
									<span className="text-sm font-medium text-white">Join thousands of players</span>
								</div>

								{/* Main Heading with Gradient Text Effect */}
								<div className="space-y-2">
									<h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white">Ready to Play?</h2>
									<div className="h-1 w-24 mx-auto bg-gradient-to-r from-white/0 via-white/50 to-white/0" />
								</div>

								{/* Description */}
								<p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
									Join QuickCourt today and never miss a game. Find and book sports venues in seconds.
								</p>

								{/* CTA Buttons */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
									<Button
										size="lg"
										className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
										onClick={() => navigate("/auth/role-selection")}
									>
										<Sparkles className="mr-2 h-5 w-5" />
										Get Started Now
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 shadow-lg transition-all duration-300 hover:scale-105"
										onClick={() => navigate("/venues")}
									>
										Explore Venues
										<MapPin className="ml-2 h-5 w-5" />
									</Button>
								</div>

								{/* Trust Indicators */}
								<div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-white/80">
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										<span className="text-sm">10,000+ Active Users</span>
									</div>
									<div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full" />
									<div className="flex items-center gap-2">
										<Star className="h-5 w-5" />
										<span className="text-sm">4.8/5 Average Rating</span>
									</div>
									<div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full" />
									<div className="flex items-center gap-2">
										<Clock className="h-5 w-5" />
										<span className="text-sm">Instant Booking</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Decorative Elements Outside Card */}
						<div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/30 dark:bg-primary/20 rounded-full blur-2xl" />
						<div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/25 dark:bg-secondary/20 rounded-full blur-2xl" />
					</div>
				</div>

				{/* Background Decorative Elements */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl" />
					<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 dark:bg-secondary/5 rounded-full blur-3xl" />
				</div>
			</section>
		</div>
	);
};

export default Landing;
