import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	MapPin,
	Clock,
	ChevronLeft,
	Edit,
	Trash2,
	Calendar,
	CheckCircle,
	XCircle,
	Wifi,
	Car,
	Loader2,
	Eye,
	X,
	ImageIcon,
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

import venueService, { type Venue } from "@/services/venue.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import useAuthStore from "@/stores/auth-store";
import { toast } from "sonner";

// Amenity icons mapping
const AMENITY_ICONS: Record<string, any> = {
	Parking: Car,
	"Wi-Fi": Wifi,
	Default: CheckCircle,
};

const VenueDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [venue, setVenue] = useState<Venue | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialog, setDeleteDialog] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	useEffect(() => {
		if (id) {
			fetchVenueDetails();
		}
	}, [id]);

	const fetchVenueDetails = async () => {
		try {
			setLoading(true);
			const response = await venueService.getVenueById(id!);
			setVenue(response.venue);
		} catch (error: any) {
			console.error("Fetch venue error:", error);
			toast.error(error.message || "Failed to fetch venue details");
			navigate(-1);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!venue) return;

		setDeleting(true);
		try {
			await venueService.deleteVenue(venue._id!);
			toast.success("Venue deleted successfully");
			navigate("/owner/venues");
		} catch (error: any) {
			console.error("Delete venue error:", error);
			toast.error(error.message || "Failed to delete venue");
		} finally {
			setDeleting(false);
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

	// Check if current user is the owner
	const isOwner = user && venue && venue.ownerId === user._id;
	const isAdmin = user?.role === "admin";
	const isEndUser = user?.role === "user";
	const canEdit = isOwner || isAdmin;
	const isRejected = venue?.status === "rejected";

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="space-y-6">
					<Skeleton className="h-96 w-full" />
					<Skeleton className="h-20 w-full" />
					<div className="grid md:grid-cols-3 gap-6">
						<Skeleton className="h-40" />
						<Skeleton className="h-40" />
						<Skeleton className="h-40" />
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
				<Button variant="ghost" onClick={() => navigate(-1)}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				{canEdit && (
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => navigate(`/owner/venues/${venue._id}/edit`)}>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button>
						<Button variant="outline" onClick={() => setDeleteDialog(true)}>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				)}
			</div>

			{/* Rejection Notice for Owner */}
			{isRejected && isOwner && venue.rejectionReason && (
				<div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
					<div className="flex items-start gap-3">
						<XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<h3 className="text-base font-semibold mb-1">Venue Rejected</h3>
							<p className="text-sm text-muted-foreground mb-2">
								Your venue registration has been rejected by the admin. Please review the reason below and make
								necessary changes before resubmitting.
							</p>
							<div className="mt-3 p-3 rounded-md bg-background/50 border border-border">
								<p className="text-sm font-medium mb-1">Rejection Reason:</p>
								<p className="text-sm text-muted-foreground">{venue.rejectionReason}</p>
							</div>
						</div>
					</div>
				</div>
			)}

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

					{/* Courts Section (placeholder) */}
					<Card>
						<CardHeader>
							<CardTitle>Courts & Pricing</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								<Calendar className="h-12 w-12 mx-auto mb-3" />
								<p>Court information will be available soon</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Address Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Location</CardTitle>
						</CardHeader>
						<CardContent>
							<address className="not-italic text-sm space-y-1">
								<p>{venue.address.street}</p>
								<p>
									{venue.address.city}, {venue.address.state}
								</p>
								<p>{venue.address.zipCode}</p>
								<p>{venue.address.country}</p>
							</address>
						</CardContent>
					</Card>

					{/* Operating Hours (placeholder) */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Operating Hours</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>Monday - Friday</span>
									<span className="text-muted-foreground">6:00 AM - 10:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span>Saturday - Sunday</span>
									<span className="text-muted-foreground">7:00 AM - 11:00 PM</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Button */}
					{isEndUser && venue.status === "approved" && (
						<Button
							className="w-full gradient-primary text-primary-foreground"
							size="lg"
							onClick={() => toast.info("Booking feature coming soon!")}
						>
							<Calendar className="mr-2 h-5 w-5" />
							Book Now
						</Button>
					)}

					{/* Owner Info for Admin */}
					{isAdmin && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Owner Information</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">Owner ID: {venue.ownerId}</p>
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Venue</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{venue.name}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleting}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
							{deleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default VenueDetails;
