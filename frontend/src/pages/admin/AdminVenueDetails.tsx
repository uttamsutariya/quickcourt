import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	MapPin,
	Clock,
	ChevronLeft,
	CheckCircle,
	XCircle,
	Wifi,
	Car,
	Loader2,
	Eye,
	X,
	ImageIcon,
	User,
	Mail,
	Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import venueService, { type Venue } from "@/services/venue.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface AdminVenue extends Venue {
	owner?: {
		_id: string;
		name: string;
		email: string;
		phoneNumber?: string;
	};
}

// Amenity icons mapping
const AMENITY_ICONS: Record<string, any> = {
	Parking: Car,
	"Wi-Fi": Wifi,
	Default: CheckCircle,
};

const AdminVenueDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [venue, setVenue] = useState<AdminVenue | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [actionDialog, setActionDialog] = useState<{
		open: boolean;
		type: "approve" | "reject" | null;
	}>({
		open: false,
		type: null,
	});
	const [actionLoading, setActionLoading] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	useEffect(() => {
		if (id) {
			fetchVenueDetails();
		}
	}, [id]);

	const fetchVenueDetails = async () => {
		try {
			setLoading(true);
			// Try admin endpoint first, fallback to regular endpoint
			try {
				const response = await apiClient.get(`/admin/venues/${id}`);
				setVenue(response.data.venue);
			} catch (adminError) {
				// Fallback to regular venue endpoint
				const response = await venueService.getVenueById(id!);
				setVenue(response.venue as AdminVenue);
			}
		} catch (error: any) {
			console.error("Fetch venue error:", error);
			toast.error(error.message || "Failed to fetch venue details");
			navigate(-1);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async () => {
		if (!venue) return;

		setActionLoading(true);
		try {
			await apiClient.put(`/admin/venues/${venue._id}/approve`);
			toast.success(`${venue.name} has been approved successfully`);
			setActionDialog({ open: false, type: null });
			fetchVenueDetails();
		} catch (error: any) {
			console.error("Failed to approve venue:", error);
			toast.error(error.response?.data?.message || "Failed to approve venue");
		} finally {
			setActionLoading(false);
		}
	};

	const handleReject = async () => {
		if (!venue || !rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		setActionLoading(true);
		try {
			await apiClient.put(`/admin/venues/${venue._id}/reject`, {
				reason: rejectionReason,
			});
			toast.success(`${venue.name} has been rejected`);
			setActionDialog({ open: false, type: null });
			setRejectionReason("");
			fetchVenueDetails();
		} catch (error: any) {
			console.error("Failed to reject venue:", error);
			toast.error(error.response?.data?.message || "Failed to reject venue");
		} finally {
			setActionLoading(false);
		}
	};

	const getStatusBadge = (status?: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="secondary" className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						Pending Approval
					</Badge>
				);
			case "approved":
				return (
					<Badge className="bg-green-500 text-white flex items-center gap-1">
						<CheckCircle className="h-3 w-3" />
						Approved
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="destructive" className="flex items-center gap-1">
						<XCircle className="h-3 w-3" />
						Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="space-y-6">
					<Skeleton className="h-12 w-48" />
					<div className="grid lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							<Skeleton className="h-96 w-full" />
							<Skeleton className="h-48 w-full" />
						</div>
						<div className="space-y-6">
							<Skeleton className="h-40" />
							<Skeleton className="h-40" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!venue) {
		return (
			<div className="container mx-auto p-6">
				<Card className="p-12 text-center">
					<h3 className="text-xl font-semibold mb-2">Venue not found</h3>
					<Button onClick={() => navigate(-1)}>Go Back</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<Button variant="ghost" onClick={() => navigate("/admin/venues/approval")}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Venues
				</Button>
				{venue.status === "pending" && (
					<div className="flex gap-2">
						<Button
							className="bg-green-500 hover:bg-green-600 text-white"
							onClick={() => setActionDialog({ open: true, type: "approve" })}
						>
							<CheckCircle className="mr-2 h-4 w-4" />
							Approve
						</Button>
						<Button variant="destructive" onClick={() => setActionDialog({ open: true, type: "reject" })}>
							<XCircle className="mr-2 h-4 w-4" />
							Reject
						</Button>
					</div>
				)}
			</div>

			{/* Venue Info */}
			<div className="grid lg:grid-cols-3 gap-6">
				{/* Main Info */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-3xl">{venue.name}</CardTitle>
									<div className="flex items-center gap-2 mt-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											{venue.address.city}, {venue.address.state}
										</span>
										{getStatusBadge(venue.status)}
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2">Description</h3>
								<p className="text-muted-foreground">{venue.description}</p>
							</div>

							<div>
								<h3 className="font-semibold mb-2">Sports Available</h3>
								<div className="flex flex-wrap gap-2">
									{venue.sports.map((sport) => (
										<Badge key={sport} variant="secondary">
											{formatSportLabel(sport)}
										</Badge>
									))}
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-2">Amenities</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
									{venue.amenities.map((amenity) => {
										const Icon = AMENITY_ICONS[amenity] || AMENITY_ICONS.Default;
										return (
											<div key={amenity} className="flex items-center gap-2">
												<Icon className="h-4 w-4 text-primary" />
												<span className="text-sm">{amenity}</span>
											</div>
										);
									})}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Registration Details */}
					<Card>
						<CardHeader>
							<CardTitle>Registration Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground">Applied On</span>
								<span className="text-sm font-medium">
									{new Date(venue.createdAt!).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground">Last Updated</span>
								<span className="text-sm font-medium">
									{new Date(venue.updatedAt!).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground">Venue ID</span>
								<span className="text-sm font-mono">{venue._id}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Owner Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Owner Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{venue.owner ? (
								<>
									<div className="flex items-start gap-3">
										<User className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1">
											<p className="text-sm font-medium">{venue.owner.name}</p>
											<p className="text-xs text-muted-foreground">Facility Owner</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1">
											<p className="text-sm">{venue.owner.email}</p>
										</div>
									</div>
									{venue.owner.phoneNumber && (
										<div className="flex items-start gap-3">
											<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1">
												<p className="text-sm">{venue.owner.phoneNumber}</p>
											</div>
										</div>
									)}
								</>
							) : (
								<p className="text-sm text-muted-foreground">Owner ID: {venue.ownerId}</p>
							)}
						</CardContent>
					</Card>

					{/* Address Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Location</CardTitle>
						</CardHeader>
						<CardContent>
							<address className="not-italic text-sm space-y-1">
								<p className="font-medium">{venue.address.street}</p>
								<p>
									{venue.address.city}, {venue.address.state}
								</p>
								<p>{venue.address.zipCode}</p>
								<p>{venue.address.country}</p>
							</address>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					{venue.status === "pending" && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									className="w-full bg-green-500 hover:bg-green-600 text-white"
									onClick={() => setActionDialog({ open: true, type: "approve" })}
								>
									<CheckCircle className="mr-2 h-4 w-4" />
									Approve Venue
								</Button>
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => setActionDialog({ open: true, type: "reject" })}
								>
									<XCircle className="mr-2 h-4 w-4" />
									Reject Venue
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{/* Image Gallery */}
			<Card className="mt-6 overflow-hidden">
				<CardHeader>
					<CardTitle>Venue Images</CardTitle>
				</CardHeader>
				<CardContent>
					{venue.images && venue.images.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{venue.images.map((image, index) => (
								<div
									key={index}
									className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-muted"
									onClick={() => setSelectedImage(image)}
								>
									<img
										src={image}
										alt={`${venue.name} - Image ${index + 1}`}
										className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
										<Eye className="h-8 w-8 text-white" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
							<ImageIcon className="h-12 w-12 mb-3" />
							<p>No images available</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Image View Modal */}
			<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
				<DialogContent className="max-w-4xl p-0 overflow-hidden">
					<div className="relative">
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background"
							onClick={() => setSelectedImage(null)}
						>
							<X className="h-4 w-4" />
						</Button>
						{selectedImage && <img src={selectedImage} alt={`${venue.name} - Full view`} className="w-full h-auto" />}
					</div>
				</DialogContent>
			</Dialog>

			{/* Action Confirmation Dialog */}
			<Dialog
				open={actionDialog.open}
				onOpenChange={(open) => {
					if (!open) {
						setActionDialog({ open: false, type: null });
						setRejectionReason("");
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{actionDialog.type === "approve" ? "Approve Venue" : "Reject Venue"}</DialogTitle>
						<DialogDescription>
							{actionDialog.type === "approve"
								? `Are you sure you want to approve "${venue.name}"? This will allow the facility owner to start accepting bookings.`
								: `Are you sure you want to reject "${venue.name}"? Please provide a reason for rejection.`}
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
								setActionDialog({ open: false, type: null });
								setRejectionReason("");
							}}
							disabled={actionLoading}
						>
							Cancel
						</Button>
						{actionDialog.type === "approve" ? (
							<Button
								className="bg-green-500 hover:bg-green-600 text-white"
								onClick={handleApprove}
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
							<Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
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

export default AdminVenueDetails;
