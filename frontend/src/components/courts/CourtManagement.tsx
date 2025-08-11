import { useState, useEffect } from "react";
import { Plus, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import CourtCard from "./CourtCard";
import CourtForm from "./CourtForm";
import SlotConfigurationForm from "./SlotConfigurationForm";
import courtService, { type Court } from "@/services/court.service";
import { SportType } from "@/types/enums";
import { type Venue } from "@/services/venue.service";

interface CourtManagementProps {
	open: boolean;
	onClose: () => void;
	venue: Venue;
	onCourtsUpdate?: (courts: Court[]) => void;
}

const CourtManagement = ({ open, onClose, venue, onCourtsUpdate }: CourtManagementProps) => {
	const [courts, setCourts] = useState<Court[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCourtForm, setShowCourtForm] = useState(false);
	const [showScheduleForm, setShowScheduleForm] = useState(false);
	const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<Court | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (open && venue._id) {
			fetchCourts();
		}
	}, [open, venue._id]);

	const fetchCourts = async () => {
		try {
			setLoading(true);
			const fetchedCourts = await courtService.getCourtsByVenue(venue._id!);
			setCourts(fetchedCourts);
			onCourtsUpdate?.(fetchedCourts);
		} catch (error: any) {
			console.error("Error fetching courts:", error);
			toast.error("Failed to fetch courts");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCourt = async (courtData: Partial<Court>) => {
		try {
			const newCourt = await courtService.createCourt(venue._id!, courtData);
			const updatedCourts = [...courts, newCourt];
			setCourts(updatedCourts);
			onCourtsUpdate?.(updatedCourts);
			toast.success("Court created successfully");
			setShowCourtForm(false);
		} catch (error: any) {
			console.error("Error creating court:", error);
			toast.error(error.response?.data?.message || "Failed to create court");
			throw error;
		}
	};

	const handleUpdateCourt = async (courtData: Partial<Court>) => {
		if (!selectedCourt) return;

		try {
			const updatedCourt = await courtService.updateCourt(venue._id!, selectedCourt._id!, courtData);
			const updatedCourts = courts.map((c) => (c._id === updatedCourt._id ? updatedCourt : c));
			setCourts(updatedCourts);
			onCourtsUpdate?.(updatedCourts);
			toast.success("Court updated successfully");
			setShowCourtForm(false);
			setSelectedCourt(null);
		} catch (error: any) {
			console.error("Error updating court:", error);
			toast.error(error.response?.data?.message || "Failed to update court");
			throw error;
		}
	};

	const handleDeleteCourt = async () => {
		if (!deleteDialog) return;

		try {
			setDeleting(true);
			await courtService.deleteCourt(venue._id!, deleteDialog._id!);
			const updatedCourts = courts.filter((c) => c._id !== deleteDialog._id);
			setCourts(updatedCourts);
			onCourtsUpdate?.(updatedCourts);
			toast.success("Court deleted successfully");
			setDeleteDialog(null);
		} catch (error: any) {
			console.error("Error deleting court:", error);
			toast.error(error.response?.data?.message || "Failed to delete court");
		} finally {
			setDeleting(false);
		}
	};

	const handleUpdateSchedule = async (configurations: any[]) => {
		if (!selectedCourt) return;

		try {
			const updatedCourt = await courtService.updateCourt(venue._id!, selectedCourt._id!, {
				slotConfigurations: configurations,
			});
			const updatedCourts = courts.map((c) => (c._id === updatedCourt._id ? updatedCourt : c));
			setCourts(updatedCourts);
			onCourtsUpdate?.(updatedCourts);
			toast.success("Schedule updated successfully");
			setShowScheduleForm(false);
			setSelectedCourt(null);
		} catch (error: any) {
			console.error("Error updating schedule:", error);
			toast.error(error.response?.data?.message || "Failed to update schedule");
			throw error;
		}
	};

	const handleEditCourt = (court: Court) => {
		setSelectedCourt(court);
		setShowCourtForm(true);
	};

	const handleManageSchedule = (court: Court) => {
		setSelectedCourt(court);
		setShowScheduleForm(true);
	};

	// Get available sports (from venue sports that are not already used in courts)
	const getAvailableSports = (): SportType[] => {
		// For editing, allow the current sport
		if (selectedCourt) {
			return [selectedCourt.sportType];
		}

		// For new courts, show all venue sports (multiple courts can have same sport)
		return venue.sports as SportType[];
	};

	return (
		<>
			<Sheet open={open} onOpenChange={onClose}>
				<SheetContent className="w-full sm:w-[50%] sm:max-w-[50%] p-0">
					<SheetHeader className="px-6 pt-6 pb-4 border-b">
						<SheetTitle className="text-xl font-bold flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Manage Courts
						</SheetTitle>
						<SheetDescription>Add and configure courts for {venue.name}</SheetDescription>
					</SheetHeader>

					<ScrollArea className="h-[calc(100vh-200px)]">
						<div className="p-6">
							{loading ? (
								<div className="flex flex-col items-center justify-center py-16">
									<Loader2 className="h-8 w-8 animate-spin mb-4 text-muted-foreground" />
									<p className="text-muted-foreground">Loading courts...</p>
								</div>
							) : courts.length === 0 ? (
								<div className="text-center py-16 px-4">
									<Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
									<h3 className="text-lg font-semibold mb-2">No courts added yet</h3>
									<p className="text-muted-foreground mb-6 text-sm">Add your first court to start accepting bookings</p>
									<Button
										onClick={() => {
											setSelectedCourt(null);
											setShowCourtForm(true);
										}}
										disabled={venue.sports.length === 0}
										className="gradient-primary text-primary-foreground"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add First Court
									</Button>
									{venue.sports.length === 0 && (
										<p className="text-sm text-muted-foreground mt-4">Please add sports to your venue first</p>
									)}
								</div>
							) : (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									{courts.map((court) => (
										<CourtCard
											key={court._id}
											court={court}
											onEdit={handleEditCourt}
											onDelete={setDeleteDialog}
											onManageSchedule={handleManageSchedule}
										/>
									))}
								</div>
							)}
						</div>
					</ScrollArea>

					{/* Footer with Add Court button */}
					{courts.length > 0 && (
						<div className="border-t px-6 py-4 bg-background">
							<Button
								className="w-full"
								onClick={() => {
									setSelectedCourt(null);
									setShowCourtForm(true);
								}}
								disabled={venue.sports.length === 0}
							>
								<Plus className="mr-2 h-4 w-4" />
								Add New Court
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Court Form Dialog */}
			<CourtForm
				open={showCourtForm}
				onClose={() => {
					setShowCourtForm(false);
					setSelectedCourt(null);
				}}
				onSubmit={selectedCourt ? handleUpdateCourt : handleCreateCourt}
				court={selectedCourt}
				availableSports={getAvailableSports()}
			/>

			{/* Schedule Configuration Dialog */}
			{selectedCourt && (
				<SlotConfigurationForm
					open={showScheduleForm}
					onClose={() => {
						setShowScheduleForm(false);
						setSelectedCourt(null);
					}}
					onSubmit={handleUpdateSchedule}
					court={selectedCourt}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Court</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deleteDialog?.name}"? This will be a soft delete - existing bookings
							will be preserved but no new bookings can be made.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={deleting}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteCourt} disabled={deleting}>
							{deleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Court"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default CourtManagement;
