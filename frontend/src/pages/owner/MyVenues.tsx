import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { toast } from "sonner";
import { formatSportLabel } from "@/utils/sport-formatter";

const MyVenues = () => {
	const navigate = useNavigate();
	const [venues, setVenues] = useState<Venue[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; venue: Venue | null }>({
		open: false,
		venue: null,
	});
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		fetchVenues();
	}, []);

	const fetchVenues = async () => {
		try {
			setLoading(true);
			const response = await venueService.getMyVenues();
			setVenues(response.venues);
		} catch (error: any) {
			console.error("Fetch venues error:", error);
			toast.error(error.message || "Failed to fetch venues");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteDialog.venue) return;

		setDeleting(true);
		try {
			await venueService.deleteVenue(deleteDialog.venue._id!);
			toast.success("Venue deleted successfully");
			setDeleteDialog({ open: false, venue: null });
			fetchVenues(); // Refresh the list
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
				return <Badge variant="secondary">Pending Approval</Badge>;
			case "approved":
				return <Badge className="bg-green-500 text-white">Approved</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-40 w-full" />
							</CardContent>
							<CardFooter>
								<Skeleton className="h-10 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">My Venues</h1>
					<p className="text-muted-foreground mt-2">Manage your sports facilities</p>
				</div>
				<Button onClick={() => navigate("/owner/venues/new")} className="gradient-primary text-primary-foreground">
					<Plus className="mr-2 h-4 w-4" />
					Add New Venue
				</Button>
			</div>

			{/* Venues Grid */}
			{venues.length === 0 ? (
				<Card className="p-12">
					<div className="text-center">
						<Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">No venues yet</h3>
						<p className="text-muted-foreground mb-6">Start by adding your first sports facility</p>
						<Button onClick={() => navigate("/owner/venues/new")} className="gradient-primary text-primary-foreground">
							<Plus className="mr-2 h-4 w-4" />
							Add Your First Venue
						</Button>
					</div>
				</Card>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{venues.map((venue) => (
						<Card key={venue._id} className="overflow-hidden hover:shadow-lg transition-shadow">
							{/* Venue Image */}
							{venue.images && venue.images.length > 0 ? (
								<div className="aspect-video relative">
									<img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
									<div className="absolute top-2 right-2">{getStatusBadge(venue.status)}</div>
								</div>
							) : (
								<div className="aspect-video bg-muted flex items-center justify-center relative">
									<Building2 className="h-12 w-12 text-muted-foreground" />
									<div className="absolute top-2 right-2">{getStatusBadge(venue.status)}</div>
								</div>
							)}

							<CardHeader>
								<h3 className="text-lg font-semibold line-clamp-1">{venue.name}</h3>
								<div className="flex items-center text-sm text-muted-foreground mt-1">
									<MapPin className="h-3 w-3 mr-1" />
									<span className="line-clamp-1">
										{venue.address.city}, {venue.address.state}
									</span>
								</div>
							</CardHeader>

							<CardContent>
								<p className="text-sm text-muted-foreground line-clamp-2">{venue.description}</p>
								<div className="mt-3 flex flex-wrap gap-1">
									{venue.sports.slice(0, 3).map((sport) => (
										<Badge key={sport} variant="outline" className="text-xs">
											{formatSportLabel(sport)}
										</Badge>
									))}
									{venue.sports.length > 3 && (
										<Badge variant="outline" className="text-xs">
											+{venue.sports.length - 3} more
										</Badge>
									)}
								</div>
								<div className="mt-3 flex items-center text-xs text-muted-foreground">
									<Clock className="h-3 w-3 mr-1" />
									<span>Created {new Date(venue.createdAt!).toLocaleDateString()}</span>
								</div>
							</CardContent>

							<CardFooter className="border-t pt-4">
								<div className="flex gap-2 w-full">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => navigate(`/owner/venues/${venue._id}`)}
									>
										<Eye className="h-4 w-4 mr-1" />
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => navigate(`/owner/venues/${venue._id}/edit`)}
									>
										<Edit className="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button variant="outline" size="sm" onClick={() => setDeleteDialog({ open: true, venue })}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, venue: null })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Venue</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deleteDialog.venue?.name}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialog({ open: false, venue: null })} disabled={deleting}>
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

// Import Building2 icon
import { Building2 } from "lucide-react";

export default MyVenues;
