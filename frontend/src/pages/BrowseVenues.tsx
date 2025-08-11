import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CompactVenueCard from "@/components/venue/CompactVenueCard";
import { venueService } from "@/services/venue.service";
import { toast } from "sonner";
import { Search, Filter, MapPin, IndianRupee, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { popularSports } from "@/data/sports";

interface Filters {
	searchTerm: string;
	sports: string[];
	venueType: "all" | "indoor" | "outdoor" | "both";
	minPrice: number;
	maxPrice: number;
}

const BrowseVenues = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [venues, setVenues] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalPages, setTotalPages] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	// Initialize filters from URL params
	const [filters, setFilters] = useState<Filters>(() => {
		const sportParam = searchParams.get("sport");
		return {
			searchTerm: searchParams.get("search") || "",
			sports: sportParam ? [sportParam] : [],
			venueType: (searchParams.get("type") as "all" | "indoor" | "outdoor") || "all",
			minPrice: parseInt(searchParams.get("minPrice") || "0"),
			maxPrice: parseInt(searchParams.get("maxPrice") || "5000"),
		};
	});

	const [tempFilters, setTempFilters] = useState<Filters>(filters);

	// Fetch venues based on filters and page
	useEffect(() => {
		const fetchVenues = async () => {
			try {
				setIsLoading(true);

				// Build query params
				const params: any = {
					page: currentPage,
					limit: 8,
					status: "approved",
				};

				if (filters.searchTerm) {
					params.search = filters.searchTerm;
				}

				if (filters.sports.length > 0) {
					params.sports = filters.sports.join(",");
				}

				if (filters.venueType !== "all") {
					params.venueType = filters.venueType;
				}

				if (filters.minPrice > 0) {
					params.minPrice = filters.minPrice;
				}

				if (filters.maxPrice < 5000) {
					params.maxPrice = filters.maxPrice;
				}

				const response = await venueService.getVenues(params);
				setVenues(response.venues || []);
				setTotalPages(response.totalPages || 1);
			} catch (error) {
				console.error("Failed to fetch venues:", error);
				toast.error("Failed to load venues");
			} finally {
				setIsLoading(false);
			}
		};

		fetchVenues();
	}, [filters, currentPage]);

	// Update URL params when filters change
	useEffect(() => {
		const params = new URLSearchParams();

		if (filters.searchTerm) params.set("search", filters.searchTerm);
		if (filters.sports.length > 0) params.set("sport", filters.sports[0]);
		if (filters.venueType !== "all") params.set("type", filters.venueType);
		if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString());
		if (filters.maxPrice < 5000) params.set("maxPrice", filters.maxPrice.toString());
		if (currentPage > 1) params.set("page", currentPage.toString());

		setSearchParams(params);
	}, [filters, currentPage, setSearchParams]);

	const handleApplyFilters = () => {
		setFilters(tempFilters);
		setCurrentPage(1);
		setShowMobileFilters(false);
	};

	const handleClearFilters = () => {
		const clearedFilters: Filters = {
			searchTerm: "",
			sports: [],
			venueType: "all",
			minPrice: 0,
			maxPrice: 5000,
		};
		setTempFilters(clearedFilters);
		setFilters(clearedFilters);
		setCurrentPage(1);
	};

	const handleSportToggle = (sport: string) => {
		setTempFilters((prev) => ({
			...prev,
			sports: prev.sports.includes(sport) ? prev.sports.filter((s) => s !== sport) : [...prev.sports, sport],
		}));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Calculate if filters are active
	const hasActiveFilters = useMemo(() => {
		return (
			filters.searchTerm !== "" ||
			filters.sports.length > 0 ||
			filters.venueType !== "all" ||
			filters.minPrice > 0 ||
			filters.maxPrice < 5000
		);
	}, [filters]);

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 py-12 lg:py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center space-y-4">
						<h1 className="text-3xl lg:text-5xl font-bold">Discover and Book Nearby Venues</h1>
						<p className="text-lg text-muted-foreground">Find the perfect sports facility for your next game</p>

						{/* Search Bar */}
						<div className="relative max-w-xl mx-auto mt-8">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search venues by name..."
								className="pl-10 pr-4 h-12 text-base"
								value={tempFilters.searchTerm}
								onChange={(e) => setTempFilters({ ...tempFilters, searchTerm: e.target.value })}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleApplyFilters();
									}
								}}
							/>
							<Button onClick={handleApplyFilters} className="absolute right-1 top-1/2 -translate-y-1/2" size="sm">
								Search
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-8 lg:py-12">
				<div className="container mx-auto px-4">
					<div className="flex gap-8">
						{/* Desktop Filters Sidebar */}
						<aside className="hidden lg:block w-80 flex-shrink-0">
							<Card className="sticky top-4">
								<CardHeader>
									<CardTitle className="flex items-center justify-between">
										<span className="flex items-center gap-2">
											<Filter className="h-5 w-5" />
											Filters
										</span>
										{hasActiveFilters && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleClearFilters}
												className="text-muted-foreground hover:text-foreground"
											>
												Clear all
											</Button>
										)}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Sport Type Filter */}
									<div className="space-y-3">
										<Label>Sport Type</Label>
										<div className="flex flex-wrap gap-2">
											{popularSports.map((sport) => (
												<Badge
													key={sport.id}
													variant={tempFilters.sports.includes(sport.id) ? "default" : "outline"}
													className="cursor-pointer transition-colors"
													onClick={() => handleSportToggle(sport.id)}
												>
													{sport.name}
													{tempFilters.sports.includes(sport.id) && <X className="ml-1 h-3 w-3" />}
												</Badge>
											))}
										</div>
									</div>

									{/* Venue Type Filter */}
									<div className="space-y-3">
										<Label>Venue Type</Label>
										<RadioGroup
											value={tempFilters.venueType}
											onValueChange={(value) => setTempFilters({ ...tempFilters, venueType: value as any })}
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="all" id="all" />
												<Label htmlFor="all" className="font-normal cursor-pointer">
													All Venues
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="indoor" id="indoor" />
												<Label htmlFor="indoor" className="font-normal cursor-pointer">
													Indoor
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="outdoor" id="outdoor" />
												<Label htmlFor="outdoor" className="font-normal cursor-pointer">
													Outdoor
												</Label>
											</div>
										</RadioGroup>
									</div>

									{/* Price Range Filter */}
									<div className="space-y-3">
										<Label>Price Range (per hour)</Label>
										<div className="flex items-center gap-2">
											<div className="flex-1">
												<div className="flex items-center gap-1">
													<IndianRupee className="h-4 w-4 text-muted-foreground" />
													<Input
														type="number"
														placeholder="Min"
														value={tempFilters.minPrice}
														onChange={(e) =>
															setTempFilters({
																...tempFilters,
																minPrice: parseInt(e.target.value) || 0,
															})
														}
														min="0"
														max="5000"
													/>
												</div>
											</div>
											<span className="text-muted-foreground">-</span>
											<div className="flex-1">
												<div className="flex items-center gap-1">
													<IndianRupee className="h-4 w-4 text-muted-foreground" />
													<Input
														type="number"
														placeholder="Max"
														value={tempFilters.maxPrice}
														onChange={(e) =>
															setTempFilters({
																...tempFilters,
																maxPrice: parseInt(e.target.value) || 5000,
															})
														}
														min="0"
														max="5000"
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Apply Filters Button */}
									<Button onClick={handleApplyFilters} className="w-full">
										Apply Filters
									</Button>
								</CardContent>
							</Card>
						</aside>

						{/* Main Content Area */}
						<div className="flex-1">
							{/* Mobile Filter Button and Active Filters */}
							<div className="lg:hidden mb-6">
								<Button
									variant="outline"
									className="w-full justify-center gap-2"
									onClick={() => setShowMobileFilters(true)}
								>
									<SlidersHorizontal className="h-4 w-4" />
									Filters
									{hasActiveFilters && (
										<Badge variant="secondary" className="ml-2">
											Active
										</Badge>
									)}
								</Button>
							</div>

							{/* Results Header */}
							<div className="flex items-center justify-between mb-6">
								<div>
									<p className="text-sm text-muted-foreground">
										Showing {venues.length} venues
										{hasActiveFilters && " (filtered)"}
									</p>
								</div>
								{hasActiveFilters && (
									<div className="hidden lg:flex items-center gap-2">
										<span className="text-sm text-muted-foreground">Active filters:</span>
										<div className="flex gap-1">
											{filters.sports.map((sport) => (
												<Badge key={sport} variant="secondary">
													{sport}
												</Badge>
											))}
											{filters.venueType !== "all" && <Badge variant="secondary">{filters.venueType}</Badge>}
										</div>
									</div>
								)}
							</div>

							{/* Venues Grid */}
							{isLoading ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
									{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
										<div key={i} className="rounded-xl overflow-hidden border border-border/50">
											<Skeleton className="h-40 w-full" />
											<div className="p-3 space-y-2">
												<Skeleton className="h-5 w-3/4" />
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-3 w-1/2" />
											</div>
										</div>
									))}
								</div>
							) : venues.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
									{venues.map((venue) => (
										<CompactVenueCard key={venue._id} venue={venue} />
									))}
								</div>
							) : (
								<Card className="p-12">
									<div className="text-center space-y-4">
										<MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
										<h3 className="text-lg font-semibold">No venues found</h3>
										<p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
										<Button variant="outline" onClick={handleClearFilters}>
											Clear Filters
										</Button>
									</div>
								</Card>
							)}

							{/* Pagination */}
							{!isLoading && venues.length > 0 && totalPages > 1 && (
								<div className="flex items-center justify-center gap-2 mt-8">
									<Button
										variant="outline"
										size="icon"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>

									{/* Page Numbers */}
									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter((page) => {
												if (totalPages <= 7) return true;
												if (page === 1 || page === totalPages) return true;
												if (Math.abs(page - currentPage) <= 1) return true;
												return false;
											})
											.map((page, index, array) => (
												<div key={page} className="flex items-center">
													{index > 0 && array[index - 1] !== page - 1 && (
														<span className="px-2 text-muted-foreground">...</span>
													)}
													<Button
														variant={currentPage === page ? "default" : "outline"}
														size="icon"
														onClick={() => handlePageChange(page)}
													>
														{page}
													</Button>
												</div>
											))}
									</div>

									<Button
										variant="outline"
										size="icon"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Mobile Filters Modal */}
			{showMobileFilters && (
				<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
					<div className="fixed inset-x-0 bottom-0 z-50 bg-background border-t">
						<div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Filters</h2>
								<Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
									<X className="h-5 w-5" />
								</Button>
							</div>

							{/* Sport Type Filter */}
							<div className="space-y-3">
								<Label>Sport Type</Label>
								<div className="flex flex-wrap gap-2">
									{popularSports.map((sport) => (
										<Badge
											key={sport.id}
											variant={tempFilters.sports.includes(sport.id) ? "default" : "outline"}
											className="cursor-pointer transition-colors"
											onClick={() => handleSportToggle(sport.id)}
										>
											{sport.name}
											{tempFilters.sports.includes(sport.id) && <X className="ml-1 h-3 w-3" />}
										</Badge>
									))}
								</div>
							</div>

							{/* Venue Type Filter */}
							<div className="space-y-3">
								<Label>Venue Type</Label>
								<RadioGroup
									value={tempFilters.venueType}
									onValueChange={(value) => setTempFilters({ ...tempFilters, venueType: value as any })}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="all" id="mobile-all" />
										<Label htmlFor="mobile-all" className="font-normal">
											All Venues
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="indoor" id="mobile-indoor" />
										<Label htmlFor="mobile-indoor" className="font-normal">
											Indoor
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="outdoor" id="mobile-outdoor" />
										<Label htmlFor="mobile-outdoor" className="font-normal">
											Outdoor
										</Label>
									</div>
								</RadioGroup>
							</div>

							{/* Price Range Filter */}
							<div className="space-y-3">
								<Label>Price Range (per hour)</Label>
								<div className="flex items-center gap-2">
									<div className="flex-1">
										<div className="flex items-center gap-1">
											<IndianRupee className="h-4 w-4 text-muted-foreground" />
											<Input
												type="number"
												placeholder="Min"
												value={tempFilters.minPrice}
												onChange={(e) =>
													setTempFilters({
														...tempFilters,
														minPrice: parseInt(e.target.value) || 0,
													})
												}
												min="0"
												max="5000"
											/>
										</div>
									</div>
									<span className="text-muted-foreground">-</span>
									<div className="flex-1">
										<div className="flex items-center gap-1">
											<IndianRupee className="h-4 w-4 text-muted-foreground" />
											<Input
												type="number"
												placeholder="Max"
												value={tempFilters.maxPrice}
												onChange={(e) =>
													setTempFilters({
														...tempFilters,
														maxPrice: parseInt(e.target.value) || 5000,
													})
												}
												min="0"
												max="5000"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button variant="outline" className="flex-1" onClick={handleClearFilters}>
									Clear All
								</Button>
								<Button className="flex-1" onClick={handleApplyFilters}>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BrowseVenues;
