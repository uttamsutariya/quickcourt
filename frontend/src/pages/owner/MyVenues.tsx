import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, Building2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import VenueCard from "@/components/owner/VenueCard";
import venueService, { type Venue } from "@/services/venue.service";
import { toast } from "sonner";

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
			{/* Back Button */}
			<Button variant="ghost" onClick={() => navigate("/owner/dashboard")} className="mb-4">
				<ChevronLeft className="mr-2 h-4 w-4" />
				Back to Dashboard
			</Button>

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
						<VenueCard key={venue._id} venue={venue} onDelete={(venue) => setDeleteDialog({ open: true, venue })} />
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

export default MyVenues;
