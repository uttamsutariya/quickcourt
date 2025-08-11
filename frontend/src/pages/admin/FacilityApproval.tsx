import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ChevronLeft,
	Eye,
	CheckCircle,
	XCircle,
	MapPin,
	Building2,
	Loader2,
	Search,
	ChevronRight,
	Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatSportLabel } from "@/utils/sport-formatter";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import type { Venue } from "@/services/venue.service";

interface AdminVenue extends Venue {
	ownerName?: string;
	ownerEmail?: string;
}

const ITEMS_PER_PAGE = 6;

const FacilityApproval = () => {
	const navigate = useNavigate();
	const [venues, setVenues] = useState<AdminVenue[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	// Filters
	const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
	const [searchTerm, setSearchTerm] = useState("");
	const [cityFilter, setCityFilter] = useState("");
	const [stateFilter, setStateFilter] = useState("");

	// Dialog states
	const [actionDialog, setActionDialog] = useState<{
		open: boolean;
		type: "approve" | "reject" | null;
		venue: AdminVenue | null;
	}>({
		open: false,
		type: null,
		venue: null,
	});
	const [actionLoading, setActionLoading] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	useEffect(() => {
		fetchVenues();
	}, [statusFilter]);

	const fetchVenues = async () => {
		try {
			setLoading(true);
			const response = await apiClient.get("/admin/venues", {
				params: { status: statusFilter === "all" ? undefined : statusFilter },
			});
			setVenues(response.data.venues);
		} catch (error: any) {
			console.error("Failed to fetch venues:", error);
			toast.error("Failed to load venues");
			// Set mock data for testing
			setVenues([]);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (venue: AdminVenue) => {
		setActionLoading(true);
		try {
			await apiClient.put(`/admin/venues/${venue._id}/approve`);
			toast.success(`${venue.name} has been approved successfully`);
			setActionDialog({ open: false, type: null, venue: null });
			fetchVenues();
		} catch (error: any) {
			console.error("Failed to approve venue:", error);
			toast.error(error.response?.data?.message || "Failed to approve venue");
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async (venue: AdminVenue) => {
		if (!rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		setActionLoading(true);
		try {
			await apiClient.put(`/admin/venues/${venue._id}/reject`, {
				reason: rejectionReason,
			});
			toast.success(`${venue.name} has been rejected`);
			setActionDialog({ open: false, type: null, venue: null });
			setRejectionReason("");
			fetchVenues();
		} catch (error: any) {
			console.error("Failed to reject venue:", error);
			toast.error(error.response?.data?.message || "Failed to reject venue");
		} finally {
			setActionLoading(false);
		}
	};

	// Filter venues based on all filters
	const filteredVenues = venues.filter((venue) => {
		const matchesSearch =
			venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			venue.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCity = !cityFilter || venue.address.city.toLowerCase().includes(cityFilter.toLowerCase());
		const matchesState = !stateFilter || venue.address.state.toLowerCase().includes(stateFilter.toLowerCase());

		return matchesSearch && matchesCity && matchesState;
	});

	// Pagination
	const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
	const paginatedVenues = filteredVenues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const getStatusStyles = (status?: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-500 text-white border-yellow-600";
			case "approved":
				return "bg-green-500 text-white border-green-600";
			case "rejected":
				return "bg-red-500 text-white border-red-600";
			default:
				return "";
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="mb-6">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64 mt-2" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="bg-card border rounded-lg p-4">
							<Skeleton className="h-40 w-full mb-4" />
							<Skeleton className="h-6 w-3/4 mb-2" />
							<Skeleton className="h-4 w-1/2 mb-3" />
							<Skeleton className="h-10 w-full" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-4">
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold">Venue Management</h1>
						<p className="text-muted-foreground mt-2">Review and manage venue registrations</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{filteredVenues.length} venue{filteredVenues.length !== 1 ? "s" : ""}
						</span>
					</div>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-card border rounded-lg p-4 mb-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					{/* Search */}
					<div className="relative lg:col-span-2">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or description..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Status Filter */}
					<Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
						<SelectTrigger>
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>

					{/* City Filter */}
					<Input placeholder="Filter by city..." value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />

					{/* State Filter */}
					<Input
						placeholder="Filter by state..."
						value={stateFilter}
						onChange={(e) => setStateFilter(e.target.value)}
					/>
				</div>

				{/* Active Filters Display */}
				{(searchTerm || cityFilter || stateFilter || statusFilter !== "all") && (
					<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
						{searchTerm && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-xs">
								Search: {searchTerm}
								<button onClick={() => setSearchTerm("")} className="hover:text-primary">
									<XCircle className="h-3 w-3" />
								</button>
							</span>
						)}
						{cityFilter && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-xs">
								City: {cityFilter}
								<button onClick={() => setCityFilter("")} className="hover:text-primary">
									<XCircle className="h-3 w-3" />
								</button>
							</span>
						)}
						{stateFilter && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-xs">
								State: {stateFilter}
								<button onClick={() => setStateFilter("")} className="hover:text-primary">
									<XCircle className="h-3 w-3" />
								</button>
							</span>
						)}
						<button
							onClick={() => {
								setSearchTerm("");
								setCityFilter("");
								setStateFilter("");
								setStatusFilter("all");
							}}
							className="text-xs text-muted-foreground hover:text-primary"
						>
							Clear all
						</button>
					</div>
				)}
			</div>

			{/* Venues Grid */}
			{paginatedVenues.length === 0 ? (
				<div className="bg-card border rounded-lg p-12">
					<div className="text-center">
						<Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">No venues found</h3>
						<p className="text-muted-foreground">
							{statusFilter === "pending" && !searchTerm && !cityFilter && !stateFilter
								? "No venues are waiting for approval"
								: "Try adjusting your filters"}
						</p>
					</div>
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{paginatedVenues.map((venue) => (
							<div
								key={venue._id}
								className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
							>
								{/* Image */}
								<div className="relative h-48 bg-muted overflow-hidden">
									{venue.images && venue.images.length > 0 ? (
										<img
											src={venue.images[0]}
											alt={venue.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<Building2 className="h-12 w-12 text-muted-foreground/30" />
										</div>
									)}

									{/* Status Badge */}
									<div
										className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
											venue.status,
										)}`}
									>
										{venue.status?.toUpperCase()}
									</div>
								</div>

								{/* Content */}
								<div className="p-4">
									<div className="mb-3">
										<h3 className="font-semibold text-lg line-clamp-1 mb-1">{venue.name}</h3>
										<div className="flex items-center text-sm text-muted-foreground">
											<MapPin className="h-3 w-3 mr-1" />
											<span>
												{venue.address.city}, {venue.address.state}
											</span>
										</div>
									</div>

									<p className="text-sm text-muted-foreground line-clamp-2 mb-3">{venue.description}</p>

									{/* Sports */}
									<div className="flex flex-wrap gap-1 mb-3">
										{venue.sports.slice(0, 3).map((sport) => (
											<span
												key={sport}
												className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary"
											>
												{formatSportLabel(sport)}
											</span>
										))}
										{venue.sports.length > 3 && (
											<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
												+{venue.sports.length - 3}
											</span>
										)}
									</div>

									{/* Meta Info */}
									<div className="flex items-center justify-between text-xs text-muted-foreground pb-3 border-b">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											<span>Applied {new Date(venue.createdAt!).toLocaleDateString()}</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex gap-2 mt-3">
										<Button
											variant="outline"
											size="sm"
											className="flex-1"
											onClick={() => navigate(`/admin/venues/${venue._id}`)}
										>
											<Eye className="mr-1 h-3 w-3" />
											View
										</Button>
										{venue.status === "pending" && (
											<>
												<Button
													size="sm"
													className="flex-1 bg-green-500 hover:bg-green-600 text-white"
													onClick={() => setActionDialog({ open: true, type: "approve", venue })}
												>
													<CheckCircle className="mr-1 h-3 w-3" />
													Approve
												</Button>
												<Button
													variant="destructive"
													size="sm"
													className="flex-1"
													onClick={() => setActionDialog({ open: true, type: "reject", venue })}
												>
													<XCircle className="mr-1 h-3 w-3" />
													Reject
												</Button>
											</>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-8">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
								Previous
							</Button>

							<div className="flex gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "outline"}
										size="sm"
										className="w-8 h-8 p-0"
										onClick={() => handlePageChange(page)}
									>
										{page}
									</Button>
								))}
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								Next
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</>
			)}

			{/* Action Confirmation Dialog */}
			<Dialog
				open={actionDialog.open}
				onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, venue: null })}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{actionDialog.type === "approve" ? "Approve Venue" : "Reject Venue"}</DialogTitle>
						<DialogDescription>
							{actionDialog.type === "approve"
								? `Are you sure you want to approve "${actionDialog.venue?.name}"? This will allow the facility owner to start accepting bookings.`
								: `Are you sure you want to reject "${actionDialog.venue?.name}"? Please provide a reason for rejection.`}
						</DialogDescription>
					</DialogHeader>

					{actionDialog.type === "reject" && (
						<div className="space-y-2">
							<Label htmlFor="reason">Rejection Reason *</Label>
							<Textarea
								id="reason"
								placeholder="Please provide a detailed reason for rejection..."
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								className="resize-none"
							/>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setActionDialog({ open: false, type: null, venue: null });
								setRejectionReason("");
							}}
							disabled={actionLoading}
						>
							Cancel
						</Button>
						{actionDialog.type === "approve" ? (
							<Button
								className="bg-green-500 hover:bg-green-600 text-white"
								onClick={() => actionDialog.venue && handleApprove(actionDialog.venue)}
								disabled={actionLoading}
							>
								{actionLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Approving...
									</>
								) : (
									<>
										<CheckCircle className="mr-2 h-4 w-4" />
										Approve Venue
									</>
								)}
							</Button>
						) : (
							<Button
								variant="destructive"
								onClick={() => actionDialog.venue && handleReject(actionDialog.venue)}
								disabled={actionLoading || !rejectionReason.trim()}
							>
								{actionLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Rejecting...
									</>
								) : (
									<>
										<XCircle className="mr-2 h-4 w-4" />
										Reject Venue
									</>
								)}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FacilityApproval;
